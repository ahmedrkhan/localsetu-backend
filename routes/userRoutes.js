const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const User = require("../models/User");

router.put("/me", authMiddleware, async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        { new: true }
    );
    res.json(user);
});

module.exports = router;
