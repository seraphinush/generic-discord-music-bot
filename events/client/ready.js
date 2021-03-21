const repeat_options = Object.freeze({ NONE: 0, ONE: 1, ALL: 2 });

module.exports = async (client, Discord) => {

  /*
  * key : guild.id
  * value :
  * - connection: Discord.StreamDispatcher,
  * - textChannel: Discord.TextChannel,
  * - voiceChannel: Discord.VoiceConnection,
  * - pauseMessage: Discord.Message,
  * - playMessage: Discord.Message,
  * - repeat: Integer,
  * - shuffle: Boolean,
  * - songs: [Object],
  * - timeout: timeoutID 
  */
  client.servers = new Map();

  client.get_server = (id) => {
    return client.servers.get(id);
  }

  client.init_server = (message) => {
    const info = {
      connection: null,
      textChannel: message.channel,
      voiceChannel: message.member.voice.channel,
      pauseMessage: null,
      playMessage: null,
      repeat: repeat_options.NONE,
      shuffle: false,
      songs: [],
      timeout: null
    };

    client.servers.set(message.guild.id, info);
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

  console.log('ready.');

};
