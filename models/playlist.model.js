const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  playlist: { type: [Object], required: true }
});

const model = mongoose.model('playlist', playlistSchema);

module.exports = model;
