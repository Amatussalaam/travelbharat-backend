const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// Contact API
app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    console.log("📩 New Contact Message:");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Message:", message);

    res.json({
        message: "Message received successfully ✅"
    });
});

// ✅ IMPORTANT: Render uses dynamic port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});