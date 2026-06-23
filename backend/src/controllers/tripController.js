const Trip = require('../models/Trip');
const { generateItinerary } = require('../services/aiService');

// POST /api/trips
const createTrip = async (req, res, next) => {
  try {
    const { destination, days, budgetType, interests } = req.body;

    if (!destination || !days || !budgetType || !interests?.length) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all trip details',
      });
    }

    // Create trip first
    const trip = await Trip.create({
      user: req.user.id,
      destination,
      days,
      budgetType,
      interests,
    });

    // Generate itinerary with AI
    const aiResult = await generateItinerary({ destination, days, budgetType, interests });

    // Update trip with AI result
    trip.itinerary = aiResult.itinerary;
    trip.budget = aiResult.budget;
    trip.hotels = aiResult.hotels;
    await trip.save();

    res.status(201).json({ success: true, trip });
  } catch (err) {
    next(err);
  }
};

// GET /api/trips
const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, trips });
  } catch (err) {
    next(err);
  }
};

// GET /api/trips/:id
const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
};

// DELETE activity - /api/trips/:id/day/:dayIndex/activity/:activityIndex
const removeActivity = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    const { dayIndex, activityIndex } = req.params;
    trip.itinerary[dayIndex].activities.splice(activityIndex, 1);
    trip.markModified('itinerary');
    await trip.save();

    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
};

// POST add activity - /api/trips/:id/day/:dayIndex/activity
const addActivity = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    const { dayIndex } = req.params;
    const { time, activity, description, estimatedCost } = req.body;

    trip.itinerary[dayIndex].activities.push({ time, activity, description, estimatedCost });
    trip.markModified('itinerary');
    await trip.save();

    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
};

// POST regenerate day - /api/trips/:id/day/:dayIndex/regenerate
const regenerateDay = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    const { dayIndex } = req.params;
    const { instruction } = req.body;
    const day = trip.itinerary[dayIndex];

    const { generateDay } = require('../services/aiService');
    const newDay = await generateDay({
      destination: trip.destination,
      dayNumber: day.day,
      budgetType: trip.budgetType,
      interests: trip.interests,
      instruction: instruction || '',
    });

    trip.itinerary[dayIndex] = newDay;
    trip.markModified('itinerary');
    await trip.save();

    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
};

const crypto = require('crypto');

// POST /api/trips/:id/share  — generate share link
const shareTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    // Always generate a fresh token
    trip.shareToken = crypto.randomBytes(16).toString('hex');
    trip.isShared = true;
    await trip.save();

    res.json({ success: true, shareToken: trip.shareToken });
  } catch (err) {
    next(err);
  }
};

// GET /api/trips/shared/:token  — public, no auth
const getSharedTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ shareToken: req.params.token, isShared: true });
    if (!trip) return res.status(404).json({ success: false, error: 'Shared trip not found' });

    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trips/:id
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    await trip.deleteOne();
    res.json({ success: true, message: 'Trip deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTrip, getTrips, getTrip, removeActivity, addActivity, regenerateDay, shareTrip, getSharedTrip, deleteTrip };