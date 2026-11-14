const mongoose = require('mongoose');
const Trip = require('../models/travlr'); // Register model
const Model = mongoose.model('trips');

// Makes special characters (like . * + ?) be treated as plain text
// in a search. Function taken from the MDN JavaScript documentation.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET: /trips
// Function to list all trips or only trips matching a keyword
const tripsList = async (req, res) => {
    try {
        // Start with an empty filter
        // Empty filter returns all trips
        let filter = {};
        const keyword = req.query.keyword;

        // Checks if the user provided a keyword
        if (keyword !== undefined) {

            // Check 1: Rejects keywords that are not text (e.g., ?keyword[$ne]=x)
            if (typeof keyword !== 'string') {
                return res.status(400).json({ message: 'Invalid search.' });
            }

            // Check 2: empty keywords and keywords longer than 50 characters
            const cleanKeyword = keyword.trim();
            if (cleanKeyword.length === 0 || cleanKeyword.length > 50) {
                return res.status(400).json({ message: 'Search must be 1 to 50 characters.' });
            }

            // Searches trip names and resorts for the keyword (not case sensitive)
            const pattern = new RegExp(escapeRegex(cleanKeyword), 'i');
            filter = { $or: [{ name: pattern }, { resort: pattern }] };
        }

        // Gets matching trips from the database
        const trips = await Model.find(filter).exec();
        return res.status(200).json(trips);

    } catch (err) {
        // Returns an error if the database request fails
        console.error(err);
        return res.status(500).json({ message: 'Unable to retrieve trips.' });
    }
};

// GET: /trips/:tripCode - lists a single trip
// Regardless of outcome, response must include HTML status code
// and JSON message to the requesting client
const tripsFindByCode = async(req, res) => {
    const q = await Model
        .find({'code' : req.params.tripCode }) // Return single record
        .exec();

    // Uncomment the following line to show results of query
    // on the console
    // console.log(q);

    if(!q)
    { // Database returned no data
        return res
            .status(404)
            .json(err);
    } else { // Return resulting trip list
        return res
            .status(200)
            .json(q);
    }
};

// POST: /trips - Adds a new Trip
// Regardless of outcome, response must include HTML status code
// and JSON message to the requesting client
const tripsAddTrip = async(req, res) => {
    const newTrip = new Trip({
        code: req.body.code,
        name: req.body.name,
        length: req.body.length,
        start: req.body.start,
        resort: req.body.resort,
        perPerson: req.body.perPerson,
        image: req.body.image,
        description: req.body.description
    });

    const q = await newTrip.save();

    if(!q)
    { // Database returned no data
        return res
            .status(400)
            .json(err);
    } else { // Return new trip
        return res
            .status(201)
            .json(q);
    }

    // Uncomment the following line to show results of operation
    // on the console
    // console.log(q);
};

// PUT: /trips/:tripCode - Adds a new Trip
// Regardless of outcome, response must include HTML status code
// and JSON message to the requesting client
const tripsUpdateTrip = async(req, res) => {

    // Uncomment for debugging
    console.log(req.params);
    console.log(req.body);

    const q = await Model
        .findOneAndUpdate(
            { 'code' : req.params.tripCode },
            {
                code: req.body.code,
                name: req.body.name,
                length: req.body.length,
                start: req.body.start,
                resort: req.body.resort,
                perPerson: req.body.perPerson,
                image: req.body.image,
                description: req.body.description
            }
        )
        .exec();

    if(!q)
    { // Database returned no data
        return res
            .status(400)
            .json(err);
    } else { // Return resulting updated trip
        return res
            .status(201)
            .json(q);
    }

    // Uncomment the following line to show results of operation
    // on the console
    // console.log(q);
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip
};