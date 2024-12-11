const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const authMiddleware = require("../middlewares/auth");

// Get cart items for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }
    res.status(200).json({ success: true, items: cart.items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
});
 
// Add item to cart
router.post("/add", authMiddleware, async (req, res) => {
  const { productId, name, price, quantity, image } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, quantity, image });
    }

    await cart.save();
    res.status(201).json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding item to cart" });
  }
});

module.exports = router;
