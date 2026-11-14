const mongoose = require('mongoose');
const Trip = require('../models/travlr'); // Register model
const Model = mongoose.model('trips');

// Makes special characters (like . * + ?) be treated as plain text
// in a search. Function taken from the MDN JavaScript documentation.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Function to convert a price from the URL into a number
// Returns null if the price is not a valid positive number (e.g., "abc" or "-5")
const parsePrice = (value) => {
    // Rejects prices that are not text or are empty
    if (typeof value !== 'string' || value.trim() === '') {
        return null;
    }

    const price = Number(value);   // Converts text to a number

    // Rejects prices that are not real numbers or are negative
    if (!Number.isFinite(price) || price < 0) {
        return null;
    }

    return price;
};

// GET: /trips
// Function to list all trips or only trips matching a keyword and/or price range
// (e.g., /trips?keyword=reef&minPrice=1000&maxPrice=2000)
const tripsList = async (req, res) => {
    try {
        // List of search conditions
        // Empty list returns all trips
        const conditions = [];
        const keyword = req.query.keyword;

        // Checks if the user provided a keyword
        if (keyword !== undefined) {

            // Check 1: Rejects keywords that are not text (e.g., ?keyword[$ne]=x)
            if (typeof keyword !== 'string') {
                return res.status(400).json({ message: 'Invalid search.' });
            }

            const cleanKeyword = keyword.trim();   // Removes extra spaces

            // Check 2: Rejects keywords longer than 50 characters
            if (cleanKeyword.length > 50) {
                return res.status(400).json({ message: 'Search must not be more than 50 characters.' });
            }

            // Searches only if the keyword is not empty
            // An empty search returns all trips
            if (cleanKeyword.length > 0) {
                const pattern = new RegExp(escapeRegex(cleanKeyword), 'i');
                conditions.push({ $or: [{ name: pattern }, { resort: pattern }] });
            }
        }

        // Prices start as null
        let minPrice = null;
        let maxPrice = null;

        // Checks if the user provided a minimum price
        // Empty price boxes are ignored
        if (req.query.minPrice !== undefined && req.query.minPrice !== '') {
            minPrice = parsePrice(req.query.minPrice);
            if (minPrice === null) {
                return res.status(400).json({ message: 'Minimum price must be a positive number.' });
            }
        }

        // Checks if the user provided a maximum price
        // Empty price boxes are ignored
        if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
            maxPrice = parsePrice(req.query.maxPrice);
            if (maxPrice === null) {
                return res.status(400).json({ message: 'Maximum price must be a positive number.' });
            }
        }

        // Rejects a minimum price that is higher than the maximum price
        if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
            return res.status(400).json({ message: 'Minimum price cannot be higher than maximum price.' });
        }

        // Prices are stored as text (e.g., "799.00")
        // $toDouble converts each price to a number before comparing
        if (minPrice !== null) {
            conditions.push({ $expr: { $gte: [{ $toDouble: '$perPerson' }, minPrice] } });
        }
        if (maxPrice !== null) {
            conditions.push({ $expr: { $lte: [{ $toDouble: '$perPerson' }, maxPrice] } });
        }

        // Combines all conditions so trips must match every one
        let filter = {};
        if (conditions.length > 0) {
            filter = { $and: conditions };
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