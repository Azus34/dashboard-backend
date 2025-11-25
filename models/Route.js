const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  driverId: String,
  origin: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  stops: [
    {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
    },
  ],
  destination: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  schedule: Date,
  isOneTime: Boolean,
  isRecurrent: Boolean,
  frequency: String,
  prices: [Number],
  availableSeats: Number,
  status: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'routes' });

module.exports = mongoose.model('Route', routeSchema);
