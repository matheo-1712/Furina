const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { imgLink, api, site } = require('../../configLink.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-uid')
        .setDescription(`Récupérer l'UID Genshin Impact. d'un utilisateur.`)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription(`Membre dont vous souhaitez récupérer l'UID Genshin Impact.`)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('détails')
                .setDescription('Souhaitez-vous inclure des informations supplémentaires ?')
                .setRequired(false)
                .addChoices(
                    { name: 'UID Seulement (réponse rapide)', value: 'false' },
                    { name: 'UID et les informations du joueur (plus long)', value: 'true' }
                )
        ),
    async execute(interaction) {
        const member = interaction.options.getMember('membre');

        // Récupére le tag de l'utilisateur avec une majuscule au début
        const tag = member.user.tag.charAt(0).toUpperCase() + member.user.tag.slice(1);

        // Répondre à l'interaction
        await interaction.deferReply({ ephemeral: true });

        // Charger le contenu JSON depuis le fichier
        const filePath = path.resolve(__dirname, '../../data/uid.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const uidData = JSON.parse(jsonData);

        // Vérifier si l'utilisateur a déjà enregistré son UID
        if (!uidData[member.id]) {
            const embed = new EmbedBuilder()
                .setTitle('UID non défini')
                .setDescription(`L'utilisateur ${member} n'a pas défini son UID Genshin Impact.`)
                .setColor('#FF0000')
                .setImage(imgLink.error)
                .setFooter({
                    text: "Furina - Genshin Impact",
                })

            return await interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // Récupérer l'UID de l'utilisateur
        const uid = uidData[member.id].uid;

        // Récupérer l'avatar de l'utilisateur
        const avatar = member.user.displayAvatarURL({ format: 'png', size: 512 });

        if (interaction.options.getString('détails') === 'false') {
            const embed = new EmbedBuilder()
                .setTitle(`UID de ${tag}`)
                .setDescription(`L'UID de ${member} est : ${uid}`)
                .setThumbnail(avatar)
                .setColor('#ffffff')
                .addFields(
                    {
                        name: 'Lien Akasha',
                        value: `[Cliquez ici](${site.akashaProfil}${uid})`,
                        inline: true,
                    },
                    {
                        name: 'Lien Enka.network',
                        value: `[Cliquez ici](${site.enkaProfil}${uid})`,
                        inline: true,
                    }
                )

                .setFooter({
                    text: "Furina - Genshin Impact",
                })
                .setTimestamp();

            return await interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        try {
            // Récupérer les données de l'API
            const uidInfos = await uidInfo(uid);

            // Créer un embed avec les informations de l'UID
            const embed = new EmbedBuilder()
                .setTitle(`Profil de ${tag}`)
                .setURL(uidInfos.apiLink)
                .setThumbnail(avatar)
                .setDescription(`L'UID est : ${uid}`)
                .setColor('#ffffff')
                .addFields(
                    {
                        name: 'Pseudo',
                        value: uidInfos.nickname.toString(),
                        inline: true,
                    },
                    {
                        name: 'Niveau',
                        value: uidInfos.level.toString(),
                        inline: true,
                    },
                    {
                        name: 'Signature',
                        value: uidInfos.signature.toString(),
                        inline: false,
                    },
                    {
                        name: 'Nombre de succès',
                        value: uidInfos.finishAchievementNum.toString(),
                        inline: true,
                    },
                    {
                        name: 'Étage de la tour',
                        value: `${uidInfos.towerFloorIndex.toString()}-${uidInfos.towerLevelIndex.toString()}`,
                        inline: true,
                    },
                    {
                        name: 'Affinité personnage',
                        value: uidInfos.affiPerso.toString(),
                        inline: false,
                    },
                    {
                        name: 'Lien Akasha',
                        value: `[Cliquez ici](${site.akashaProfil}${uid})`,
                        inline: true,
                    },
                    {
                        name: 'Lien Enka.network',
                        value: `[Cliquez ici](${site.enkaProfil}${uid})`,
                        inline: true,
                    }
                )
                .setFooter({
                    text: "Furina - Genshin Impact",
                });
            await interaction.editReply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'UID :', error);
            const embed = new EmbedBuilder()
                .setTitle(`Mince, une erreur est survenue !`)
                .setDescription(`Il semblerait qu'une erreur soit survenue lors de la récupération de l'UID de ${member}. Veuillez réessayer plus tard. \n Si le problème persiste, n'hésitez pas à contacter __rerebleue__.`)
                .setImage(imgLink.error)
                .setColor("#FF0000")
                .setFooter({
                    text: "Furina - Genshin Impact",
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    },
};

async function uidInfo(uid) {

    // Lien de l'API
    const ApiLink = `${api.uidInfos}${uid}?info`;

    let uidInfos = {};

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(ApiLink);

        // Vérifiez que la requête a été réussie
        if (!response.ok) {
            console.error(`Erreur API: ${response.statusText}`);
            return null; // Retourner null en cas d'erreur de requête
        }

        const data = await response.json();
        const playerInfo = data.playerInfo;

        // Assurez-vous que playerInfo existe avant de l'utiliser
        if (!playerInfo) {
            console.error('Les informations du joueur sont manquantes dans la réponse de l\'API.');
            return;
        }

        const pseudo = playerInfo.nickname || 'Inconnu';
        const level = playerInfo.level || 'Non spécifié';
        const signature = playerInfo.signature || 'Non spécifié';
        const finishAchievementNum = playerInfo.finishAchievementNum || 'Non spécifié';
        const towerFloorIndex = playerInfo.towerFloorIndex || 'Non spécifié';
        const towerLevelIndex = playerInfo.towerLevelIndex || 'Non spécifié';
        const affiPerso = playerInfo.fetterCount || 'Non spécifié';

        uidInfos = {
            nickname: pseudo,
            level: level,
            signature: signature,
            finishAchievementNum: finishAchievementNum,
            towerFloorIndex: towerFloorIndex,
            towerLevelIndex: towerLevelIndex,
            apiLink: ApiLink,
            affiPerso: affiPerso
        };

        // Retourner les informations de l'UID
        return uidInfos;

    } catch (error) {
        console.error('Erreur lors de la vérification de l\'UID:', error);
        return null; // Retourner null en cas d'erreur
    }
}