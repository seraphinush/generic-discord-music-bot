# generic-discord-music-bot
Discord music bot developed using discord.js library

[Website](https://seraphinush.github.io/generic-discord-music-bot/)

## Prerequisite
- Discord server
- MongoDB cluster
- Node.js, used v14.0.0, @discordjs/opus requires Node.js 12.0.0 or newer

## Setup
Create `.env` file in base folder
Input Discord bot command prefix in `.env` file
Input Discord Bot Token in `.env` file
Input MongoDB URI in `.env` file

Example :
```
PREFIX = .
DISCORD_TOKEN = DISCORD.BOT.TOKEN-AT-DISCORDS-DEVELOPER-PORTAL
ATLAS_URI = mongodb+srv://admin:<PASSWORD>@<CLUSTER_NAME>.eikyh.mongodb.net/<DB_NAME>?retryWrites=true&w=majority
```
Note : Make sure to whitelist your IP of bot instance in MongoDB
Install dependencies
```
npm install
```
Run application
```
node index.js
```

## Usage
```
- join, on : join voice channel
- leave, off : leave voice channel
- play, p <URL | search term> : play music or add music to queue
- playnext <URL | search term> : play music or add music to the top of queue
- stop : stop music
- pause : pause music
- resume : resume music
- skip : skip to next music in queue if queue exists
- remove, rm <Number> : remove music in queue at index if queue exists
- clear : clear music in queue
- repeat <none | one | all> : disable repeat music | repeat current music | repeat all music in order of queue
- shuffle : shuffle music in queue if queue exists
- volume <Number> : adjust volume of voice activity between 0 and 100. does not adjust the user-designated volume of the client itself
- save : save current song list to an online database
- load : load song list from an online database to queue. automatically plays if there is no voice activity
````

## Permissions used
```
Text Permissions ::
SEND_MESSAGES
MANAGE_MESSAGES
ADD_REACTIONS

Voice Permissions ::
VIEW_CHANNEL
CONNECT
SPEAK
USE_VAD
```

## Limitations
- Currently only supports Youtube search or URL

## Built with
- discord.js
- @discordjs/opus
- dotenv
- ffmpeg-static
- mongoose
- node-ytdl-core
- yt-search

## License
Copyright 2021 Seraphinus Hong

Released under the [MIT License](LICENSE)
