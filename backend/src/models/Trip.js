const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    days: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [1, 'Must be at least 1 day'],
      max: [30, 'Cannot exceed 30 days'],
    },
    budgetType: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Budget type is required'],
    },
    interests: {
      type: [String],
      enum: ['Food', 'Culture', 'Adventure', 'Shopping', 'Nature', 'Nightlife'],
      required: [true, 'Select at least one interest'],
    },
    itinerary: {
      type: Object,
      default: null,
    },
    budget: {
      type: Object,
      default: null,
    },
    shareToken: {
    type: String,
    default: null,
    index: { unique: true, sparse: true },
    },
    isShared: {
    type: Boolean,
    default: false,
    },
    hotels: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', TripSchema);