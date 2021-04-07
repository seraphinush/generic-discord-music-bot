module.exports = {
  name: 'help',
  cooldown: 5,
  requireVoice: true,
  userPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES'
  ],
  cliTextPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES'
  ],
  async execute(client, message) {
    const textChannel = message.channel;

    let reply = 'Prefix : `' + process.env.PREFIX + '`';
    reply += '\nCommands :';
    reply += '\n- join, on : join voice channel';
    reply += '\n- leave, off : leave voice channel';
    reply += '\n- play, p <URL | search term> : play music or add music to queue';
    reply += '\n- playnext <URL | search term> : play music or add music to the top of queue';
    reply += '\n- stop : stop music';
    reply += '\n- pause : pause music';
    reply += '\n- resume : resume music';
    reply += '\n- skip : skip to next music in queue if queue exists';
    reply += '\n- remove, rm <Number> : remove music in queue at index if queue exists';
    reply += '\n- clear : clear music in queue';
    reply += '\n- repeat <none | one | all> : disable repeat music | repeat current music | repeat all music in order of queue';
    reply += '\n- shuffle : shuffle music in queue if queue exists';
    reply += '\n- volume <Number> : adjust volume of voice activity between 0 and 100. does not adjust the user-designated volume of the client itself';
    reply += '\n- save : save current song list to an online database';
    reply += '\n- load : load song list from an online database to queue. automatically plays if there is no voice activity';
    reply += '\n\nCheck out our [website](https://seraphinush.github.io/generic-discord-music-bot) for more information';
    client.send_message(textChannel, reply);
  }
};
