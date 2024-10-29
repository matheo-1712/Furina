const express = require('express');
const characterController = require('../controller/characterController');

const router = express.Router();

router.get('/characters', characterController.getAllCharacters);
router.get('/characters/details', characterController.getAllCharactersDetails);
router.get('/characters/details/:name', characterController.getCharacterDetailByName);

module.exports = router;