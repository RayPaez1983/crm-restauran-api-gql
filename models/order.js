const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  order: {
    type: Array,
    require: true,
  },
  total: {
    type: Number,
    require: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "Client",
  },
  waiter: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  state: {
    type: String,
    default: "Pending",
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Order", OrderSchema);
