module.exports = {
  name: 'help',
  cooldown: 5,
  async execute(client, message) {
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
    reply += '\n- clear : clear music in queue';
    reply += '\n- repeat <none | one | all> : disable repeat music | repeat current music | repeat all music in order of queue';
    reply += '\n- volume : adjust volume of the immediate voice activity between 0 and 100. does not affect other voice activity in queue';
    reply += '\n- save : save current song list to an online database';
    reply += '\n- load : load song list from an online database to queue. automatically plays if there is no voice activity';
    client.send_message(message.channel, reply);
  }
};
