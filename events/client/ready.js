module.exports = async (client) => {

  client.user.setActivity('`.help`', { type: 'STREAMING' });

  console.log('ready.');
};
