const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cheerio = require('cheerio');
const { imgLink, api } = require('../../configLink.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('build')
        .setDescription('Permet de consulter un guide de build pour un personnage.')
        .addStringOption(option =>
            option.setName('character')
                .setDescription('Le nom du personnage pour lequel vous souhaitez consulter un guide de build.')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {

        // Récupérer la valeur saisie par l'utilisateur
        const focusedValue = interaction.options.getFocused();
        const ApiLink = api.charactersList;

        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(ApiLink);

            if (!response.ok) {
                console.error(`[ERROR] Erreur HTTP : ${response.status}`);
                throw new Error(`[ERROR] Erreur HTTP : ${response.status}`);
            }

            const data = await response.json();
            // console.log('[INFO] Les données sont récupérées avec succès ', data);

            // Générer les choix avec vérification de la longueur du nom
            const choices = data.map(element => {
                // Remplacer les espaces par des tirets et préparer les valeurs de base
                const input = element;

                // Tronquer le nom si la longueur dépasse 25 caractères
                const truncatedName = input.length > 25
                    ? input.substring(0, 25)
                    : input;

                // Mettre une majuscule au début du nom et une majuscule après chaque tiret
                const formattedName = truncatedName
                    .toLowerCase()          // Convertir en minuscules pour uniformité
                    .replace(/-/g, ' ')     // Remplacer les tirets par des espaces
                    .replace(/\b\w/g, l => l.toUpperCase()); // Mettre une majuscule après chaque espace ou début de mot

                // Tronquer la valeur si la longueur dépasse 25 caractères
                const truncatedValue = input.length > 25 ? input.substring(0, 25) : input;

                return {
                    name: formattedName,
                    value: truncatedValue
                };
            });
            // Filtrer les choix en fonction de l'entrée utilisateur, insensible à la casse
            const filtered = choices.filter(choice =>
                choice.name.toLowerCase().startsWith(focusedValue.toLowerCase())
            );

            // Limiter les résultats à 25
            const limitedFiltered = filtered.slice(0, 25);

            // S'il n'y a pas de correspondance ou si l'utilisateur n'a rien saisi
            if (limitedFiltered.length === 0) {
                let noMatchMessage = '';

                if (focusedValue.length === 0) {
                    noMatchMessage = 'Tapez pour chercher un personnage...';
                } else {
                    noMatchMessage = 'Aucune correspondance trouvée.';
                }

                await interaction.respond([
                    {
                        name: noMatchMessage,
                        value: 'none'
                    }
                ]);
            } else {
                await interaction.respond(limitedFiltered);
            }

        } catch (error) {
            console.error('[ERROR] Erreur lors de la récupération des données pour l\'autocomplétion : ', error);
            await interaction.respond([
                {
                    name: 'Error',
                    value: 'Une erreur est survenue !'
                }
            ]).catch(err => console.error('[ERROR] Erreur lors de la réponse à l\'interaction : ', err));
        }
    },

    async execute(interaction) {

        const character = interaction.options.getString('character');

        // Variables pour le nom d'affichage du personnage et la couleur de l'embed
        const persoAffichage = character.charAt(0).toUpperCase() + character.slice(1);

        let linkGuide = `https://keqingmains.com/q/${character}-quickguide/`
        try {
            // Envoyer une requête à la page de guide de build pour le personnage spécifié
            let response = await fetch(linkGuide);

            if (!response.ok) {
                // Vérifier si le statut est 404 ou un autre code d'erreur
                if (response.status === 404) {

                    linkGuide = `https://keqingmains.com/${character}/`;

                    // console.log('Error 404: Passage sur un lien alternatif...');
                    // console.log('Nouveau lien:', linkGuide);

                    // Envoyer une nouvelle requête avec le lien alternatif
                    response = await fetch(linkGuide);

                    if (!response.ok) {
                        if (response.status === 404) {
                            // console.log('Error 404: Page not found');
                            linkGuide = 'Aucun guide de build n\'a été trouvé pour ce personnage.';
                            throw new Error('Error 404: Page not found');
                        } else {
                            console.log('HTTP Error:', response.status);
                            throw new Error('HTTP Error: ' + response.status);
                        }
                    }
                } else {
                    // console.log('HTTP Error:', response.status);
                    throw new Error('HTTP Error: ' + response.status);
                }
            }
            const guideImgLink = await guideImg(linkGuide);

            // Gestion de la couleur des embeds et de l'image du portrait
            const details = await colorCharAndPortrait(character);

            // Répondre à l'interaction

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: "Furina - Genshin Impact",
                })
                .setTitle(`Build ${persoAffichage}`)
                .setURL(linkGuide)
                .setImage(guideImgLink)
                .setThumbnail(details.portrait)
                .setDescription(`Voici un guide de build pour ${persoAffichage}.\nPour avoir accès à un guide plus complet, [ici](${linkGuide}).`)
                .setColor(details.color)
                .setFooter({
                    text: "Crédit : Keqingmains",
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('[ERROR] Erreur lors de la récupération des données ou de la réponse à l\'interaction : Personnage non trouvé.');
            // Répondre à l'interaction
            const embed = new EmbedBuilder()
                .setTitle(`Mince, une erreur est survenue !`)
                .setDescription(`Aucun guide de build n'a été trouvé pour **${persoAffichage}**.\n Vous n'avez pas saisi le bon nom de personnage ou il n'y a pas de guide de build pour ce personnage.\n\n __Si ce n'est pas le cas, veuillez contacter rerebleue.__`)
                .setImage(imgLink.error)
                .setColor("#FF0000")
                .setFooter({
                    text: "Furina - Genshin Impact",
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] }).catch(err => console.error('[ERROR] Erreur lors de la réponse à l\'interaction : ', err));
        }

    }
};

