module.exports = {
  name: 'join',
  aliases: ['on'],
  cooldown: 5,
  requireVoice: true,
  userPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'CONNECT'
  ],
  cliTextPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES'
  ],
  cliVoicePermissions: [
    'VIEW_CHANNEL',
    'CONNECT',
    'SPEAK'
  ],
  async execute(client, message) {
    const voiceChannel = message.member.voice.channel;

    // main
    let server = await client.get_server(message.guild.id);
    if (!server) {
      await client.init_server(message.guild.id, message.channel, voiceChannel);
      server = await client.get_server(message.guild.id);
    }

    server.voiceChannel = voiceChannel;
    const connection = await voiceChannel.join();
    connection.voice.setSelfDeaf(true);
    server.connection = connection;
  }
};
