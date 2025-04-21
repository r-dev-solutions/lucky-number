require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');  // Add this line

const app = express();
app.use(cors());  // Add this line to enable CORS for all routes
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Number model
// Renamed from 'Number' to 'NumberModel' to avoid conflict
// Update the Number model schema
const NumberModel = mongoose.model('Number', new mongoose.Schema({
  value: { type: Number, required: true, min: 0, max: 99 }  // Changed min from 10 to 0
}));

// Update all route validations:
app.post('/numbers', async (req, res) => {
    try {
        const { number } = req.body;
        if (typeof number !== 'number' || number < 0 || number > 99) {  // Changed from 10 to 0
            return res.status(400).json({ error: 'Please provide a valid number between 00 and 99' });
        }
        const newNumber = await NumberModel.create({ value: number });
        res.status(201).json({ message: 'Number stored successfully', number: newNumber.value });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/numbers/:value', async (req, res) => {
    try {
        const { newValue } = req.body;
        if (typeof newValue !== 'number' || newValue < 0 || newValue > 99) {  // Changed from 10 to 0
            return res.status(400).json({ error: 'Please provide a valid number between 00 and 99' });
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