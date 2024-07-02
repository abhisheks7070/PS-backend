const express = require('express');
const mongoose = require('mongoose');
const Contact = require('./db');
const { z } = require('zod');
const cors = require('cors')
require("dotenv").config();

const app = express();
app.use(express.json());

// Middleware
const corsOptions = {
    // origin: "http://localhost:5173" // frontend URI (ReactJS)
    origin: ["https://pankaj-singh.onrender.com", "https://ps-agent.onrender.com"] // frontend URI (ReactJS)
}

app.use(cors());
app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;
// MongoDB connection

mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Zod schema
const contactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.optional(z.string()),
    phone: z.string().regex(/^\d+$/, { message: "Phone number should contain only digits" }).min(10, { message: "Phone number should be at least 10 digits" }),
    message: z.string().min(1, 'Message is required'),
});

// Routes
app.post('/contact', async (req, res) => {
    try {
        // Validate the request body
        const validatedData = contactSchema.parse(req.body);

        // Create a new contact
        const contact = new Contact(validatedData);
        await contact.save();

        res.status(200).json({ message: 'Your message has been sent successfully!' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});

// Route to fetch all contacts
app.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.status(200).json(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});
app.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Contact.findByIdAndDelete(id);
        res.status(200).json({ message: 'Contact deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
