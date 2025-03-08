const mongoose = require('mongoose');


const recipeSchema = new mongoose.Schema({

  
  name: { 
    type: String, 
    required: [true, "Recipe name is required"], 
    trim: true 
  },

  
  description: { 
    type: String, 
    required: [true, "Description is required"],
    trim: true
  },

  
  ingredients: { 
    type: [String], 
    required: [true, "Ingredients are required"], 
    validate: [arrayLimit, "At least one ingredient is required"], 
  }, 

  
  instructions: { 
    type: [String], 
    required: [true, "Instructions are required"], 
    validate: [arrayLimit, "At least one instruction is required"], 
  }, 

 
  imageUrl: { 
    type: String, 
    required: [true, "Image URL is required"], 
    trim: true
  },

  
  cookingTime: { 
    type: Number, 
    required: [true, "Cooking time is required"], 
    min: [1, "Cooking time must be at least 1 minute"] 
  },

  
  category: { 
    type: String, 
    required: [true, "Category is required"], 
    enum: {
      values: ['Non-Veg', 'Veg', 'Dessert', 'Vegan'], 
      message: '{VALUE} is not a valid category' 
    }
  }

});


function arrayLimit(val) {
  return val.length > 0;
}


module.exports = mongoose.model('Recipe', recipeSchema);
