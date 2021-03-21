module.exports = {
  name: 'join',
  aliases: ['on'],
  cooldown: 5,
  permissions: ['MANAGE_MESSAGES'],
  async execute(client, message) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      client.send_errorMessage(message.channel, 'You have to be connected to a voice channel to execute this command.');
    else {
      let server = client.get_server(message.guild.id);
      if (!server) {
        await client.init_server(message);
        server = await client.get_server(message.guild.id);
        server.voiceChannel = voiceChannel;
      }
      
      const connection = await voiceChannel.join();
      connection.voice.setSelfDeaf(true);
      server.connection = connection;
    }

    message.delete({ timeout: 10000 })
    .catch((error) => { if (error.code == 50013) return; });
  }
};
