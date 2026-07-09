require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors");
const distances = require("./distances");
const placeToState = require("./placetostate");
const Booking = require("./models/booking");
const Contact = require("./models/contact");
const User = require("./models/user");
const bcrypt = require("bcryptjs");
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
const Feedback = require("./models/feedback");

const app = express();

// ================= MONGODB CONNECT =================
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB Connected ✅");
})
.catch(err => {
    console.log("MongoDB Error ❌");
    console.log(err);
});
// REPLACE your existing normalizePlace in server.js with this:
function normalizePlace(name) {
    return (name || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")   // strip special chars (matches frontend)
        .replace(/\s+/g, " ")       // collapse multiple spaces
        .trim();
}
// ================= MIDDLEWARE =================
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",

        "http://127.0.0.1:5501",
        "http://localhost:5500",

        "http://localhost:5501",
        "https://travelbharat02.netlify.app",//one frontend should be remove from here
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));

// ✅ HANDLE PREFLIGHT PROPERLY
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});
app.use(express.json());

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// ================= CONTACT API =================
app.post("/contact", async(req,res)=>{

    try{
console.log(req.body);
        const { name, email, message } = req.body;

        // SAVE TO DATABASE
        const newMessage = new Contact({
            name,
            email,
            message
        });

        await newMessage.save();
console.log("MESSAGE SAVED ✅");
        res.json({
            success:true,
            message:"Message received successfully ✅"
        });

    }catch(err){

        console.log("CONTACT ERROR:",err);

        res.status(500).json({
            success:false,
            message:"Server error ❌"
        });
    }

});


// ================= BOOKING API =================
// ================= BOOKING API =================
app.post("/book", auth, async (req, res) => {
    try {

        console.log("🔥 API HIT RECEIVED");

        let { type, from, to, adults, children, infants, classType } = req.body;

        // ================= CLEAN INPUT =================
        // In /book route - REPLACE the fromKey/toKey lines with:
const fromKey = normalizePlace(from);
const toKey   = normalizePlace(to);

let fromState = placeToState[fromKey] || fromKey;
let toState   = placeToState[toKey]   || toKey;

fromState = normalizePlace(fromState);
toState   = normalizePlace(toState);

        // ❌ INVALID CHECK
        if (!type || !from || !to) {
            return res.json({
                success: false,
                message: "Invalid booking data ❌"
            });
        }

        // ❌ SAME ROUTE CHECK
        if (fromState === toState) {
            return res.json({
                success: false,
                message: "Origin and destination cannot be same ❌"
            });
        }

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

        // ================= PASSENGERS =================
        const totalPassengers =
            (Number(adults) || 0) +
            (Number(children) || 0) +
            (Number(infants) || 0);

        if (totalPassengers === 0) {
            return res.json({
                success: false,
                message: "At least 1 passenger required ❌"
            });
        }

        console.log("USER ID SAVED:", req.user.id);

        // ================= ROUTE =================
        const route = `${fromState}-${toState}`;
        const reverse = `${toState}-${fromState}`;

        console.log("ROUTE:", route);
        console.log("REVERSE:", reverse);

        const distance =
            distances[route] ??
            distances[reverse] ??
            null;

        if (!distance) {
            return res.json({
                success: false,
                message: "Route not found ❌"
            });
        }
console.log("fromKey:", fromKey);
console.log("toKey:", toKey);
console.log("fromState:", fromState);
console.log("toState:", toState);
console.log("route:", route);
console.log("reverse:", reverse);
console.log("distance found:", distance);
        // ================= PRICING =================
        let transportRates = {
            flight: 5,
            train: 1.5,
            bus: 1,
            cab: 8
        };

        let pricePerKm = transportRates[type] || 1;

        let classMultiplier = {
            economy: 1,
            premium: 1.5,
            business: 2.5,
            first: 4
        };

        let multiplier = classMultiplier[classType] || 1;

        const base = distance * pricePerKm;

        let total =
            (adults * base) +
            (children * base * 0.6) +
            (infants * base * 0.2);

        total = total * multiplier;

        // ================= SAVE =================
        const booking = new Booking({
            userId: req.user.id,
            type,
            from,
            to,
            fromState,
            toState,
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
// ================FEEDBACK=================

app.post("/feedback", auth, async (req,res)=>{

    const user = await User.findById(req.user.id);
    const newFeedback = new Feedback({
        userId:req.user.id,
        name:user.name,
        email:user.email,
        rating:req.body.rating,
        feedback:req.body.feedback
    });

    await newFeedback.save();

    res.json({
        success:true
    });

});
// ================= SERVER START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
// ================= UPDATE BOOKING =================
// ================= UPDATE BOOKING =================
app.put("/booking/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        const { adults, children, infants, classType, type, from, to } = req.body;

       
// Same fix in PUT /booking/:id:
const fromKey = normalizePlace(from);
const toKey   = normalizePlace(to);
 if (!fromKey || !toKey) {
            return res.json({
                success: false,
                message: "Invalid route data ❌"
            });
        }

let fromState = placeToState[fromKey] || fromKey;
let toState   = placeToState[toKey]   || toKey;

fromState = normalizePlace(fromState);
toState   = normalizePlace(toState);
  // ❌ SAME ROUTE CHECK
        if (fromState === toState) {
            return res.json({
                success: false,
                message: "Origin and destination cannot be same ❌"
            });
        }
        // ================= ROUTE =================
        const route = `${fromState}-${toState}`;
        const reverse = `${toState}-${fromState}`;

        const distance =
            distances[route] ??
            distances[reverse] ??
            null;

        if (!distance) {
            return res.json({
                success: false,
                message: "Route not found ❌"
            });
        }

        // ================= PRICING =================
        let transportRates = {
            flight: 5,
            train: 1.5,
            bus: 1,
            cab: 8
        };

        let pricePerKm = transportRates[type] || 1;

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

        // ================= FILTER =================
        let filter = { _id: id };

        if (req.user.role !== "admin") {
            filter.userId = req.user.id;
        }

        // ================= UPDATE DATA =================
        const updatedData = {
            ...req.body,
            fromState,
            toState,
            passengers:
                (Number(adults) || 0) +
                (Number(children) || 0) +
                (Number(infants) || 0),
            price: Math.round(total)
        };

        const updatedBooking = await Booking.findOneAndUpdate(
            filter,
            updatedData,
            { new: true }
        );

        if (!updatedBooking) {
            return res.json({
                success: false,
                message: "Update failed ❌"
            });
        }

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
        }, process.env.JWT_SECRET,
         { expiresIn: "7d" }
    );

        res.json({ success:true, 
            message : "Login Succesful ✅",
            token });

    }catch(err){
        console.log("LOGIN ERROR:", err); 
        res.json({ success:false,
            message : err.message
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
