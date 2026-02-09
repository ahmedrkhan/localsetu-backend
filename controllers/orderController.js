const io = require("../socket"); // export io from server
exports.createOrder = async (req, res) => {
    const order = await Order.create({
        user: req.userId,
        ...req.body
    });

    // 🔥 notify owner
    io.to(order.shopId.toString()).emit("new-order", order);

    res.status(201).json({
        message: "Order placed",
        orderId: order._id
    });
};
