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
// GET all numbers (existing)
app.get('/numbers', async (req, res) => {
    try {
        const numbers = await NumberModel.find({}, 'value -_id');
        res.json({ numbers: numbers.map(n => n.value) });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET single number by value
app.get('/numbers/:value', async (req, res) => {
    try {
        const number = await NumberModel.findOne({ value: req.params.value });
        if (!number) return res.status(404).json({ error: 'Number not found' });
        res.json({ number: number.value });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST (existing)
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

// PUT update number
app.put('/numbers/:value', async (req, res) => {
    try {
        const { newValue } = req.body;
        if (typeof newValue !== 'number' || newValue < 10 || newValue > 99) {
            return res.status(400).json({ error: 'Please provide a valid 2-digit number' });
        }
        const updated = await NumberModel.findOneAndUpdate(
            { value: req.params.value },
            { value: newValue },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Number not found' });
        res.json({ message: 'Number updated', number: updated.value });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE number
app.delete('/numbers/:value', async (req, res) => {
    try {
        const deleted = await NumberModel.findOneAndDelete({ value: req.params.value });
        if (!deleted) return res.status(404).json({ error: 'Number not found' });
        res.json({ message: 'Number deleted', number: deleted.value });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});