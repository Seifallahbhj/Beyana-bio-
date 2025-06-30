const mongoose = require("mongoose");
require("dotenv").config();

// Modèle Order simplifié pour la vérification
const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: String,
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },
  totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  orderStatus: { type: String, default: "Pending" },
  paymentIntentId: String,
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Récupérer les 5 dernières commandes
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "firstName lastName email")
      .populate("orderItems.product", "name price");

    console.log("\n📋 DERNIÈRES COMMANDES:");
    console.log("========================");

    if (recentOrders.length === 0) {
      console.log("❌ Aucune commande trouvée");
      return;
    }

    recentOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Commande #${order._id}`);
      console.log(
        `   Utilisateur: ${order.user?.firstName} ${order.user?.lastName} (${order.user?.email})`
      );
      console.log(`   Statut: ${order.orderStatus}`);
      console.log(`   Payée: ${order.isPaid ? "✅ OUI" : "❌ NON"}`);
      console.log(`   Date: ${order.createdAt.toLocaleString()}`);
      console.log(`   Total: ${order.totalPrice}€`);
      console.log(`   PaymentIntent: ${order.paymentIntentId || "N/A"}`);

      if (order.orderItems.length > 0) {
        console.log(`   Produits: ${order.orderItems.length} article(s)`);
        order.orderItems.forEach((item) => {
          console.log(
            `     - ${item.product?.name} (x${item.quantity}) - ${item.price}€`
          );
        });
      }
    });
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Déconnecté de MongoDB");
  }
}

checkOrders();
