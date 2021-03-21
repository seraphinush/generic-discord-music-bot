module.exports = {
  name: 'leave',
  aliases: ['off'],
  cooldown: 5,
  permissions: ['MANAGE_MESSAGES'],
  async execute(client, message) {
    const server = client.get_server(message.guild.id);

    if (!server) client.send_errorMessage(message.channel, 'There was an error retrieving server information.');
    else {
      await server.voiceChannel.leave();
      if (server.timeout) {
        clearTimeout(server.timeout);
        server.timeout = null;
      }
      client.servers.delete(message.guild.id);
    }

    message.delete({ timeout: 10000 })
      .catch((error) => { if (error.code == 50013) return; });
  }
};
