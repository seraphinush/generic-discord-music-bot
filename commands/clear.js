module.exports = {
  name: 'clear',
  cooldown: 5,
  requireVoice: true,
  userPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'CONNECT'
  ],
  cliTextPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'ADD_REACTIONS'
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

    if (server.songs.length < 2)
      return client.send_errorMessage(textChannel, 'There are no other songs in queue.');

    // main
    server.songs = [server.songs[0]];
    client.send_playMessage(server.id);
  }
};
