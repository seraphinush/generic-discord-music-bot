const playlistModel = require('../../models/playlist.model');

module.exports = async (client, guild) => {

  await playlistModel.findOneAndDelete({
    serverId: guild.id
  })
    .catch((error) => { console.log(error) })
    .then(() => { console.log(`Client terminated from the Discord server : ${guild.name}<${guild.id}>`); });

};
