const express = require("express");
const db = require("../db/connection"); // Import the db connection

const router = express.Router();

// API Route to Fetch Total Cost
router.get("/totalCost", (req, res) => {
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
router.get("/totalCost/:deviceId", (req, res) => {
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

module.exports = router;
