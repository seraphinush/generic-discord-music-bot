require('dotenv').config();

const cooldowns = new Map();

module.exports = (client, Discord, message) => {

  const prefix = process.env.PREFIX;

  if (!message.content.startsWith(prefix) || message.content.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command = client.commands.get(cmd) || client.commands.find(el => el.aliases && el.aliases.includes(cmd));

  if (!command) return;

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
