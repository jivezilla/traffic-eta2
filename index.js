//---------------------------------------------------
// 1) IMPORT DEPENDENCIES
//---------------------------------------------------
const express = require('express');
const fetch = require('node-fetch'); // v2, so require() works

const app = express();
app.set('view engine', 'ejs'); // let express know we use EJS templates
app.use(express.static('public')); // optional: if you later want a 'public' folder for CSS/img

// Replace with your real origin/destination
const ORIGIN = '221 Corley Mill Rd, Lexington, SC';
const DESTINATION = '1515 Main St, Columbia, SC';

// Replace with your real Google Distance Matrix API key
const API_KEY = 'AIzaSyDSjcIsQxjIkd9ReFTxiCcS7_JHhSMQmXY';

// Root route
app.get('/', async (req, res) => {
  try {
    // Construct Distance Matrix API URL
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${encodeURIComponent(ORIGIN)}&destinations=${encodeURIComponent(DESTINATION)}&departure_time=now&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'OK') {
      return res.send(`Error from Google API: ${data.status}`);
    }

    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      return res.send(`Route error: ${element.status}`);
    }

    const durationText = element.duration_in_traffic
      ? element.duration_in_traffic.text
      : element.duration.text;
    const distanceText = element.distance.text;

    // Render the 'index.ejs' template, passing dynamic variables
    res.render('index', {
      origin: ORIGIN,
      destination: DESTINATION,
      duration: durationText,
      distance: distanceText
    });
  } catch (err) {
    console.error(err);
    res.send(`Server Error: ${err.message}`);
  }
});

// Use process.env.PORT if on Railway, else 3000 locally
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Live ETA app listening on port ${port}`);
});
