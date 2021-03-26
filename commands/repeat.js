const repeatOptions = Object.freeze({ NONE: 0, ONE: 1, ALL: 2 });

module.exports = {
  name: 'repeat',
  cooldown: 2,
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
  async execute(client, message, cmd, args) {
    const server = await client.get_server(message.guild.id);

    // checks
    if (!server)
      return client.send_errorMessage(message.channel, 'There was an error retrieving server information.');

    if (!server.connection)
      return client.send_errorMessage(message.channel, 'There is currently no voice activity.');

    if (!server.connection.dispatcher)
      return client.send_errorMessage(message.channel, 'There was an error retrieving voice activity information.');

    if (!args.length)
      return client.send_errorMessage(message.channel, 'Repeat command requires an argument. usage : repeat <none | one | all>');

    // main
    let arg = args[0].toLowerCase();
    if (!['none', 'one', 'all'].includes(arg))
      return client.send_errorMessage(message.channel, 'Invalid argument. usage : repeat <none | one | all>');

    if (arg === 'none') server.repeat = repeatOptions.NONE;
    else if (arg === 'one') server.repeat = repeatOptions.ONE;
    else if (arg === 'all') server.repeat = repeatOptions.ALL;
    client.set_repeatReactions(server);
  }
};
