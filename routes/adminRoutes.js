const router = require("express").Router();
const Shop = require("../models/Shop");
const User = require("../models/User");
const { authMiddleware } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// GET all users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// GET all shops
router.get("/shops", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch {
    res.status(500).json({ message: "Failed to fetch shops" });
  }
});

// Approve shop
router.put("/shop/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json(shop);
});

// Block shop
router.put("/shop/:id/block", authMiddleware, adminMiddleware, async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
  res.json(shop);
});

// Unblock shop ✅
router.put("/shop/:id/unblock", authMiddleware, adminMiddleware, async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
  res.json(shop);
});

// Delete shop
router.delete("/shop/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await Shop.findByIdAndDelete(req.params.id);
  res.json({ message: "Shop deleted" });
});


// block user
router.put("/user/:id/block", authMiddleware, adminMiddleware, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  );
  res.json(user);
});

// unblock user
router.put("/user/:id/unblock", authMiddleware, adminMiddleware, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false },
    { new: true }
  );
  res.json(user);
});

module.exports = router;
