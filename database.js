const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configure Mongoose to Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Ideal', { useNewUrlParser: true })
    .then(response => {
        console.log("MongoDB connected successfully.");
    }).catch(err => {
        console.log("Database connection failed.");
    });

// Define a Mongoose schema and model
const textSchema = new mongoose.Schema({
    content: String,
});

const Text = mongoose.model('Text', textSchema);

// Configure Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the 'public' folder for static files
app.use(express.static('public'));

// Serve the 'addText.html' file for the GET request
app.get('/addText', (req, res) => {
    res.sendFile(__dirname + '/addText.html');
});

// Route to handle adding text via POST request
app.post('/addText', async (req, res) => {
    const { text } = req.body;

    try {
        const newText = new Text({ content: text });
        await newText.save();
        res.json({ message: 'Text saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving text' });
    }
});

// Default route
app.get('/', (req, res) => {
    res.send("Ski qka kqyr se tu bo o hehe 13666556<3");
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
