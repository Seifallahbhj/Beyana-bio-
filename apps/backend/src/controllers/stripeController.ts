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

        // LOG DEBUG
        // console.log("[DEBUG STRIPE] payment_intent.succeeded, id:", paymentIntent.id, paymentIntent.metadata);

        const order = await Order.findOne({
          paymentIntentId: paymentIntent.id,
        });

        // console.log("[DEBUG STRIPE] Order found by paymentIntentId:", order ? order._id : "NOT FOUND");

        if (order) {
          if (order.isPaid) {
            // console.log("[DEBUG STRIPE] Order already paid, skipping");
            res.status(200).json({ received: true });
            return;
          }

          // console.log("[DEBUG STRIPE] Updating order to paid");
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: paymentIntent.receipt_email ?? undefined,
          };
          order.orderStatus = "Processing";
          await order.save();
          // console.log("[DEBUG STRIPE] Order updated successfully");

          res.status(200).json({ received: true });
          return;
        }

        // Fallback: try to find order by metadata
        if (paymentIntent.metadata?.orderId) {
          // console.log("[DEBUG STRIPE] Trying to find order by metadata.orderId:", paymentIntent.metadata.orderId);
          const orderByMetadata = await Order.findById(
            paymentIntent.metadata.orderId
          );
          // console.log("[DEBUG STRIPE] Order found by metadata:", orderByMetadata ? orderByMetadata._id : "NOT FOUND");

          if (orderByMetadata && !orderByMetadata.isPaid) {
            // console.log("[DEBUG STRIPE] Updating order by metadata to paid");
            orderByMetadata.isPaid = true;
            orderByMetadata.paidAt = new Date();
            orderByMetadata.paymentResult = {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: new Date().toISOString(),
              email_address: paymentIntent.receipt_email ?? undefined,
            };
            orderByMetadata.orderStatus = "Processing";
            await orderByMetadata.save();
            // console.log("[DEBUG STRIPE] Order by metadata updated successfully");
          }
        }

        res.status(200).json({ received: true });
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // LOG DEBUG
        // console.log("[DEBUG STRIPE] payment_intent.payment_failed, id:", paymentIntent.id, paymentIntent.metadata);

        const order = await Order.findOne({
          paymentIntentId: paymentIntent.id,
        });

        // console.log("[DEBUG STRIPE] Order found by paymentIntentId (failed):", order ? order._id : "NOT FOUND");

        if (order) {
          // console.log("[DEBUG STRIPE] Updating order to payment failed");
          order.orderStatus = "Payment Failed";
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: paymentIntent.receipt_email ?? undefined,
          };
          await order.save();
          // console.log("[DEBUG STRIPE] Order updated to payment failed successfully");

          res.status(200).json({ received: true });
          return;
        }

        // Fallback: try to find order by metadata
        if (paymentIntent.metadata?.orderId) {
          // console.log("[DEBUG STRIPE] Trying to find order by metadata.orderId (failed):", paymentIntent.metadata.orderId);
          const orderByMetadata = await Order.findById(
            paymentIntent.metadata.orderId
          );
          // console.log("[DEBUG STRIPE] Order found by metadata (failed):", orderByMetadata ? orderByMetadata._id : "NOT FOUND");

          if (orderByMetadata) {
            // console.log("[DEBUG STRIPE] Updating order by metadata to payment failed");
            orderByMetadata.orderStatus = "Payment Failed";
            orderByMetadata.paymentResult = {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: new Date().toISOString(),
              email_address: paymentIntent.receipt_email ?? undefined,
            };
            await orderByMetadata.save();
            // console.log("[DEBUG STRIPE] Order by metadata updated to payment failed successfully");
          }
        }

        res.status(200).json({ received: true });
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
