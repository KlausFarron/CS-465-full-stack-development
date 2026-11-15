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
// Function to find one trip by its trip code (e.g., /trips/GALR210214)
// Returns the trip inside a list because the admin site reads it as value[0]
const tripsFindByCode = async (req, res) => {
    try {
        const trips = await Model
            .find({ 'code': req.params.tripCode })
            .exec();

        // Checks if no trip has this code
        if (trips.length === 0) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        return res.status(200).json(trips);

    } catch (err) {
        // Returns an error if the database request fails
        console.error(err);
        return res.status(500).json({ message: 'Unable to retrieve trip.' });
    }
};

// POST: /trips - Adds a new Trip
// Function to add a new trip to the database
const tripsAddTrip = async (req, res) => {
    try {
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

        const trip = await newTrip.save();   // Saves the trip to the database
        return res.status(201).json(trip);

    } catch (err) {
        // Checks if the trip is missing required information (e.g., no name)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Trip is missing required information.' });
        }

        // Returns an error if the database request fails
        console.error(err);
        return res.status(500).json({ message: 'Unable to add trip.' });
    }
};

// PUT: /trips/:tripCode - Updates an existing Trip
// Function to update a trip using its trip code
const tripsUpdateTrip = async (req, res) => {
    try {
        const trip = await Model
            .findOneAndUpdate(
                { 'code': req.params.tripCode },
                {
                    code: req.body.code,
                    name: req.body.name,
                    length: req.body.length,
                    start: req.body.start,
                    resort: req.body.resort,
                    perPerson: req.body.perPerson,
                    image: req.body.image,
                    description: req.body.description
                },
                {
                    returnDocument: 'after',   // Returns the trip after the update (not before))
                    runValidators: true    // Checks the update against the trip schema rules
                }
            )
            .exec();

        // Checks if no trip has this code
        if (trip === null) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        return res.status(200).json(trip);

    } catch (err) {
        // Checks if the update is missing required information
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Trip is missing required information.' });
        }

        // Returns an error if the database request fails
        console.error(err);
        return res.status(500).json({ message: 'Unable to update trip.' });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip
};