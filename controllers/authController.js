const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper
const generateToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

// Hardcoded admin
const adminCredentials = {
    email: "adminahmed@gmail.com",
    password: "8009089273",
    name: "Admin",
};

// Register
exports.registerController = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role)
            return res.status(400).json({ message: "All fields are required" });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password,
            role,
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopId: user.shopId || null,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login (updated for hardcoded admin)
exports.loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        // Hardcoded admin
        if (email === adminCredentials.email && password === adminCredentials.password) {
            const token = generateToken("admin-id", "admin");
            return res.status(200).json({
                token,
                user: {
                    id: "admin-id",
                    name: adminCredentials.name,
                    email: adminCredentials.email,
                    role: "admin",
                },
            });
        }

        // Normal DB login
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "User not found" });
        if (user.isBlocked)
            return res.status(403).json({ message: "User blocked by admin" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Wrong password" });

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
