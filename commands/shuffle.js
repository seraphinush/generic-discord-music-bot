module.exports = {
  name: 'shuffle',
  cooldown: 4,
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
  async execute(client, message) {
    const server = await client.get_server(message.guild.id);

    // checks
    if (!server)
      return client.send_errorMessage(message.channel, 'There was an error retrieving server information.');

    if (server.songs.length < 3) // need at least 2 to shuffle
      return client.send_errorMessage(message.channel, 'There are no other songs in queue.');

    // main
    // Knuth shuffle implementation
    let array = server.songs.slice(1);
    console.log('arr :' + JSON.stringify(array))
    let n = array.length; 
    let t = null;
    let i = null;
    while (n) {
      i = Math.floor(Math.random() * n--);
      t = array[n];
      array[n] = array[i];
      array[i] = t;
    }

    server.songs = [server.songs[0]].concat(array);
    client.send_playMessage(server.id);
  }
};
