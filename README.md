<img src="./api/img/bot/banner.gif">

# Furina

Furina est un bot Discord spécialisé pour le jeu **Genshin Impact**.

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Installation](#installation)
3. [Auteur du bot](#auteur-du-bot)

## Fonctionnalités

Le bot Furina permet de :

- Afficher les builds conseillés pour les personnages
- Montrer les événements à venir dans le jeu (fonctionnalité en cours de développement)
- Gérer les UID des utilisateurs
- Proposer de nombreuses autres fonctionnalités à venir pour améliorer l'expérience des utilisateurs

Ce bot est en constante évolution et de nouvelles fonctionnalités seront ajoutées régulièrement.

Il possède également ça propre API pour récupérer les données des personnages et encore plus à venir.

Cette api sera disponible prochainement sur le site web du bot.

[furina.antredesloutres.fr](https://furina.antredesloutres.fr) (encore en cours de développement)

## Installation

Pour installer le bot Furina sur votre serveur Discord, vous pouvez [cliquer ici](https://discord.com/oauth2/authorize?client_id=1272615402442199135&permissions=8&integration_type=0&scope=bot).

Pour lancer le bot en local, vous devez :

1. Cloner le dépôt
2. Installer les dépendances avec `npm install`
3. Créer un fichier `config.json` à la racine du projet avec le contenu suivant :
    
    ```json
    {
        "token": "Token de votre bot",
        "clientId": "ID de votre bot",
        "categoryName": "Nom de la catégorie où seront créés les salons de logs du bot",
        "roleName": "Nom du rôle qui permettra d'accéder aux commandes de logs",

    }
    ```
4. Lancer le bot avec `node index.js`


## Auteur du bot

Le bot Furina a été créé et est maintenu par **Perodeau Mathéo**. Vous pouvez me contacter via perod.matheo@gmail.com pour toute question ou suggestion. 

## License

Non affilié à Hoyoverse ou à Discord.

Libre de droit.

