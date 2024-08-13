const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const rest = new REST().setToken(token);

// for guild-based commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
    .then(() => console.log('[INFO] Commandes de guilde supprimées avec succès.'))
    .catch(`[ERROR] ${console.error}`);

// for global commands
rest.put(Routes.applicationCommands(clientId), { body: [] })
    .then(() => console.log('[INFO] Commandes globales supprimées avec succès.'))
    .catch(`[ERROR] ${console.error}`)