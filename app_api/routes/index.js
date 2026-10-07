const express = require("express");
const router = express.Router();

// Where we import the controllers we will route
const tripsController = require("../controllers/trips");

// Define route for trips endpoint
router
    .route('/trips')
    .get(tripsController.tripsList) // Get Method Routes triplist
    .post(tripsController.tripsAddTrip); // POST Method adds a trip

// GET Method routes tripsFindByCode - requires parameter
// PUT Method routes tripsUpdateTrip - requires parameter
router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(tripsController.tripsUpdateTrip);

module.exports = router;