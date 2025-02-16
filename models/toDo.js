const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    require: true,
  },
  complete: {
    type: Number,
    require: true,
  },
});

module.exports = mongoose.model('Todo', TodoSchema);
