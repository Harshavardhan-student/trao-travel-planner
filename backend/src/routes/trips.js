const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTrip,
  removeActivity,
  addActivity,
  regenerateDay,
  shareTrip,
  getSharedTrip,
  deleteTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

// Public route — no auth needed
router.get('/shared/:token', getSharedTrip);

router.use(protect);

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTrip);
router.delete('/:id', deleteTrip);
router.delete('/:id/day/:dayIndex/activity/:activityIndex', removeActivity);
router.post('/:id/day/:dayIndex/activity', addActivity);
router.post('/:id/day/:dayIndex/regenerate', regenerateDay);
router.post('/:id/share', shareTrip);

module.exports = router;