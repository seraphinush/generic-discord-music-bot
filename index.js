require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command.handler', 'event.handler'].forEach(handler => {
  require(`./handlers/${handler}`)(client, Discord);
});

mongoose.connect(process.env.MONGODB_SRV, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => {
    client.database_enabled = true;
    console.log('connected to mongodb database');
  })
  .catch(error => console.error(error));

client.login(process.env.DISCORD_TOKEN);

this.destructor = () => {
  client.destroy();
  console.log('offline');
};