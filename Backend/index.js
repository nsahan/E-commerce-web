// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const app = express();
const port = 4000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://nisurasahan12:GVXnPvIy3Srmx3Um@cluster0.o0m6a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

// Ensure upload directory exists
const uploadDir = "./upload/images";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// Serve uploaded images
app.use("/images", express.static(uploadDir));

// Root endpoint
app.get("/", (req, res) => {
  res.send("Express server is running");
});

// Product Schema
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

// Add product endpoint
app.post("/addproduct", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ id: 1 });
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save product",
    });
  }
});

// Upload image endpoint
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  res.status(200).json({
    success: true,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).json({ success: false, message: err.message });
  }
  next(err);
});

// Delete product endpoint
app.post("/remove", async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({
      success: true,
      message: `Product with ID ${req.body.id} removed`,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
});

// Get all products endpoint
app.get("/allproducts", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

// User Schema
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Signup endpoint
app.post("/signup", async (req, res) => {
  try {
    const check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res
        .status(400)
        .json({ success: false, errors: "Email already exists" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
    });

    await user.save();

    const data = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(data, "secret_ecom");
    res.json({ success: true, token });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Compare password
    if (user.password !== req.body.password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const data = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(data, "secret_ecom");
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// Get the new collection endpoint (latest 8 products)
app.get("/newcollection", async (req, res) => {
  try {
    const newcollection = await Product.find({})
      .sort({ date: -1 }) // Sort by the latest products first
      .limit(8); // Limit the results to 8 products

    res.json(newcollection);
  } catch (error) {
    console.error("Error fetching new collection:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch new collection" });
  }
});

// Add item to the cart endpoint
// Add item to the cart endpoint
app.post("/addtocart", async (req, res) => {
  try {
    const token = req.headers["auth-token"];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    // Verify the token and get user ID
    const verifiedUser = jwt.verify(token, "secret_ecom");

    if (!verifiedUser) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = verifiedUser.user.id;
    const { itemId } = req.body; // Extract item ID from request body

    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });
    }

    // Find user in the database
    const user = await Users.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update the cart with the item
    const cartData = user.cartData || {};
    cartData[itemId] = (cartData[itemId] || 0) + 1; // Increment item quantity in the cart

    user.cartData = cartData;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cartData: user.cartData, // Return updated cart data
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
});

// Remove item from cart endpoint
app.post("/removefromcart", async (req, res) => {
  try {
    const token = req.headers["auth-token"];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    // Verify the token and get user ID
    const verifiedUser = jwt.verify(token, "secret_ecom");

    if (!verifiedUser) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = verifiedUser.user.id;
    const { itemId } = req.body; // Extract item ID from request body

    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });
    }

    // Find user in the database
    const user = await Users.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update the cart to remove the item
    const cartData = user.cartData || {};
    if (cartData[itemId] && cartData[itemId] > 0) {
      cartData[itemId] -= 1; // Decrement the item quantity
      if (cartData[itemId] === 0) {
        delete cartData[itemId]; // Remove the item from the cart if quantity is 0
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Item not in cart or quantity is 0" });
    }

    user.cartData = cartData;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cartData: user.cartData, // Return updated cart data
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    });
  }
});


// Start server
app.listen(port, (error) => {
  if (!error) {
    console.log(`Server running on port ${port}`);
  } else {
    console.error("Error occurred while starting the server:", error);
  }
});
