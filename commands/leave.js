module.exports = {
  name: 'leave',
  aliases: ['off'],
  cooldown: 5,
  requireVoice: false,
  userPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES'
  ],
  cliTextPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES'
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
    client.rm_server(message.guild.id);
  }};
