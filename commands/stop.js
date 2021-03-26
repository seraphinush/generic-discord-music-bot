module.exports = {
  name: 'stop',
  cooldown: 5,
  requireVoice: true,
  userPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'CONNECT',
    'SPEAK'
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
    const server = await client.get_server(message.guild.id);

    // checks
    if (!server)
      return client.send_errorMessage(message.channel, 'There was an error retrieving server information.');

    if (!server.connection)
      return client.send_errorMessage(message.channel, 'There is currently no voice activity.');

    if (!server.connection.dispatcher)
      return client.send_errorMessage(message.channel, 'There was an error retrieving voice activity information.');

    // main
    server.songs = [];
    server.connection.dispatcher.end();
  }
};
