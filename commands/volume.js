module.exports = {
  name: 'volume',
  cooldown: 2,
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
  async execute(client, message, cmd, args) {
    const server = await client.get_server(message.guild.id);

    // checks
    if (!server)
      return client.send_errorMessage(message.channel, 'There was an error retrieving server information.');

    if (!args.length)
      return client.send_errorMessage(message.channel, 'Volume command requires an argument. usage : volume <number>');

    let value = parseInt(args[0]);
    if (typeof value !== 'number')
      return client.send_errorMessage(message.channel, 'Volume command requires a `Number` as argument. usage : volume <number>');

    if (value < 0 || value > 100)
      return client.send_errorMessage(message.channel, 'Volume command requires a number between 0 and 100.');

    // main
    server.volume = value;
    client.send_message(message.channel, `Volume adjusted to ${value}.`, { timeout: 10000 });

    // adjust live
    if (server.connection) return;
    if (server.connection.dispatcher) return;
    server.connection.dispatcher.setVolume((value / 100).toFixed(2));
  }
};
