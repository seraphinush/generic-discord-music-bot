module.exports = {
  name: 'remove',
  aliases: ['rm'],
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

    if (server.songs.length < 2) 
      return client.send_errorMessage(message.channel, 'There are no other songs in queue.');

    if (!args.length)
      return client.send_errorMessage(message.channel, 'Remove command requires an argument. usage : remove <number>');

    // main
    let index = parseInt(args[0]);
    if (typeof index !== 'number')
      return client.send_errorMessage(message.channel, 'Remove command requires a `Number` as argument. usage : remove <number>');

    server.songs.splice(index, 1);
    client.send_playMessage(server.id);
  }
};
