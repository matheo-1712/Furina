// Dépendances
const e = require('express');

const CharacterDetail = {

    getCharactersDetails: function () {
        let data = require('../data/charactersDetails.json');
        return data;
    },

    // Affiche les détails d'un personnage par rapport à son nom
    getCharacterDetailByName: function (name) {
        let data = require('../data/charactersDetails.json');
        let charactersArray = data.characters;
        let character = charactersArray.filter(character => 
            character.name.toLowerCase() === name.toLowerCase()  // Pour gérer les majuscules et minuscules
        );
        return character.length > 0 ? character[0] : { error: 'Personnage non trouvé' };
    },

}

module.exports = CharacterDetail;