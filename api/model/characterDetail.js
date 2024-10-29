// Dépendances
const e = require('express');

const CharacterDetail = {

    getCharactersDetails: function () {
        let data = require('../data/charactersDetails.json');
        return data;
    },

    // Affiche les détails d'un personnage par rapport à son nom
    getCharacterDetailByName: function (name) {
        // Charger les données
        let data = require('../data/charactersDetails.json');
        let charactersArray = data.characters;

        // Vérifier si `name` est défini et est une chaîne de caractères non vide
        if (typeof name !== 'string' || !name.trim()) {
            return { error: 'Nom invalide ou manquant' };
        }

        // Filtrer les personnages en fonction du nom
        let character = charactersArray.filter(character => {
            // Vérifier si `character.name` est défini et est une chaîne de caractères
            if (typeof character.name !== 'string') {
                return false; // Ignorer les personnages sans un nom valide
            }
            return character.name.toLowerCase() === name.toLowerCase();  // Pour gérer les majuscules et minuscules
        });

        // Retourner le personnage trouvé ou une erreur si aucun personnage n'est trouvé
        return character.length > 0 ? character[0] : { error: 'Personnage non trouvé' };
    },


}

module.exports = CharacterDetail;