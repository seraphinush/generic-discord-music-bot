require('dotenv').config();

const cooldowns = new Map();

module.exports = (client, Discord, message) => {

  const prefix = process.env.PREFIX;

  if (!message.content.startsWith(prefix) || message.content.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command = client.commands.get(cmd) || client.commands.find(el => el.aliases && el.aliases.includes(cmd));

  if (!command) return;

  // check client textChannel permissions
  if (command.cliTextPermissions) {
    const textChannel = message.channel;
    const permissions = textChannel.permissionsFor(message.client.user);
    for (const perm of command.cliTextPermissions) {
      if (!permissions.has(perm))
        return console.warn('WARNING <guildId : ' + message.guild.id + '>: Client does not have the correction permissions. missing : "' + perm + '"');
    }
  }

  // check user permissions
  if (command.userPermissions) {
    for (const perm of command.userPermissions) {
      if (!message.member.hasPermission(perm)) {
        return client.send_errorMessage(message.channel, `You do not have the correct permissions. missing : \`${perm}\``);
      }
    }
  }

  // check user voice requirement
  if (command.requireVoice) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return client.send_errorMessage(message.channel, 'You have to be connected to a voice channel to execute this command.');
  }

  // check client voiceCHannel permissions
  if (command.cliVoicePermissions) {
    const voiceChannel = message.member.voice.channel;
    const permissions = voiceChannel.permissionsFor(message.client.user);
    for (const perm of command.cliVoicePermissions) {
      if (!permissions.has(perm))
        return client.send_errorMessage(message.channel, `Client does not have the correction permissions. missing : \`${perm}\``);
    }
  }

  // check cooldowns
  if (!cooldowns.has(command.name))
    cooldowns.set(command.name, new Discord.Collection())

  const currentTime = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown) * 1000;

  if (timestamps.has(message.guild.id)) {
    const expirationTime = timestamps.get(message.guild.id) + cooldownAmount;
    if (currentTime < expirationTime) {
      const timeLeft = (expirationTime - currentTime) / 1000;
      return client.send_errorMessage(message.channel, 'Please wait ' + timeLeft.toFixed(2) + ' seconds before using `' + cmd + '` command again.');
    }
  }

  timestamps.set(message.guild.id, currentTime);
  setTimeout(() => { timestamps.delete(message.guild.id); }, cooldownAmount);

  try { command.execute(client, message, cmd, args, Discord); }
  catch (error) {
    client.send_errorMessage(message.channel, 'There was an error executing this command.');
    console.error();
  }

};
