# CS-465-full-stack-development

# Travlr Getaways – Full Stack Web Application
This project was developed for a full-stack development course. It involved building a web application using two different approaches that supported both the customers and the administrators.

## Architecture
The customer-facing website uses Express with Handlebars templates to generate HTML pages on the server. Express handles incoming requests and provides the appropriate page to the user. The administrative side uses Angular to create a single-page application (SPA). Using components and routing, Angular updates the interface without reloading the entire page. Both allow users to interact with trip information in different ways.

MongoDB was used to provide a flexible way to store and manage the trip information. Unlike relational databases that organize records into tables, MongoDB stores information as documents containing different fields and values. Its document structure works well with the MEAN stack because it is similar to the JSON format. Mongoose was then used to manage records, define the Trip schema, and communicate with the database.

## How is JSON different from JavaScript? How does JSON tie frontend and backend together?
JavaScript and JSON serve different purposes. JavaScript creates the application logic, while JSON is a text-based format used to organize and exchange data.
In this project, JSON connects the frontend and backend through API requests and responses.
For example, when Angular requests trip information, the backend retrieves the trip from MongoDB and returns the data in JSON format. Angular then uses that information to display trip details in the administrative interface.

To improve functionality and reduce repeated code, the application was refactored by separating different responsibilities into models, services, and reusable components. As part of this process, trip information was moved from static HTML into MongoDB. This allowed the website to retrieve and display records dynamically.
The administrative interface was also divided into components such as TripListing, TripCard, and EditTrip. Each component handles a specific part of the interface, while the TripData service manages API requests and provides access to trip information.
By organizing the application this way, changes to one part of the code do not affect any other parts of the code. Reusable UI components also help reduce duplicated code and maintain consistency throughout the application. As a result, maintaining and updating the application became easier.

## Testing
To test the application, Postman was used to verify that the API endpoints worked correctly. An endpoint using a specific URL allows the application to access a resource, while an HTTP method determines what action should be performed. Different methods are used depending on what the application needs to retrieve, create, or update information.

For example, the application uses GET requests to retrieve trip information, POST requests to create new records, and PUT requests to update existing trips. Using Postman, these requests can be tested independently to verify that the backend returned the expected response. MongoDB Compass can then be used to confirm that any new records or changes to existing trips were saved correctly in the database.

Authentication was tested using JSON Web Tokens (JWT). After a successful login, it generates a token that Angular includes with requests to protected endpoints. Express verifies the token before allowing the requested operation to modify any data. Postman was then used to confirm that login returned a valid token and that authenticated requests could access protected endpoints.
