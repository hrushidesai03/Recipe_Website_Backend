const express = require('express'); 
const mongoose = require('mongoose');
require('dotenv').config();
const Users = require('./Models/Users');
const Create_Recipes = require('./Models/Create_Recipes');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const Port = 3000;

app.get('/', (req, res) => {
    res.send('<h1 align=center> <b> <i>Welcome To Gourmand</b></i></h1>');
});


mongoose.connect(process.env.MONGO_URL).then(
    ()=> {
        console.log('Connected to the database');
    }
).catch((err) => {
    console.log('Error: ', err);
});



app.post('/register', async(req, res) => {
    const {username, email, password} = req.body;
    const user = new Users({
        username,
        email,
        password
    });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new Users({
            username,
            email,
            password: hashedPassword
        });
        await user.save();

        res.json({message: "User registered ....."});
        console.log('registration successful....');


    } 
    
    catch (error) { 

        console.log(error);
    }
});


app.post('/login', async(req, res) => {
    const {email, password} = req.body;
    

    try {
        const user = await Users.findOne({email});
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({message: "Invalid credentials"});
        }
        res.json({message: "Login Successful", username: user.username});
        
    }
    catch (error) {
            console.log(error);
        }
});

// Middleware to verify JWT token
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      const decoded = jwt.verify(token, 'your-secret-key'); // Replace with your secret key
      req.user = decoded;
      next();
    } catch (error) {
      res.status(400).json({ message: 'Invalid token.' });
    }
  };

// Create Recipe API
router.post('/recipes', authenticateUser, async (req, res) => {
    const { name, description, ingredients, instructions, imageUrl, cookingTime } = req.body;
  
    try {
      // Create a new recipe
      const recipe = new Recipe({
        name,
        description,
        ingredients,
        instructions,
        imageUrl,
        cookingTime
    
      });
  
      // Save the recipe to the database
      await recipe.save();
  
      res.status(201).json({ message: 'Recipe created successfully!', recipe });
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ message: 'Failed to create recipe.' });
    }
  });
  


app.listen (Port, (err)=> {
    if (err) {
        console.log('Error: ', err);
    }
    console.log('Server is running on port: ' + Port);
  
})