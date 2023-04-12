const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
  dishName: {
    type: String,
    require: true,
    unique: true,
    trim: true,
  },
  protein: {
    type: String,
    require: true,
  },
  carbohydrates: {
    type: String,
  },
  vegetables: {
    type: String,
  },
  inStock: {
    type: Number,
    require: true,
    trim: true,
  },
  price: {
    type: Number,
    require: true,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});
DishSchema.index({ dishName: 'text' });
module.exports = mongoose.model('Dish', DishSchema);
