const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

// GET api/auth
// Test route
// PUBLIC
router.get("/", auth, async (req, res) => {
  const id = req.user.id;

  try {
    const user = await User.findById(id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({ msg: error });
  }
});

// POST api/auth
// Login user
// PUBLIC
router.post(
  "/",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists already
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials 1" }] });
      }

      // Decrypt password

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials 2" }] });
      }

      // Return jsonwebtoken
      const palyload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        palyload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            console.log(err);
            throw err;
          }
          console.log(token);
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
