const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  order: {
    type: Array,
    require: true,
  },
  table: {
    type: Number,
    require: true,
  },
  persons: {
    type: Number,
    require: true,
  },
  total: {
    type: Number,
    require: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Client',
  },

  state: {
    type: String,
    default: 'PENDING',
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'User',
  },
});

module.exports = mongoose.model('Order', OrderSchema);
