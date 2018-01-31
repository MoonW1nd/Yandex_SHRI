const express = require('express');
const router = express.Router();
const {
  index,
  addMeeting,
  createNewMeeting,
  editMeeting,
  updateMeeting,
  removeMeeting
} = require('./controllers');
const graphqlRoutes = require('../graphql/routes');

router.get('/', index);
router.get('/add-meeting', addMeeting);
router.post('/', createNewMeeting, index);
router.get('/edit-event/:id', editMeeting);
router.post('/edit-event/:id', updateMeeting);
router.get('/edit-event/:id/remove', removeMeeting);
router.get('/date/:date', index);
module.exports = router;
