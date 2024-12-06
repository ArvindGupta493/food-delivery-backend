const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const { isValidEmail, isValidPhone } = require("../utils/helper");
const User = require("../models/user");

const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "All fields are necessary",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Password must be atleast 8 characters long",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid email address",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Invalid phone number",
      });
    }

    const isExistingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (isExistingUser) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: "Email or Phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    await user.save();
    res
      .status(201)
      .json({ success: true, message: "User successfully created" });
  } catch (error) {
    console.log("the error is ", error);

    res
      .status(500)
      .json({
        success: false,
        status: 500,
        message: "Registration unsuccessfull",
      });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); 

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Invalid email or password ",
      });
    }
 
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Invalid email or password",
      });
    }

    // const token = jwt.sign(
    //   { userId: user._id.toString() },
    //   process.env.JWT_SECRET_KEY
    // );

    const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET_KEY, // Ensure this matches the key in your .env file
        { expiresIn: "1h" } // Optional: Token expiry time
    );
    // console.log("JWT_SECRET_KEY:", process.env.JWT_SECRET_KEY);


    return res
      .status(200)
      .json({
        success: true,
        message: "logged in successfully",
        token,
        userID: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
