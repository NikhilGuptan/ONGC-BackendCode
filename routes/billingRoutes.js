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
                 WHERE yearmonth = ? AND calculationtype = 'Individual'`;

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
                 AND calculationtype = 'Individual' 
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

// API Route to Fetch Utilization Stats for a Specific Device
router.get("/utilizationStats", (req, res) => {
    const { month, deviceId } = req.query;
  
    // Ensure the month and deviceId parameters are provided
    if (!month || !deviceId) {
      return res.status(400).json({ error: "Both 'month' and 'deviceId' are required" });
    }
  
    // Query to get the consumed data
    const consumedQuery = `SELECT Consumed_GiB 
                           FROM device_consumption 
                           WHERE Device_ID = ? AND YearMonth = ? AND CalculationType = 'Group'`;
  
    // Query to get the total capacity data
    const capacityQuery = `SELECT Device_Capacity 
                           FROM device_consumption 
                           WHERE Device_ID = ? AND YearMonth = ? AND CalculationType = 'Group'`;
  
    // First query: Fetch the consumed data
    db.query(consumedQuery, [deviceId, month], (err, consumedResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      if (consumedResults.length === 0) {
        return res.status(404).json({ message: "Consumed data not found for this device" });
      }
  
      const consumedGiB = consumedResults[0].Consumed_GiB;
  
      // Second query: Fetch the total capacity data
      db.query(capacityQuery, [deviceId, month], (err, capacityResults) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
  
        if (capacityResults.length === 0) {
          return res.status(404).json({ message: "Capacity data not found for this device" });
        }
  
        const totalCapacity = capacityResults[0].Device_Capacity;
  
        // Respond with both consumed and total data
        res.json({
          deviceId,
          month,
          consumedGiB,
          totalCapacity,
          utilizationPercentage: ((consumedGiB / totalCapacity) * 100).toFixed(2), // Optional: Calculate utilization percentage
        });
      });
    });
  });

  // API Route to Fetch Switch Utilization Stats
router.get("/switchUtilizationStats", (req, res) => {
    const { month } = req.query;
  
    // Ensure the month parameter is provided
    if (!month) {
      return res.status(400).json({ error: "Month is required in YYYY-MM format" });
    }
  
    // Query template
    const query = `SELECT Device_Capacity, Ports_Used FROM device_consumption WHERE Device_ID = ? AND YearMonth = ? AND CalculationType = 'Group'`;
  
    // Fetch data for Device_ID 5 (Leaf Switch)
    db.query(query, [5, month], (err, leafResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const leafSwitch = leafResults.length > 0 ? leafResults[0] : { Device_Capacity: null, Ports_Used: null };
      
      // Fetch data for Device_ID 6 (SAN Switch)
      db.query(query, [6, month], (err, sanResults) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const sanSwitch = sanResults.length > 0 ? sanResults[0] : { Device_Capacity: null, Ports_Used: null };
        
        // Fetch data for Device_ID 8 (Utilization Stats)
        db.query(query, [8, month], (err, utilResults) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          const utilizationStats = utilResults.length > 0 ? utilResults[0] : { Device_Capacity: null, Ports_Used: null };
          
          // Combine and send the response
          res.json({
            month,
            leafSwitch: {
              deviceId: 5,
              name: "Leaf Switch",
              capacity: leafSwitch.Device_Capacity,
              portsUsed: leafSwitch.Ports_Used,
            },
            sanSwitch: {
              deviceId: 6,
              name: "SAN Switch",
              capacity: sanSwitch.Device_Capacity,
              portsUsed: sanSwitch.Ports_Used,
            },
            utilizationStats: {
              deviceId: 8,
              name: "Utilization Stats",
              capacity: utilizationStats.Device_Capacity,
              portsUsed: utilizationStats.Ports_Used,
            },
          });
        });
      });
    });
  });
  

module.exports = router;
