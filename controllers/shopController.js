const Shop = require("../models/Shop");
const Product = require("../models/Product");

exports.setupShopController = async (req, res) => {
    console.log("Received file:", req.file); // check if multer received it
    try {
        const { name, address, area, pincode, description } = req.body;

        if (req.user.role !== "shopowner")
            return res.status(403).json({ message: "Forbidden" });

        const existing = await Shop.findOne({ owner: req.user._id });
        if (existing) return res.status(400).json({ message: "Shop already exists" });

        const shop = await Shop.create({
            owner: req.user._id,
            name,
            address,
            image: req.file ? req.file.filename : null, // ✅ save filename            area,
            pincode,
            description
        });

        res.status(201).json(shop);
        console.log("Received file:", req.file);

    } catch (err) {
        res.status(500).json({ message: err.message });
        console.error("ERROR IN SETUP SHOP:", err);
        console.log("Received file:", req.file);

    }
};

exports.getMyShopController = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user._id });
        if (!shop) return res.status(404).json({ message: "No shop found" });
        const products = await Product.find({ shop: shop._id });
        res.json({ ...shop._doc, products });
        console.log("Received file:", req.file);

    } catch (err) {
        res.status(500).json({ message: err.message }); console.log("Received file:", req.file);

    }
};

exports.updateShopController = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user._id });
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        const allowed = ["name", "address", "area", "pincode", "description"];
        allowed.forEach(field => {
            if (req.body[field] !== undefined) {
                shop[field] = req.body[field];
            }
        });
        // Handle image update
        if (req.file) shop.image = req.file.filename;
        await shop.save();
        res.json(shop);
        console.log("Received file:", req.file);

    } catch (err) {
        res.status(500).json({ message: err.message });
        console.log("Received file:", req.file);

    }
};

exports.getShopsByPincodeController = async (req, res) => {
    try {
        const shops = await Shop.find({ pincode: req.params.pincode });
        res.json(shops);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProductsByShopId = async (req, res) => {
    try {
        const products = await Product.find({ shop: req.params.shopId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
