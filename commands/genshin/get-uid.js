const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { imgLink } = require('../../configLink.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-uid')
        .setDescription(`Récupérer l'UID Genshin Impact. d'un utilisateur.`)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription(`Membre dont vous souhaitez récupérer l'UID Genshin Impact.`)
                .setRequired(true),
        ),
    async execute(interaction) {
        const member = interaction.options.getMember('membre');

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

        const embed = new EmbedBuilder()
            .setTitle(`UID de ${member}`)
            .setDescription(`L'UID Genshin Impact de ${member} est : \`${uid}\``)
            .setColor('#ffffff')
            .setImage(imgLink.success)
            .setFooter({
                text: "Furina - Genshin Impact",
            })

        await interaction.editReply({ embeds: [embed], ephemeral: true });        
    },
};