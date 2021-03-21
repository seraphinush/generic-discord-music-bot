const ytdl = require('ytdl-core');
const yt_search = require('yt-search');

const playlistModel = require('../models/playlist.model');

const repeatOptions = Object.freeze({ NONE: 0, ONE: 1, ALL: 2 });

module.exports = {
  name: 'play',
  aliases: ['p', 'playnext', 'stop', 'pause', 'resume', 'skip', 'clear', 'remove', 'rm', 'repeat', 'volume', 'load'],
  cooldown: 2,
  permissions: ['MANAGE_MESSAGES'],
  async execute(client, message, cmd, args, Discord) {

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return client.send_errorMessage(message.channel, 'You have to be connected to a voice channel to execute this command.');

    // permissions
    const permission = voiceChannel.permissionsFor(message.client.user);
    if (!permission.has('CONNECT'))
      return client.send_errorMessage(message.channel, 'You do not have the correct permissions.');

    else if (!permission.has('SPEAK'))
      return client.send_errorMessage(message.channel, 'You do not have the correct permissions.');

    else {
      let server = client.get_server(message.guild.id);

      // helper functions

      // calculation timestamp based on duration in seconds
      const parse_timestamp = (seconds) => {
        let res = '';
        res += seconds > 3600 ? Math.floor((seconds / 3600)).toString() + ':' : '';
        let minutes = ((seconds % 3600) > 60) ? Math.floor((seconds % 3600) / 60).toString() + ':' : '00:';
        res += minutes.length > 1 ? minutes : '0' + minutes;
        res += ((seconds % 3600) % 60).toString();
        return res;
      }

      // search youtube and return top first video result
      const video_finder = async (query) => {
        const video_result = await yt_search(query);
        return (video_result.videos.length > 1) ? video_result.videos[0] : null;
      }

      // stream music through voice activity
      const musicPlayer = async (song, guild, channel) => {
        const server = client.get_server(guild.id);

        if (!server) return;

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
            setTimeout(() => { musicPlayer(server.songs[0], guild, channel); }, 200);
          })
          .on('error', console.error);

        send_playMessage(guild, channel);
      }

      // send music player message
      const send_playMessage = async (guild, channel) => {
        const server = await client.get_server(guild.id);
        const song = server.songs[0];

        let msg = `Now playing :\n[${song.title}](${song.url}) [${song.timestamp}]`;
        if (server.songs.length > 1) {
          msg += `\n\nQueue :`;
          for (let i = 1; i < server.songs.length; i++)
            msg += `\n${i}. ${server.songs[i].title}`;
        }
        try {
          if (server.playMessage) await server.playMessage.delete();
        }
        catch { }
        server.playMessage = await client.send_message(channel, msg);
        set_reactions(guild);
      }

      // set reactions appropriate to player settings
      const set_reactions = async (guild) => {
        const server = await client.get_server(guild.id);

        // repeat none
        if (server.repeat === repeatOptions.NONE) {
          if (server.playMessage.reactions.cache.get('🔂'))
            server.playMessage.reactions.cache.get('🔂').remove();
          if (server.playMessage.reactions.cache.get('🔁'))
            server.playMessage.reactions.cache.get('🔁').remove();
        }
        // repeat one
        else if (server.repeat === repeatOptions.ONE) {
          if (server.playMessage.reactions.cache.get('🔁'))
            server.playMessage.reactions.cache.get('🔁').remove();
          if (!server.playMessage.reactions.cache.get('🔂'))
            server.playMessage.react('🔂');

        }
        // repeat all
        else if (server.repeat === repeatOptions.ALL) {
          if (server.playMessage.reactions.cache.get('🔂'))
            server.playMessage.reactions.cache.get('🔂').remove();
          if (!server.playMessage.reactions.cache.get('🔁'))
            server.playMessage.react('🔁');
        }
      }

      // command : play, p
      if (cmd === 'play' || cmd === 'p' || cmd === 'playnext') {
        if (!args.length)
          client.send_errorMessage(message.channel, 'Play command requires an argument. usage : `play <URL | search term>`');
        else {
          let song = {};
          if (ytdl.validateURL(args[0])) {
            const song_info = await ytdl.getInfo(args[0]);
            song = {
              title: song_info.videoDetails.title.length < 50 ? song_info.videoDetails.title : song_info.videoDetails.title.slice(0, 48) + '..',
              url: args[0],
              timestamp: parse_timestamp(parseInt(song_info.videoDetails.lengthSeconds))
            };
          }
          else {
            const video = await video_finder(args.join(' '));
            if (video) {
              song = {
                title: video.title.length < 50 ? video.title : video.title.slice(0, 48) + '..',
                url: video.url,
                timestamp: video.timestamp
              };
            } else {
              client.send_errorMessage(message.channel, 'There was an error finding video.');
            }
          }

          if (!server) {
            await client.init_server(message);
            server = await client.get_server(message.guild.id);
            server.songs.push(song);

            try {
              const connection = await voiceChannel.join();
              connection.voice.setSelfDeaf(true);
              server.connection = connection;
              await musicPlayer(server.songs[0], message.guild, message.channel);
            } catch {
              server.delete(message.guild.id);
              client.send_errorMessage(message.channel, 'There was an error connecting to the voice channel.');
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
              send_playMessage(message.guild, message.channel);
            else
              await musicPlayer(server.songs[0], message.guild, message.channel);
          }
        }
      }

      // command : load
      else if (cmd === 'load') {
        if (!client.database_enabled) client.send_errorMessage(message.channel, 'This command is unavailable. missing database connection');
        if (!server) client.send_errorMessage(message.channel, 'There was an error retrieving server information.');
        else {
          let response = await playlistModel.findOne({
            serverId: message.guild.id
          });
          if (!response)
            client.send_errorMessage(message.channel, 'There was an error retrieving playlist information.');
          else {
            server.songs = server.songs.concat(response.playlist);
            client.send_message(message.channel, 'Loaded playlist to queue.', { timeout: 10000 });

            if (server.connection.dispatcher)
              send_playMessage(message.guild, message.channel);
            else
              await musicPlayer(server.songs[0], message.guild, message.channel);
          }
        }
      }

      else {
        if (!server) client.send_errorMessage(message.channel, 'There was an error retrieving server information.');
        else if (!server.connection) client.send_errorMessage(message.channel, 'There is currently no voice activity.');

        // command : stop
        else if (cmd === 'stop') {
          server.songs = [];
          if (!server.connection.dispatcher) client.send_errorMessage(message.channel, 'There was an error retrieving voice activity information.');
          else {
            server.connection.dispatcher.end();
          } 4
        }

        // command : pause
        else if (cmd === 'pause') {
          if (!server.connection.dispatcher) client.send_errorMessage(message.channel, 'There was an error retrieving voice activity information.');
          else {
            server.connection.dispatcher.pause();
            server.pauseMessage = await client.send_message(message.channel, 'Paused-', { color: '#FFCC00' });
          }
        }

        // command : resume
        else if (cmd === 'resume') {
          if (!server.connection.dispatcher) client.send_errorMessage(message.channel, 'There was an error retrieving voice activity information.');
          else {
            server.connection.dispatcher.resume();
            await server.pauseMessage.delete();
            server.pauseMessage = null;
          }
        }

        // command : skip
        else if (cmd === 'skip') {
          if (server.songs.length < 2) client.send_errorMessage(message.channel, 'There are no other songs in queue.');
          else if (!server.connection.dispatcher) client.send_errorMessage(message.channel, 'There was an error retrieving voice activity information.');
          else {
            server.connection.dispatcher.end();
          }
        }

        // command : clear
        else if (cmd === 'clear') {
          if (server.songs.length < 2) client.send_errorMessage(message.channel, 'There are no other songs in queue.');
          else {
            server.songs = [server.songs[0]];
            send_playMessage(message.guild, message.channel);
          }
        }

        // command : remove, rm
        else if (cmd === 'remove' || cmd === 'rm') {
          if (server.songs.length < 2) client.send_errorMessage(message.channel, 'There are no other songs in queue.');
          else if (!args[0]) client.send_errorMessage(message.channel, 'Remove command requires an argument. usage : repeat <number>');
          else {
            let index = parseInt(args[0]);
            if (typeof index !== 'number') client.send_errorMessage(message.channel, 'Remove command requires a number as argument. usage : repeat <number>');
            else {
              server.songs.splice(index, 1);
              send_playMessage(message.guild, message.channel);
            }
          }
        }

        // command : repeat
        else if (cmd === 'repeat') {
          if (!args[0]) client.send_errorMessage(message.channel, 'Repeat command requires an argument. usage : repeat <none | one | all>');
          else {
            let arg = args[0].toLowerCase();
            if (!['none', 'one', 'all'].includes(arg)) client.send_errorMessage(message.channel, 'Invalid argument. usage : repeat <none | one | all>');
            else {
              if (arg === 'none') server.repeat = repeatOptions.NONE;
              else if (arg === 'one') server.repeat = repeatOptions.ONE;
              else if (arg === 'all') server.repeat = repeatOptions.ALL;
              set_reactions(message.guild);
            }
          }
        }

        // command : volume
        else if (cmd === 'volume') {
          if (!args[0]) client.send_errorMessage(message.channel, 'Volume command requires an argument. usage : volume <number>');
          else if (!server.connection.dispatcher) client.send_errorMessage(message.channel, 'There was an error retrieving voice activity information.');
          else {
            let value = parseInt(args[0]);
            if (typeof value !== 'number') client.send_errorMessage(message.channel, 'Volume command requires a number as argument. usage : volume <number>');
            else if (value < 0 || value > 100) client.send_errorMessage(message.channel, 'Volume command requires a number between 0 and 100.');
            else {
              server.connection.dispatcher.setVolume((value / 100).toFixed(2));
              client.send_message(message.channel, `Volume adjusted to ${value}.`, { timeout: 10000 });
            }
          }
        }
      }
    }

    message.delete({ timeout: 10000 })
      .catch((error) => { if (error.code == 50013) return; });
  }
};
