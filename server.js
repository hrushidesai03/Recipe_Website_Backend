const express = require('express'); 
const mongoose = require('mongoose');
require('dotenv').config();
const Users = require('./Models/Users'); 
const Recipe = require('./Models/Create_Recipes'); 
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; 

// Welcome Route
app.get('/', (req, res) => {
    res.send('<h1 align=center><b><i>Welcome To Gourmand</i></b></h1>');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to the database');
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });


// Register API
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new Users({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
        console.log('Registration successful.');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Failed to register user.' });
    }
});



// Login API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, username: user.username }, 'your-secret-key', { expiresIn: '1h' });

        res.json({ message: 'Login successful.', token, username: user.username });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Failed to login.' });
    }
});



// Middleware to verify JWT token
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key'); // Replace with your actual secret key
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};



// Create Recipe API
app.post('/recipes', authenticateUser, async (req, res) => {
    const { name, description, ingredients, instructions, imageUrl, cookingTime, category } = req.body;

    try {
        // Create a new recipe
        const recipe = new Recipe({
            name,
            description,
            ingredients,
            instructions,
            imageUrl,
            cookingTime,
            category
        });

        
        await recipe.save();

        res.status(201).json({ message: 'Recipe created successfully!', recipe });
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ message: 'Failed to create recipe.' });
    }
});


// Get Recipes API (Fetch all or filtered by category and search query)
app.get('/recipes', async (req, res) => {
    const { category, searchQuery } = req.query; 
    try {
        
        let filter = {};

        if (category) {
            filter.category = category; 
        }

        if (searchQuery) {
            
            filter.$or = [
                { name: { $regex: searchQuery, $options: 'i' } }, 
                { description: { $regex: searchQuery, $options: 'i' } } 
            ];
        }

        
        const recipes = await Recipe.find(filter);

        res.json(recipes); 
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipes', error });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