async function guideImg(url) {

    try {
        // Envoyer une requête HTTP pour récupérer le contenu de la page
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        // Convertir la réponse en texte
        const html = await response.text();

        // Utiliser cheerio pour parser le HTML
        const $ = cheerio.load(html);

        const searchTerm = 'Infographic';

        // Trouver le h1 contenant un span avec le mot "Infographic"
        const h1WithSearchTerm = $('h1').filter((i, el) => {
            return $(el).text().includes(searchTerm);
        });

        // Si le h1 est trouvé, trouver la première image après ce h1
        let imageSrc;
        if (h1WithSearchTerm.length > 0) {
            // Chercher la première image dans la div suivante après le h1
            const image = h1WithSearchTerm.first().next('div').find('img').first();

            if (image.length > 0) {
                imageSrc = image.attr('src');
            } else {
                // console.log('Aucune image trouvée après le h1 contenant le mot Infographic.');
            }
        } else {
            // console.log('Aucun h1 contenant le mot Infographic trouvé.');
        }

        if (imageSrc) {
            // console.log('URL de l\'image trouvée:', imageSrc);
            return imageSrc;
        } else {
            // console.log('Aucune image trouvée avec le terme recherché, lancement de la recherche d\'une image alternative...');
            // Chercher toutes les balises <img> et filtrer celles dont l'attribut src contient le terme recherché
            const searchTerm = 'Infographic';
            const image = $('img').filter((i, el) => {
                const src = $(el).attr('src');
                return src && src.includes(searchTerm); // Ajouter une vérification pour src
            }).first();

            // Extraire l'attribut src de la première image trouvée
            const imageSrc = image.attr('src');
            if (imageSrc) {
                // console.log('URL de l\'image trouvée:', imageSrc);
                return imageSrc;
            } else {
                // console.log('Aucune image trouvée avec le terme recherché.');
                return imgLink.noInfographics;
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération ou de l\'extraction:', error);
    }
}

async function colorCharAndPortrait(character) {
    // Gestion de la couleur des embeds
    const ApiCharDetails = api.charactersDetails;
    let color;
    let details = {};

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(ApiCharDetails + character.charAt(0).toUpperCase() + character.slice(1));

        if (!response.ok) {
            console.error(`[ERROR] Erreur HTTP : ${response.status}`);
            throw new Error(`[ERROR] Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        // Récupération de la vision et du portrait
        const vision = data.vision;
        const portrait = data.portrait;

        // Déterminer la couleur de l'embed en fonction de la vision
        switch (vision) {
            case 'Pyro':
                color = '#ff9999';
                break;
            case 'Hydro':
                color = '#80c0ff';
                break;
            case 'Anemo':
                color = '#80ffd7';
                break;
            case 'Electro':
                color = '#ffacff';
                break;
            case 'Cryo':
                color = '#99ffff';
                break;
            case 'Geo':
                color = '#ffe699';
                break;
            case 'Dendro':
                color = '#99ff88';
                break;
            default:
                color = '#FFFFFF';
                break;
        }

        // Assigner les valeurs à l'objet details
        details.color = color;
        details.portrait = portrait;

        return details;

    } catch (error) {
        console.error('[ERROR] Erreur lors de la récupération des données pour la couleur : ', error);
        details.color = '#FFFFFF';
        details.portrait = 'http://furina.antredesloutres.fr';

        return details;
    }
}