const ytdl = require('ytdl-core');
const yt_search = require('yt-search');

const playlistModel = require('../models/playlist.model');
const { trimEnd } = require('ffmpeg-static');

const repeatOptions = Object.freeze({ NONE: 0, ONE: 1, ALL: 2 });

module.exports = {
  name: 'play',
  aliases: ['p', 'playnext', 'load'],
  cooldown: 2,
  requireVoice: true,
  userPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'CONNECT',
    'SPEAK'
  ],
  cliTextPermissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'ADD_REACTIONS'
  ],
  cliVoicePermissions: [
    'VIEW_CHANNEL',
    'CONNECT',
    'SPEAK'
  ],

  // helper functions
  // calculation timestamp based on duration in seconds
  parseTimestamp(seconds) {
    let res = '';
    res += seconds > 3600 ? Math.floor((seconds / 3600)).toString() + ':' : '';
    let minutes = ((seconds % 3600) > 60) ? Math.floor((seconds % 3600) / 60).toString() + ':' : '00:';
    res += minutes.length > 1 ? minutes : '0' + minutes;
    res += ((seconds % 3600) % 60).toString();
    return res;
  },

  // search youtube and return top first video result
  async videoFinder(query) {
    const video_result = await yt_search(query);
    return (video_result.videos.length > 1) ? video_result.videos[0] : null;
  },

  // stream music through voice activity
  async musicPlayer(client, server) {
    const song = server.songs[0];
    if (!song) {
      if (server.pauseMessage) {
        await server.pauseMessage.delete();
        server.pauseMessage = null;
      }
      if (server.playMessage) {
        await server.playMessage.delete();
        server.playMessage = null;
      }
      return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly' });
    await server.connection.play(stream, { seek: 0, volume: 1 })
      .on('finish', () => {
        // check repeat option
        if (server.repeat === repeatOptions.NONE) server.songs.shift();
        else if (server.repeat === repeatOptions.ONE) { }
        else if (server.repeat === repeatOptions.ALL) server.songs.push(server.songs.shift());
        setTimeout(() => { this.musicPlayer(client, server); }, 200);
      })
      .on('error', console.error);

    server.connection.dispatcher.setVolume((server.volume / 100).toFixed(2));
    client.send_playMessage(server.id);
  },

  // main
  async execute(client, message, cmd, args) {
    const textChannel = message.channel;
    const voiceChannel = message.member.voice.channel;
    let server = await client.get_server(message.guild.id);

    // command : play, p
    if (cmd === 'play' || cmd === 'p' || cmd === 'playnext') {
      if (!args.length)
        client.send_errorMessage(textChannel, 'Play command requires an argument. usage : `play <URL | search term>`');
      else {
        let song = {};
        if (ytdl.validateURL(args[0])) {
          const song_info = await ytdl.getInfo(args[0]);
          song = {
            title: song_info.videoDetails.title.length < 50 ? song_info.videoDetails.title : song_info.videoDetails.title.slice(0, 48) + '..',
            url: args[0],
            timestamp: this.parseTimestamp(parseInt(song_info.videoDetails.lengthSeconds))
          };
        }
        else {
          const video = await this.videoFinder(args.join(' '));
          if (video) {
            song = {
              title: video.title.length < 50 ? video.title : video.title.slice(0, 48) + '..',
              url: video.url,
              timestamp: video.timestamp
            };
          } else {
            client.send_errorMessage(textChannel, 'There was an error finding video.');
          }
        }

        if (!server) {
          await client.init_server(message.guild.id, textChannel, voiceChannel);
          server = await client.get_server(message.guild.id);
          server.songs.push(song);

          try {
            const connection = await voiceChannel.join();
            connection.voice.setSelfDeaf(true);
            server.connection = connection;
            await this.musicPlayer(client, server);
          } catch {
            client.rm_server(message.guild.id);
            client.send_errorMessage(textChannel, 'There was an error connecting to the voice channel.');
          }
        } else {
          // remove pause message
          if (server.pauseMessage) {
            await server.pauseMessage.delete()
            client.pauseMessage = null;
          }

          // add to song list
          if (cmd === 'playnext') server.songs.splice(1, 0, song);
          else server.songs.push(song);

          // play now or update play message
          if (server.songs.length > 1)
            client.send_playMessage(server.id);
          else
            await this.musicPlayer(client, server);
        }
      }
    }

    // command : load
    else if (cmd === 'load') {
      if (!client.database_enabled)
        client.send_errorMessage(textChannel, 'This command is unavailable. missing database connection');
      if (!server)
        client.send_errorMessage(textChannel, 'There was an error retrieving server information.');

      else {
        let response = await playlistModel.findOne({
          serverId: message.guild.id
        });
        if (!response)
          client.send_errorMessage(textChannel, 'There was an error retrieving playlist information.');
        else {
          server.songs = server.songs.concat(response.playlist);
          client.send_message(textChannel, 'Loaded playlist to queue.', { timeout: 10000 });

          if (server.connection.dispatcher)
            client.send_playMessage(server.id);
          else
            await this.musicPlayer(client, server);
        }
      }
    }
  }
};
