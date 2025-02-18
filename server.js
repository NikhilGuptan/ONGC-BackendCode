require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const billingRoutes = require("./routes/billingRoutes");

// Use routes
app.use("/api/billing", billingRoutes); // Grouped under /api/billing route

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
