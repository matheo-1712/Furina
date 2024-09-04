const Character = require('../model/character');
const CharacterDetail = require('../model/characterDetail');

const characterController = {

    // Affiche tous les personnages
    getAllCharacters: function (req, res) {
        const characters = Character.getCharacters();
        res.json(characters);
    },

    // Affiche les détails de tous les personnages
    getAllCharactersDetails: function (req, res) {
        const charactersDetails = CharacterDetail.getCharactersDetails();
        res.json(charactersDetails);
    },

    // Affiche les détails d'un personnage par rapport à son nom
    getCharacterDetailByName: function (req, res) {
        let name = req.params.name;
        let data = CharacterDetail.getCharacterDetailByName(name);
        res.json(data);
    },

}

module.exports = characterController;