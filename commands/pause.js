module.exports = {
  name: 'pause',
  cooldown: 5,
  requireVoice: true,
  userPermissions: [
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

    if (!server.connection)
      return client.send_errorMessage(textChannel, 'There is currently no voice activity.');

    if (!server.connection.dispatcher)
      return client.send_errorMessage(textChannel, 'There was an error retrieving voice activity information.');

    if (server.connection.dispatcher.paused)
      return client.send_errorMessage(textChannel, 'There is currently no active voice activity.');

    // main
    server.connection.dispatcher.pause();
    server.pauseMessage = await client.send_message(textChannel, 'Paused-', { color: '#FFCC00' });
  }
};
