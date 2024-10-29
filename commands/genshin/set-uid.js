const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { imgLink, api } = require('../../configLink.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-uid')
        .setDescription('Définir votre UID Genshin Impact.')
        .addStringOption(option =>
            option.setName('uid')
                .setDescription('Votre UID Genshin Impact.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const uid = interaction.options.getString('uid');

        // Répondre à l'interaction
        await interaction.deferReply({ ephemeral: true });

        // Vérifier si l'UID est valide (9 chiffres)
        if (!await verifUID(uid)) {
            const embed = new EmbedBuilder()
                .setTitle('Une erreur est survenue !')
                .setDescription(`L'UID Genshin Impact doit être composé de 9 chiffres. Veuillez réessayer.`)
                .setColor('#FF0000')
                .setImage(imgLink.error)
                .setFooter({
                    text: "Furina - Genshin Impact",
                })

            return await interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // Charger le contenu JSON depuis le fichier
        const filePath = path.resolve(__dirname, '../../data/uid.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const uidData = JSON.parse(jsonData);

        // Vérifier si l'utilisateur a déjà enregistré son UID

        if (uidData[interaction.user.id]) {
            const embed = new EmbedBuilder()
                .setTitle('UID déjà défini')
                .setDescription(`Vous avez déjà défini votre UID Genshin Impact. Veuillez contacter __rerebleue__ si vous souhaitez le modifier.`)
                .setImage(imgLink.success)
                .setColor('#ffffff')
                .setFooter({
                    text: "Furina - Genshin Impact",
                })

            return await interaction.editReply({ embeds: [embed], ephemeral: true });
        }


        // vérifier si l'uid Genshin Impact inscrit par l'utilisateur est déjà enregistré

        for (const key in uidData) {
            if (uidData[key].uid === uid) {
                const embed = new EmbedBuilder()
                    .setTitle('UID déjà enregistré')
                    .setDescription(`L'UID Genshin Impact que vous avez saisi est déjà enregistré pour un autre utilisateur. Veuillez contacter __rerebleue__ si cet UID vous appartient.`)
                    .setImage(imgLink.error)
                    .setColor('#FF0000')
                    .setFooter({
                        text: "Furina - Genshin Impact",
                    })

                return await interaction.editReply({ embeds: [embed], ephemeral: true });
            }
        }

        // Vérifier si l'UID est valide (via une fonction async)
        const accountName = await verifAccountUID(uid);

        if (!accountName) {
            const embed = new EmbedBuilder()
                .setTitle('UID ne correspondant à aucun compte')
                .setDescription(`L'UID Genshin Impact n'est pas valide. Veuillez vérifier votre UID et réessayer.`)
                .setImage(imgLink.error)
                .setColor('#FF0000')
                .setFooter({
                    text: "Furina - Genshin Impact",
                })

            return await interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // Embed du message de confirmation
        const embedConfirmation = new EmbedBuilder()
            .setTitle('Confirmation de l\'UID Genshin Impact')
            .setDescription(`Votre pseudo en jeu est donc ${accountName} et votre UID est ${uid} ?`)
            .setColor('#ffffff');

        // Boutons de confirmation et d'annulation
        const buttonConfirmation = new ButtonBuilder()
            .setCustomId('confirm-uid')
            .setLabel('Oui, c\'est bien ça!')
            .setStyle(3);

        const buttonCancel = new ButtonBuilder()
            .setCustomId('cancel-uid')
            .setLabel('Non !')
            .setStyle(4);

        // ActionRow pour les boutons
        const actionRow = new ActionRowBuilder()
            .addComponents(buttonConfirmation, buttonCancel);

        const message = await interaction.editReply({
            embeds: [embedConfirmation],
            components: [actionRow],
            ephemeral: true
        });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15_000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm-uid') {
                enregistrementUID(uid, interaction);

                const embed = new EmbedBuilder()
                    .setTitle('UID enregistré avec succès')
                    .setDescription(`Votre UID Genshin Impact a été défini sur ${uid}. <:furinaNews:1272629426798071939>`)
                    .setImage(imgLink.success)
                    .setColor('#03fc41')
                    .setFooter({
                        text: "Furina - Genshin Impact",
                    })

                await i.update({ embeds: [embed], ephemeral: true, components: [] });
            } else if (i.customId === 'cancel-uid') {
                const embed = new EmbedBuilder()
                    .setTitle(`Annulation de l'enregistrement de votre UID`)
                    .setDescription(`L'enregistrement a été annulé..`)
                    .setColor('#FF0000')
                    .setFooter({
                        text: "Furina - Genshin Impact",
                    })

                await i.update({ embeds: [embed], ephemeral: true, components: [] });
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({ content: 'La commande a expiré.', ephemeral: true, components: [] });
            }
            console.log(`Collected ${collected.size} interactions.`);
        });
    }
};


// Fonctions utilitaires

async function verifUID(uid) {
    const regex = /^[0-9]{9}$/; // L'UID Genshin est composé de 9 chiffres
    return regex.test(uid);
}

async function enregistrementUID(userUid, interaction) {


    try {
        // Charger le contenu JSON depuis le fichier
        const filePath = path.resolve(__dirname, '../../data/uid.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const uidData = JSON.parse(jsonData);

        // Enregistrer l'UID pour l'utilisateur
        const userKey = interaction.user.id; // Utiliser l'ID de l'utilisateur comme clé
        uidData[userKey] = { uid: userUid };

        // Écrire la variable mise à jour dans le fichier JSON
        fs.writeFileSync(filePath, JSON.stringify(uidData, null, 2), 'utf8');

    } catch (error) {
        console.error('Erreur lors de l\'exécution de la commande :', error);
        const embed = new EmbedBuilder()
            .setTitle(`Mince, une erreur est survenue !`)
            .setDescription(`Il semblerait qu'une erreur soit survenue lors de l'enregistrement de votre UID. Veuillez réessayer plus tard. \n Si le problème persiste, n'hésitez pas à contacter __rerebleue__.`)
            .setImage(imgLink.error)
            .setColor("#FF0000")
            .setFooter({
                text: "Furina - Genshin Impact",
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

async function verifAccountUID(uid) {

    const ApiLink = `${api.uidInfos}${uid}?info`;

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(ApiLink);

        // Vérifiez que la requête a été réussie
        if (!response.ok) {
            console.error(`Erreur API: ${response.statusText}`);
            return null; // Retourner null en cas d'erreur de requête
        }

        const data = await response.json();

        // Vérifier que le champ "playerInfo" et "nickname" existent
        if (data.playerInfo?.nickname) {
            return data.playerInfo.nickname; // Retourner le "nickname"
        } else {
            console.error('Le champ "nickname" est manquant dans les données de l\'API.');
            return null; // Retourner null si "nickname" est manquant
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'UID:', error);
        return null; // Retourner null en cas d'erreur
    }
}
