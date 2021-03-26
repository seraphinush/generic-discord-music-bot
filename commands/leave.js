module.exports = {
  name: 'leave',
  aliases: ['off'],
  cooldown: 5,
  requireVoice: false,
  userPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES'
  ],
  cliVoicePermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'CONNECT',
    'SPEAK'
  ],
  async execute(client, message) {
    const textChannel = message.channel;
    const server = await client.get_server(message.guild.id);

    // checks
    if (!server)
      return client.send_errorMessage(textChannel, 'There was an error retrieving server information.');

    if (!server.voiceChannel)
      return client.send_errorMessage(textChannel, 'There was an error retrieving voice channel information.');

    // main
    await server.voiceChannel.leave();
    if (server.timeout) {
      clearTimeout(server.timeout);
      server.timeout = null;
    }
    client.servers.delete(message.guild.id);
  }};
