const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

module.exports = {
    owner: true,
    data: new SlashCommandBuilder()
        .setName('appemoji')
        .setDescription('App emoji')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(command => command.setName('create').setDescription('Créer un emoji')
            .addAttachmentOption(option => option.setName('emoji').setDescription('Image à convertir en emoji').setRequired(true))
            .addStringOption(option => option.setName('name').setDescription('Nom de l\'emoji').setRequired(true)))
        .addSubcommand(command => command.setName('delete').setDescription('Supprimer un emoji')
            .addStringOption(option => option.setName('name').setDescription('Nom de l\'emoji').setRequired(true)))
        .addSubcommand(command => command.setName('get').setDescription('Lister les emojis du serveur')),
    async execute(interaction, client) {

        const { options } = interaction;
        const sub = options.getSubcommand();

        const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        const APP_ID = config.clientId;
        const TOKEN = config.token;

        async function sendMessage(message) {
            const embed = new EmbedBuilder()
                .setTitle('App emoji')
                .setDescription(message)
                .setColor('#FF0000');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        async function apiCall(type, data) {

            if (type == 'create') {
                const reponse = await axios.post(`https://discord.com/api/v10/applications/${APP_ID}/emojis`, {
                    name: data.name,
                    image: data.emoji
                }, {
                    headers: {
                        'Authorization': `Bot ${TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(err => { });

                if (!reponse) return false;
                else return reponse;
            }

            if (type == 'remove') {
                const reponse = await axios.delete(`https://discord.com/api/v10/applications/${APP_ID}/emojis/${data}`, {
                    headers: {
                        'Authorization': `Bot ${TOKEN}`
                    }
                }).catch(err => { });
                if (!reponse) return false;
                else return reponse;
            }

            if (type == 'get') {
                const reponse = await axios.get(`https://discord.com/api/v10/applications/${APP_ID}/emojis`, {
                    headers: {
                        'Authorization': `Bot ${TOKEN}`,
                    }
                }).catch(err => { });

                if (!reponse) return false;
                else return reponse;
            }
        }

        var output;
        switch (sub) {
            case 'create':
                const emoji = options.getAttachment('emoji');
                const name = options.getString('name');

                const reponse = await axios.get(emoji.url, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(reponse.data, 'binary');
                const base64Image = buffer.toString('base64');

                const createData = {
                    name: name,
                    emoji: `data:image/jpeg;base64,${base64Image}`
                }

                output = await apiCall('create', createData);

                if (!output) {
                    sendMessage('Erreur lors de la création de l\'emoji.');
                } else {
                    sendMessage(`Emoji <:${output.data.name}:${output.data.id}> créé avec succès !`);
                }
                break;
            case 'get':
                output = await apiCall('get');
                var items = output.data.items;
                var formatString = ``;

                await items.forEach(async emoji => {
                    formatString += `<:${emoji.name}:${emoji.id}> - Nom de l'emoji: ${emoji.name} - ID: ${emoji.id} \n`;
                });

                if (formatString.length == 0) formatString += `\`Aucun emoji trouvé\``;

                await sendMessage(`Voici la liste des emojis de l'application: \n\n ${formatString}`);
                break;

            case 'remove':
                const id = options.getString('emoji-id');
                output = await apiCall('remove', id);

                if (!output) {
                    sendMessage(`Erreur lors de la suppression de l'emoji avec l'id ${id}.`);
                } else {
                    sendMessage(`Emoji <:${output.data.name}:${output.data.id}> supprimé avec succès !`);
                }
        }

    }
}