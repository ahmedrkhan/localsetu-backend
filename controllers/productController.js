const Product = require("../models/Product");
const Shop = require("../models/Shop");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;

        const shop = await Shop.findOne({ owner: req.user._id });
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        const product = await Product.create({
            name,
            price,
            description,
            stock: Number(stock),
            image: req.file ? req.file.filename : null,
            shop: shop._id,
            owner: req.user._id,
        });

        shop.products.push(product._id);
        await shop.save();

        // 🔴 THIS WAS MISSING
        return res.status(201).json({
            message: "Product created successfully",
            product,
        });

    } catch (err) {
        console.error("CREATE PRODUCT ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};



// GET PRODUCTS FOR LOGGED-IN SHOPOWNER
exports.getMyProducts = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user._id });
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        const products = await Product.find({ shop: shop._id });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET PRODUCTS BY SHOP ID (PUBLIC VIEW)
exports.getProductsByShop = async (req, res) => {
    try {
        const products = await Product.find({ shop: req.params.shopId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.stock = req.body.stock || product.stock;

        if (req.file) {
            product.image = req.file.filename;
        }

        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await product.deleteOne();
        res.json({ message: "Product deleted" });
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product)
            return res.status(404).json({ message: "Product not found" });

        // ownership check (critical)
        if (
            product.owner.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
