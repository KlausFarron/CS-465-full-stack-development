const tripsEndpoint = 'http://localhost:3000/api/trips';
const options = {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
};

// Search boxes on the travel page form
const searchFields = ['keyword', 'minPrice', 'maxPrice'];

/* GET travel view */
// Function to display all trips or only trips matching the search
const travel = async function (req, res, next) {
    const params = new URLSearchParams();   // Search values to send to the API
    const search = {};                      // Search values to show back in the form
    let isSearching = false;                // True if the user filled in any search box

    // Copies each search box the user filled in
    for (const field of searchFields) {
        const value = req.query[field];

        // Skips empty boxes and anything that is not text
        if (typeof value === 'string' && value.trim() !== '') {
            params.append(field, value.trim());
            search[field] = value.trim();
            isSearching = true;
        }
    }

    try {
        // Sends the search to the API
        const response = await fetch(tripsEndpoint + '?' + params.toString(), options);
        const json = await response.json();

        let trips = [];
        let message = null;

        // Checks if the API rejected the search
        if (!response.ok) {
            message = json.message;
        }
        // Checks if no trips were returned
        else if (json.length === 0) {
            if (isSearching) {
                message = 'No trips found matching your search.';
            } else {
                message = 'No trips exist in our database!';
            }
        }
        // Trips were found
        else {
            trips = json;
        }

        res.render('travel', {
            title: 'Travlr Getaways',
            trips: trips,
            message: message,
            search: search,
            isSearching: isSearching
        });

    } catch (err) {
        // Shows an error message if the API could not be reached
        console.error(err);
        res.render('travel', {
            title: 'Travlr Getaways',
            trips: [],
            message: 'Unable to retrieve trips. Please try again later.',
            search: search,
            isSearching: isSearching
        });
    }
};

module.exports = {
    travel
};