require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Auth0 configuration
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_CLIENT_SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

app.use(auth(config));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

// Merge the duplicate /visualize-dream POST handlers into one
app.post('/visualize-dream', requiresAuth(), async (req, res) => {
    const dreamDescription = req.body.dream;
    try {
        const imageUrl = await generateImage(dreamDescription); // Ensure this calls the correct function
        res.redirect(`/result?imageUrl=${encodeURIComponent(imageUrl)}`); // Redirect to the result page
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while generating the image.");
    }
});

// Function to call DALL·E API
async function generateImage(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024"
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.data[0].url; // Assuming the API returns a URL to the generated image
    } catch (error) {
      console.error('Error generating image:', error.response ? error.response.data : error);
      throw error;
  }  
}

app.get('/result', requiresAuth(), (req, res) => {
    const imageUrl = req.query.imageUrl; // Retrieves the image URL from the query parameters
    res.render('result', { imageUrl }); // Passes the image URL to the 'result.ejs' template
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
