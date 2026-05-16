require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors");
const distances = require("./distances");
const Booking = require("./models/booking");

const User = require("./models/User");
const bcrypt = require("bcryptjs");
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

const app = express();

// ================= MONGODB CONNECT =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))

.catch(err => console.log("MongoDB Error ❌", err));
// ================= MIDDLEWARE =================
app.use(cors({
    origin:  "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options('*', cors());
app.use(express.json());

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// ================= CONTACT API =================
app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    console.log("📩 CONTACT RECEIVED:");
    console.log(name, email, message);

    res.json({
        success: true,
        message: "Message received successfully ✅"
    });
});



// ================= BOOKING API =================
app.post("/book", auth, async (req, res) => {
    try {

        console.log("🔥 API HIT RECEIVED");

        const { type , from, to, passengers, adults, children, infants, classType } = req.body;




        // ❌ HOTEL
        if (type === "hotel") {
            return res.json({
                success: false,
                message: "🏨 Hotel Booking Coming Soon!"
            });
        }

        // ❌ HOLIDAY
        if (type === "holiday") {
            return res.json({
                success: false,
                message: "🌴 Holiday Packages Coming Soon!"
            });
        }

// ✅ SAFE PASSENGER CALCULATION
const totalPassengers =
    (Number(adults) || 0) +
    (Number(children) || 0) +
    (Number(infants) || 0);

// ❌ EXTRA SAFETY CHECK
if (!type || !from || !to) {
    return res.json({
        success: false,
        message: "Invalid booking data ❌"
    });
}

if (totalPassengers === 0) {
    return res.json({
        success: false,
        message: "At least 1 passenger required ❌"
    });
}
console.log("USER ID SAVED:", req.user.id);
// ✅ DISTANCE LOGIC
const route = `${from.toLowerCase()}-${to.toLowerCase()}`;
const reverse = `${to.toLowerCase()}-${from.toLowerCase()}`;

const distance = distances[route] || distances[reverse];

if (!distance) {
    return res.json({
        success: false,
        message: "Route not found"
    });
}

// ✅ TRANSPORT
let transportRates = {
    flight: 5,
    train: 1.5,
    bus: 1,
    cab: 8
};

let pricePerKm = transportRates[type] || 1;

// ✅ CLASS
let classMultiplier = {
    economy: 1,
    premium: 1.5,
    business: 2.5,
    first: 4
};

let multiplier = classMultiplier[classType] || 1;

// ✅ BASE PRICE
const base = distance * pricePerKm;

// ✅ TOTAL PRICE
let total =
    (adults * base) +
    (children * base * 0.6) +
    (infants * base * 0.2);

total = total * multiplier;
        // ================= SAVE TO DATABASE =================
        const booking = new Booking({
            userId : req.user.id,
            type ,
            from,
            to,
            passengers: totalPassengers,
            adults: Number(adults) || 0,
            children: Number(children) || 0,
            infants: Number(infants) || 0,

            classType,
            price: Math.round(total)
        });
const saved = await booking.save();

        res.json({
            success: true,
            message: "Booking successful 🎉",
            data: saved
        });

    } catch (err) {
        console.log("❌ ERROR:", err);

       res.status(500).json({
    success: false,
    message: "Error saving booking"
}); 
    }
});

app.get("/bookings", auth, async (req, res) => {

    try {

        const data = await Booking.find({
            userId: req.user.id   // 🔥 FILTER
        }).sort({ createdAt: -1 });

        res.json(data);

    } catch (err) {
        res.status(500).json([]);
    }
});
// ================= SERVER START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
// ================= UPDATE BOOKING =================
app.put("/booking/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        const { adults, children, infants, classType, type, from, to } = req.body;

        // ✅ DISTANCE LOGIC
        const route = `${from.toLowerCase()}-${to.toLowerCase()}`;
        const reverse = `${to.toLowerCase()}-${from.toLowerCase()}`;

        const distance = distances[route] || distances[reverse] ;
if (!distance) {
    return res.json({
        success: false,
        message: "Route not found"
    });
}
        // ✅ TRANSPORT PRICING
        let transportRates = {
            flight: 5,
            train: 1.5,
            bus: 1,
            cab: 8
        };

        let pricePerKm = transportRates[type] || 1;

        // ✅ CLASS MULTIPLIER
        let classMultiplier = {
            economy: 1,
            premium: 1.5,
            business: 2.5,
            first: 4
        };

        let multiplier = classMultiplier[classType] || 1;

        const base = distance * pricePerKm;
let total =
    ((Number(adults) || 0) * base) +
    ((Number(children) || 0) * base * 0.6) +
    ((Number(infants) || 0) * base * 0.2);
        total = total * multiplier;
console.log("UPDATE USER:", req.user);
        const updatedData = {
            ...req.body,
            passengers:
    (Number(adults) || 0) +
    (Number(children) || 0) +
    (Number(infants) || 0),
            price: Math.round(total)
        };
        let filter = { _id: id };

// ✅ If NOT admin → restrict
if (req.user.role !== "admin") {
    filter.userId = req.user.id;
}

const updatedBooking = await Booking.findOneAndUpdate(
    filter,
    updatedData,
    { returnDocument: "after" }
);
        res.json({
            success: true,
            data: updatedBooking
        });

    } catch (err) {
        console.log("❌ UPDATE ERROR:", err);
        res.status(500).json({ success: false });
    }
});
// ================= DELETE BOOKING =================
app.delete("/booking/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

       let filter = { _id: id };

if (req.user.role !== "admin") {
    filter.userId = req.user.id;
}

const deleted = await Booking.findOneAndDelete(filter);

        if(!deleted){
            return res.json({
                success: false,
                message: "Not allowed ❌"
            });
        }

        res.json({
            success: true,
            message: "Deleted successfully 🗑️"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error deleting booking"
        });
    }
});

