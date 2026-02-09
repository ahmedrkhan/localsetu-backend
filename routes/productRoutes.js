const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/authMiddleware");
const {
    createProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");
const { getProductById } = require("../controllers/productController");


const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/create", authMiddleware,
    upload.single("image"),
    createProduct
);
router.get("/mine", authMiddleware, getMyProducts);

router.get("/:id", authMiddleware, getProductById);

router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),
    updateProduct
);
router.delete("/:id", authMiddleware, deleteProduct);


module.exports = router;
