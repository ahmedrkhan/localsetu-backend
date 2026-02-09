const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [{ name: String, qty: Number, price: Number }],
  total: Number,
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  address: String,
  phone: String,
  status: {
    type: String,
    enum: ["CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
    default: "CONFIRMED",
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // MUST exist
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
