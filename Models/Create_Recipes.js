const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: { type: [String], required: true }, // Array of ingredients
  instructions: { type: [String], required: true }, // Array of instructions
  imageUrl: { type: String, required: true },
  cookingTime: { type: Number, required: true }
  
});

module.exports = mongoose.model('Recipe', recipeSchema);