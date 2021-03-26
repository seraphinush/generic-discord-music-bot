const playlistModel = require('../models/playlist.model');

module.exports = {
  name: 'save',
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
    // check database connection
    if (!client.database_enabled)
      return client.send_errorMessage(message.channel, 'This command is unavailable. missing database connection');

    const server = await client.get_server(message.guild.id);

    // checks
    if (!server)
      return client.send_errorMessage(message.channel, 'There was an error retrieving server information.');

    if (!server.songs.length)
      return client.send_errorMessage(message.channel, 'There are no songs in queue.');

    // main
    const response = await playlistModel.findOne({
      serverId: message.guild.id
    });
    if (!response) {
      let newPlaylist = await playlistModel.create({
        serverId: message.guild.id,
        playlist: server.songs
      });
      await newPlaylist.save();
      client.send_message(message.channel, 'Saved new playlist.', { timeout: 10000 });
    }
    else {
      response.playlist = server.songs;
      await response.save();
      client.send_message(message.channel, 'Saved and updated playlist.', { timeout: 10000 });
    }
  }
};
