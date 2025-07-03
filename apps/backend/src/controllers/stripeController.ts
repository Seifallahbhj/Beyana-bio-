import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Order, { IOrder } from "../models/Order.model";

// @desc    Créer une intention de paiement
// @route   POST /api/payment/create-payment-intent
// @access  Private
export const createPaymentIntent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { amount, currency, orderId } = req.body;

    if (!amount || !currency || !orderId) {
      res.status(400).json({
        success: false,
        message: "Please provide amount, currency, and orderId",
      });
      return;
    }

    const order: IOrder | null = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (order.isPaid) {
      res.status(400).json({
        success: false,
        message: "Order already paid",
      });
      return;
    }

    try {
      // Instancier Stripe dans la fonction pour permettre le mock Jest
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2025-06-30.basil",
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: { orderId },
      });

      if (!paymentIntent || !paymentIntent.id) {
        res.status(500).json({
          success: false,
          message: "Erreur lors de la création du paiement (id manquant)",
        });
        return;
      }
      order.paymentIntentId = paymentIntent.id;
      const _updatedOrder = await order.save();

      res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
    } catch (error: unknown) {
      // Gérer les erreurs Stripe
      if (error && typeof error === "object" && "type" in error) {
        // console.error("Error creating payment intent:", error);
        const stripeError = error as { type: string; message?: string };
        if (stripeError.type === "StripeInvalidRequestError") {
          res.status(400).json({
            success: false,
            message: stripeError.message || "Invalid request to Stripe",
          });
        } else {
          res.status(500).json({
            success: false,
            message: stripeError.message || "Stripe error occurred",
          });
        }
        return;
      } else if (error instanceof Error) {
        // console.error(
        //   "An unknown error occurred creating payment intent:",
        //   error
        // );
        res.status(500).json({
          success: false,
          message: error.message,
        });
        return;
      }

      // console.error(
      //   "An truly unknown error occurred creating payment intent:",
      //   error
      // );
      res.status(500).json({
        success: false,
        message: "An truly unknown error occurred creating payment intent",
      });
      return;
    }
  }
);

// @desc    Obtenir la clé publique Stripe
// @route   GET /api/payment/config
// @access  Public
export const getStripeConfig = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(200).json({
      publishableKey: process.env.STRIPE_PUBLISHable_KEY,
    });
  }
);

// @desc    Gérer les événements du webhook Stripe
// @route   POST /api/payment/webhook
// @access  Public
export const handleWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;

    try {
      // Instancier Stripe dans la fonction pour permettre le mock Jest
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2025-06-30.basil",
      });

      // Utilise le buffer brut du body (fourni par express.raw)
      const payload = req.body;
      event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // console.error(
      //   `An unknown error occurred during webhook verification: ${err}`
      // );
      res.status(400).send("Webhook Error: An unknown error occurred");
      return;
    }

    // Vérifier que l'événement a un type valide juste avant tout accès à event.type
    if (!event || !event.type || typeof event.type !== "string") {
      // console.error("[DEBUG STRIPE] Event absent ou type invalide", event);
      res.status(400).json({
        success: false,
        message: "Invalid event: missing or invalid type",
      });
      return;
    }

    // console.log(`Received Stripe event type: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // console.log(`PaymentIntent successful: ${paymentIntent.id}`);

        const order = await Order.findOne({
          paymentIntentId: paymentIntent.id,
        });

        if (order) {
          if (order.isPaid) {
            // console.log(`Order ${order._id} already paid. Skipping update.`);
            res.status(200).json({ received: true });
            return;
          }

          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: paymentIntent.receipt_email || "",
          };
          order.orderStatus = "Processing";

          const _updatedOrder = await order.save();
          // console.log(
          //   `Order ${_updatedOrder._id} updated to paid and processing.`
          // );
        } else {
          // console.warn(
          //   `Order not found for PaymentIntent ID: ${paymentIntent.id}. Looking for order in metadata.`
          // );
          if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
            const orderFromMetadata = await Order.findById(
              paymentIntent.metadata.orderId
            );
            if (orderFromMetadata) {
              if (orderFromMetadata.isPaid) {
                // console.log(
                //   `Order ${orderFromMetadata._id} already paid via metadata. Skipping update.`
                // );
                res.status(200).json({ received: true });
                return;
              }
              orderFromMetadata.isPaid = true;
              orderFromMetadata.paidAt = new Date();
              orderFromMetadata.paymentResult = {
                id: paymentIntent.id,
                status: paymentIntent.status,
                update_time: new Date().toISOString(),
                email_address: paymentIntent.receipt_email || "",
              };
              orderFromMetadata.orderStatus = "Processing";
              await orderFromMetadata.save();
              // console.log(
              //   `Order ${orderFromMetadata._id} updated to paid and processing via metadata.`
              // );
            } else {
              // console.error(
              //   `Order not found from metadata for PaymentIntent ID: ${paymentIntent.id}, Order ID: ${paymentIntent.metadata.orderId}`
              // );
            }
          } else {
            // console.error(
            //   `Order not found for PaymentIntent ID: ${paymentIntent.id} and no orderId in metadata.`
            // );
          }
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;

        // console.log(`PaymentIntent failed: ${failedPaymentIntent.id}`);

        let failedOrder = await Order.findOne({
          paymentIntentId: failedPaymentIntent.id,
        });

        if (
          !failedOrder &&
          failedPaymentIntent.metadata &&
          failedPaymentIntent.metadata.orderId
        ) {
          failedOrder = await Order.findById(
            failedPaymentIntent.metadata.orderId
          );
        }

        if (failedOrder) {
          failedOrder.orderStatus = "Payment Failed";
          failedOrder.isPaid = false;
          await failedOrder.save();
          // console.log(`Order ${failedOrder._id} marked as payment failed.`);
        } else {
          // console.warn(
          //   `Order not found for failed PaymentIntent ID: ${failedPaymentIntent.id}. No orderId found in metadata.`
          // );
        }
        break;
      }
      case "charge.succeeded": {
        const _chargeSucceeded = event.data.object as Stripe.Charge;

        // console.log(`Charge succeeded: ${_chargeSucceeded.id}`);
        break;
      }
      case "checkout.session.completed": {
        const _session = event.data.object as Stripe.Checkout.Session;

        // console.log(
        //   `Checkout session completed: ${_session.id}. Customer: ${_session.customer}`
        // );
        break;
      }
      default:
      // console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  }
);
