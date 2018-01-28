const express = require('express');
const router = express.Router();
const { index, addMeeting, createNewMeeting, editMeeting } = require('./controllers');
const graphqlRoutes = require('../graphql/routes');



router.get('/', index);
router.get('/add-meeting', addMeeting);
router.post('/', createNewMeeting, index);
router.get('/edit-event/:id', editMeeting);
module.exports = router;
