module.exports = async (client) => {

  client.user.setActivity('.help', {  type: 'LISTENING' });
  console.log('ready.');

};
