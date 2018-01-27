const express = require('express');

const router = express.Router();
const { index, addMeeting, createNewMeeting } = require('./controllers');

router.get('/', index);
router.get('/add-meeting', addMeeting);
router.post('/', createNewMeeting, index);

module.exports = router;
