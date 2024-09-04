// Dépendances
const e = require('express');

const Character = {

    getCharacters: function() {
        let data = require('../data/characters.json');
        return data;
    }
}

module.exports = Character;