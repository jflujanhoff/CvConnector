const express = require("express");
const connectDB = require("./config/db");

const app = express();

//Connect Database
connectDB();

//User data from request
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("Application running"));

app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Running in PORT: ${PORT}`));
