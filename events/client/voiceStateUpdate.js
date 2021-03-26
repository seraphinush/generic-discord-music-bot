const TWO_MINUTES = 120000;

module.exports = async (client, Discord, oldState, newState) => {
  const server = await client.get_server(newState.guild.id)
  if (!server) return;

  const voiceChannel = server.voiceChannel;
  if (!voiceChannel) return;

  if (voiceChannel.members.size === 1) {
    if (voiceChannel.members.has(client.user.id)) {

      if (server.timeout) {
        clearTimeout(server.timeout);
        server.timeout = null;
      }
      server.timeout = setTimeout(async () => {
        if (voiceChannel.members.size === 1) {
          if (voiceChannel.members.has(client.user.id)) {
            await voiceChannel.leave();
            client.servers.delete(newState.guild.id);
          }
        }
      }, TWO_MINUTES);
    }
  } else {
    if (server.timeout) {
      clearTimeout(server.timeout);
      server.timeout = null;
    }
  }
};
