const fs = require('fs');

module.exports = (client) => {

  const load_dir = (dir) => {
    const eventFiles = fs.readdirSync(`./events/${dir}`).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(`../events/${dir}/${file}`);
      const eventName = file.split('.')[0];
      client.on(eventName, event.bind(null, client));
    }
  }

  ['client', 'guild'].forEach(el => load_dir(el));

}