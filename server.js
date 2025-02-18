require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});

// API Route to Fetch Total Cost
app.get("/totalCost", (req, res) => {
  const { month } = req.query; // Receiving month as "YYYY-MM" from query params

  // Ensure the month parameter is provided
  if (!month) {
    return res.status(400).json({ error: "Month is required in YYYY-MM format" });
  }

  const query = `SELECT SUM(Total_Charges) AS totalCost 
                 FROM billing_summary 
                 WHERE yearmonth = ? AND calculationtype = 'Group'`;

  db.query(query, [month], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ totalCost: results[0].totalCost });
  });
});

// API Route to Fetch Cost for a Specific Device
app.get("/totalCost/:deviceId", (req, res) => {
  const { deviceId } = req.params;
  const { month } = req.query;

  // Ensure the month parameter is provided
  if (!month) {
    return res.status(400).json({ error: "Month is required in YYYY-MM format" });
  }

  const query = `SELECT Total_Charges 
                 FROM billing_summary 
                 WHERE yearmonth = ? 
                 AND calculationtype = 'Group' 
                 AND Device_ID = ?`;

  db.query(query, [month, deviceId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json({ deviceId, totalCost: results[0].Total_Charges });
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
