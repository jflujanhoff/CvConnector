const express = require("express");
const router = express.Router();

// GET api/posts
// Test route
// PUBLIC
router.get("/", (req, res) => res.send("Posts route"));

module.exports = router;
