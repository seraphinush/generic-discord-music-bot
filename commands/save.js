const playlistModel = require('../models/playlist.model');

module.exports = {
  name: 'save',
  cooldown: 5,
  permissions: ['MANAGE_MESSAGES'],
  async execute(client, message) {
    if (!client.database_enabled)
      return client.send_errorMessage(message.channel, 'This command is unavailable. missing database connection');

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      client.send_errorMessage(message.channel, 'YYou have to be connected to a voice channel to execute this command.');
    else {
      const server = client.get_server(message.guild.id);
      if (!server) client.send_errorMessage(message.channel, 'There was an error retrieving server information.');
      else {
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
    }

    message.delete({ timeout: 10000 })
      .catch((error) => { if (error.code == 50013) return; });
  }
};
