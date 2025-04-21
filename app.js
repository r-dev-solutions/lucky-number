require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Number model
// Renamed from 'Number' to 'NumberModel' to avoid conflict
const NumberModel = mongoose.model('Number', new mongoose.Schema({
  value: { type: Number, required: true, min: 10, max: 99 }
}));

// Update all references in your routes:
app.post('/numbers', async (req, res) => {
    try {
        const { number } = req.body;
        
        if (typeof number !== 'number' || number < 10 || number > 99) {
            return res.status(400).json({ error: 'Please provide a valid 2-digit number' });
        }
        
        const newNumber = await NumberModel.create({ value: number });
        res.status(201).json({ message: 'Number stored successfully', number: newNumber.value });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/numbers', async (req, res) => {
    try {
        const numbers = await NumberModel.find({}, 'value -_id');
        res.json({ numbers: numbers.map(n => n.value) });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});