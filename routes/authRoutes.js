const express = require("express");
const router = express.Router();

const {
    registerController,
    loginController,
} = require("../controllers/authController");

const { authMiddleware } = require("../middlewares/authMiddleware");

// routes
router.post("/register", registerController);
router.post("/login", loginController);

// THIS WAS CRASHING
router.get("/me", authMiddleware, (req, res) => {
    res.json(req.user);
});

module.exports = router;
