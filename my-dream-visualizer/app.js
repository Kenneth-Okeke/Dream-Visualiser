require('dotenv').config(); // Ensure this is at the top
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');

const app = express();
const PORT = process.env.PORT || 3000;

// Auth0 configuration
const config = {
  authRequired: false, // Not all routes require authentication
  auth0Logout: true,
  secret: process.env.AUTH0_CLIENT_SECRET,
  baseURL: process.env.BASE_URL, // This should match your application's root URL
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

// Apply middleware
app.use(auth(config));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// Homepage route
app.get('/', (req, res) => {
  res.render('index'); // Assumes index.ejs exists with a link/button to /visualize-dream
});

// Visualization page - protected by authentication
app.get('/visualize-dream', requiresAuth(), (req, res) => {
  res.render('visualize-dream'); // Assumes visualize-dream.ejs exists
});

// Optional: POST route if your visualization involves form submission
// app.post('/visualize-dream', requiresAuth(), (req, res) => {
//   // Process dream visualization submission here...
//   res.send('Dream visualization processed.');
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post('/visualize-dream', requiresAuth(), (req, res) => {
  // If this point is reached, the user is authenticated
  // Process the submitted dream data here
  // For example, you might save the data to a database, call an API, etc.

  // After processing, you can redirect the user to a confirmation page, or display a message, etc.
  res.send("Dream visualization submitted successfully.");
});
