const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const Shop = require("../models/Shop");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getMyShopController,
  updateShopController,
  getShopsByPincodeController,
  getProductsByShopId,
} = require("../controllers/shopController");

// ✅ Multer setup
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ---------------- OWNER ROUTES ----------------

// Create shop
router.post("/setup", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, address, area, pincode, description } = req.body;

    if (req.user.role !== "shopowner")
      return res.status(403).json({ message: "Forbidden" });

    const existingShop = await Shop.findOne({ owner: req.user._id });
    if (existingShop)
      return res.status(400).json({ message: "Shop already exists" });

    const newShop = new Shop({
      name,
      address,
      area,
      pincode,
      description,
      image: req.file ? req.file.filename : null,
      owner: req.user._id,
    });

    await newShop.save();
    res.status(201).json(newShop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get my shop
router.get("/my-shop", authMiddleware, getMyShopController);

// Update my shop with optional image
router.put("/my-shop", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = req.file.filename;

    const shop = await Shop.findOneAndUpdate(
      { owner: req.user._id },
      updateData,
      { new: true }
    );

    res.json(shop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update shop" });
  }
});

// ---------------- PUBLIC ROUTES ----------------

// List all shops
// GET all approved shops grouped by pincode
router.get("/grouped-by-pincode", async (req, res) => {
  try {
    const shops = await Shop.find({
      isApproved: true,
      isBlocked: false,
    }).sort({ createdAt: -1 });

    const grouped = {};

    shops.forEach((shop) => {
      const key = shop.pincode || "Unknown";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(shop);
    });

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to group shops" });
  }
});


// List shops by pincode
router.get("/list/:pincode", getShopsByPincodeController);

// Shop products
router.get("/:shopId/products", getProductsByShopId);

// Shop by ID
router.get("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ message: "Invalid shop ID" });

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
