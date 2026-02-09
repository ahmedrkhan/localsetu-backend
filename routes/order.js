const express = require("express");
const Order = require("../models/Orders");
const Shop = require("../models/Shop");
const { authMiddleware: protect } = require("../middlewares/authMiddleware");

module.exports = (io) => {
    const router = express.Router();

    // CREATE ORDER
    router.post("/create", protect, async (req, res) => {
        try {
            const { items, total, shopId, address, phone } = req.body;
            if (!items || !total || !shopId) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const order = await Order.create({
                items,
                total,
                shopId,
                address,
                phone,
                user: req.user._id,
            });

            // Real-time notify shop owner
            io.to(shopId.toString()).emit("new-order", order);

            res.status(201).json(order);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Order creation failed" });
        }
    });

    // GET ORDERS BY SHOP
    router.get("/shop/:shopId", async (req, res) => {
        try {
            const orders = await Order.find({ shopId: req.params.shopId }).sort({ createdAt: -1 });
            res.json(orders);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch orders" });
        }
    });

    // GET logged-in user's orders
    // GET current user's orders
    router.get("/my", protect, async (req, res) => {
        try {
            const orders = await Order.find({ user: req.user._id })
                .sort({ createdAt: -1 });
            res.json(orders);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to fetch orders" });
        }
    });

    // TRACK ORDER BY ID
    router.get("/track/:orderId", async (req, res) => {
        try {
            const order = await Order.findById(req.params.orderId);
            if (!order) return res.status(404).json({ message: "Order not found" });

            res.json({
                _id: order._id,
                status: order.status,
                items: order.items,
                total: order.total,
                address: order.address,
                phone: order.phone,
                createdAt: order.createdAt,
                estimatedDelivery: order.estimatedDelivery || "3-5 business days",
                userName: order.userName || "Guest",
            });
        } catch (err) {
            res.status(400).json({ message: "Invalid Order ID" });
        }
    });

    // UPDATE ORDER STATUS (for shop owner)
    router.put("/:id/status", protect, async (req, res) => {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const shop = await Shop.findById(order.shopId);
        if (req.user._id.toString() !== shop.owner.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        order.status = status;
        await order.save();

        io.to(order.user.toString()).emit("order-updated", order);

        res.json(order);
    });

    return router;
};
