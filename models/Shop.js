const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true   // ONE SHOP PER USER

    },
    name: String,
    image: { type: String }, // filename
    address: String,
    pincode: String,
    area: String,
    description: String,
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isApproved: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    }


}, { timestamps: true });

shopSchema.index({ owner: 1 }, { unique: true });

module.exports = mongoose.model("Shop", shopSchema);
