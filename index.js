require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

/*
* key : guild.id
* value :
* - id: String<guild.id>
* - connection: Discord.StreamDispatcher,
* - textChannel: Discord.TextChannel,
* - voiceChannel: Discord.VoiceConnection,
* - pauseMessage: Discord.Message,
* - playMessage: Discord.Message,
* - repeat: Integer,
* - shuffle: Boolean,
* - songs: [Object],
* - timeout: timeoutID // used in voiceStateUpdate.js
*/
client.servers = new Map();

const repeat_options = Object.freeze({ NONE: 0, ONE: 1, ALL: 2 });

// TODO -- START

// helper functions
client.init_server = (id, textChannel, voiceChannel) => {
  return new Promise((resolve) => {
    const info = {
      id: id,
      connection: null,
      textChannel: textChannel,
      voiceChannel: voiceChannel,
      pauseMessage: null,
      playMessage: null,
      repeat: repeat_options.NONE,
      shuffle: false,
      volume: 100,
      songs: [],
      timeout: null
    };

    client.servers.set(id, info);
    resolve();
  });
}

client.get_server = (id) => {
  return new Promise((resolve) => {
    let res = client.servers.get(id);
    resolve(res);
  });
}

client.rm_server = (id) => {
  return new Promise((id) => {
    client.servers.delete(id);
    resolve();
  });
}

client.send_message = (channel, message, options = {}) => {
  if (!options.color) options.color = '#36ACB6';
  return new Promise(async (resolve, reject) => {
    const embedMessage = new Discord.MessageEmbed();
    embedMessage.setColor(options.color);
    embedMessage.setDescription(message);
    try {
      let reply = await channel.send(embedMessage)
      if (options.timeout && !isNaN(options.timeout))
        reply.delete({ timeout: options.timeout })
          .catch(console.error);

      resolve(reply);
    }
    catch {
      console.error();
      reject();
    }
  });
}

client.send_playMessage = async (id) => {
  const server = await client.get_server(id);
  const song = server.songs[0];
  let msg = `Now playing :\n[${song.title}](${song.url}) [${song.timestamp}]`;

  if (server.songs.length > 1) {
    msg += `\n\nQueue :`;
    for (let i = 1; i < server.songs.length; i++)
      msg += `\n${i}. ${server.songs[i].title}`;
  }
  if (server.playMessage)
    await server.playMessage.delete();
  server.playMessage = await client.send_message(server.textChannel, msg);
  if (server.repeat !== repeat_options.NONE)
    client.set_repeatReactions(server);
}

client.send_errorMessage = (channel, message) => {
  const embedMessage = new Discord.MessageEmbed();
  embedMessage.setColor('#FF0000');
  embedMessage.setDescription(message);
  channel.send(embedMessage)
    .catch(console.error)
    .then(reply => {
      reply.delete({ timeout: 10000 })
        .catch(console.error);
    });
}

client.set_repeatReactions = (server) => {
  // repeat none
  if (server.repeat === repeatOptions.NONE) {
    if (server.playMessage.reactions.cache.get('🔂'))
      server.playMessage.reactions.cache.get('🔂').remove();
    if (server.playMessage.reactions.cache.get('🔁'))
      server.playMessage.reactions.cache.get('🔁').remove();
  }
  // repeat one
  else if (server.repeat === repeatOptions.ONE) {
    if (server.playMessage.reactions.cache.get('🔁'))
      server.playMessage.reactions.cache.get('🔁').remove();
    if (!server.playMessage.reactions.cache.get('🔂'))
      server.playMessage.react('🔂');
  }
  // repeat all
  else if (server.repeat === repeatOptions.ALL) {
    if (server.playMessage.reactions.cache.get('🔂'))
      server.playMessage.reactions.cache.get('🔂').remove();
    if (!server.playMessage.reactions.cache.get('🔁'))
      server.playMessage.react('🔁');
  }
}

// TODO -- END

['command.handler', 'event.handler'].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

mongoose.connect(process.env.MONGODB_SRV, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => {
    client.database_enabled = true;
    console.log('connected to mongodb database');
  })
  .catch(error => console.error(error));

client.login(process.env.DISCORD_TOKEN);

this.destructor = () => {
  client.destroy();
  console.log('offline');
};