//////////////SIGN UP API /////////////////////////
app.post("/signup", async (req, res) => {
console.log("REQ BODY:", req.body);
    const { name, email, address, password } = req.body;

    try{

        const existing = await User.findOne({ email });

        if(existing){
            return res.json({ success:false, message:"User already exists" });
        }

const hashedPassword = await bcrypt.hash(password, 10);

const user = new User({
    name,
    email,
    address,
    password: hashedPassword
});
        await user.save();

        res.json({ success:true,
            message : "Account Created Successfully ✅"
         });

    }catch(err){
        console.log("SIGNUP ERROR:", err); 
        res.json({ success:false, message:"Signup Failed ❌" });
    }
});

///////////////////LOGIN API ////////////////////
app.post("/login", async (req, res) => {
console.log("Login Data:", req.body);
    const { email, password } = req.body;

    try{
        const user = await User.findOne({ email });

        if(!user){
            return res.json({ success:false, message:"User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({ success:false, message:"Wrong password" });
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role
        }, SECRET,
         { expiresIn: "7d" }
    );

        res.json({ success:true, 
            message : "Login Succesful ✅",
            token });

    }catch(err){
        console.log("LOGIN ERROR:", err); 
        res.json({ success:false,
            message : "Server Error during login ❌"
         });
    }
});
////////////databse user data//////////////
app.get("/all-users", auth, async (req, res) => {

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied ❌" });
    }

const users = await User.find().select("-password");
    res.json({
        success: true,
        data: users
    });
});

///////ADMIN PANEL////////////
app.get("/admin/bookings-with-users", auth, async (req, res) => {

    if (req.user.role !== "admin") {
        return res.status(403).json({ success:false, message: "Access denied ❌" });
    }

    try {

        const bookings = await Booking.find()
            .populate("userId", "name email") // ✅ attach user info
            .sort({ createdAt: -1 }); // ✅ latest first

        const users = await User.find(); // ✅ define users

        res.json({
            success: true,
            bookings,
            users
        });

    } catch (err) {
        res.status(500).json({ success:false, message:"Server error" });
    }
});
//////reset password//////////////
app.post("/reset-password", async (req, res) => {

    const { email, newPassword } = req.body;

    if(!email || !newPassword){
        return res.json({
            success:false,
            message:"Fill all fields ❌"
        });
    }

    try {
        const user = await User.findOne({ email });

        if(!user){
            return res.json({ success:false, message:"User not found ❌" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.json({
            success:true,
            message:"Password updated ✅ Please login again"
        });

    } catch(err){
        res.json({ success:false, message:"Error resetting password" });
    }
});
//////////////delete account//////////
app.delete("/delete-account", auth, async (req, res) => {
    try {

        await Booking.deleteMany({ userId: req.user.id }); // optional

        await User.findByIdAndDelete(req.user.id);

        res.json({
            success: true,
            message: "Account deleted successfully ❌"
        });

    } catch (err) {
        res.json({
            success: false,
            message: "Error deleting account"
        });
    }
});

