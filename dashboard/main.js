import {
  changeDescription,
  fetchWebApi,
  changeName
} from '../js/spotify-calls.js';
import { parseURLParams } from '../js/params-parser.js';
import { getScans } from '../js/spotify-calls';
import QRCode from 'qrcode';
import { createAttr } from '../js/attribution.js';
createAttr(document.querySelector('body'));
// Other stuff

// Function to remove a track from the playlist using Spotify Web API
async function removeTrackFromPlaylist(token, playlistId, trackId) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tracks: [{ uri: `spotify:track:${trackId}` }]
        })
      }
    );

    console.log(
      'Remove Track API Response:',
      response.status,
      response.statusText
    );

    if (response.ok) {
      console.log('Removed track from playlist:', trackId);
    } else {
      console.error(
        'Failed to remove track from playlist:',
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error('Error removing track:', error);
  }
}

// Function to periodically check the currently playing track and remove it
async function checkCurrentlyPlaying(playlistId, token, refreshToken) {
  const intervalTime = 20000; // Adjust the interval as needed (in milliseconds)

  const checkAndRemoveTrack = async () => {
    try {
      const refreshedTokenData = await refreshAccessToken(refreshToken);
      const token = refreshedTokenData.access_token;
      console.log('-------------------------');
      console.log(token);

      const data = await fetchWebApi(
        'me/player/currently-playing',
        token,
        'GET'
      );
      console.log('DATA: ', data);

      if (data && data.is_playing && data.item) {
        const playedTrackId = data.item.id;
        console.log(playedTrackId);
        console.log('Currently Playing Track ID:', playedTrackId);

        // Remove the played track from the playlist
        await removeTrackFromPlaylist(token, playlistId, playedTrackId);
        let playlist_songs = await fetchWebApi(
          'playlists/' + playlistId,
          token,
          'GET'
        );
        playlist_songs = playlist_songs.tracks.items;
        updateDOMPlaylist(playlist_songs);
      } else {
        console.log('No track currently playing.');
      }
    } catch (error) {
      console.error('Error checking and removing track:', error);
    }
    console.log('-------------------------');
  };

  // Initial check and setup interval
  await checkAndRemoveTrack();
  setInterval(checkAndRemoveTrack, intervalTime);
}

// Function to refresh the access token using the refresh token
async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: '45b1711a56714857811215f27b15ffc7', // Replace with your client ID
        client_secret: 'd009262d84014f33a5fe5dddf731248f' // Replace with your client secret
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

// Main function
const response = parseURLParams(window.location.href);
var refresh_token;
var playlistId;
if (response) {
  console.log(response);
  main(response);
}

async function main(params) {
  refresh_token = params.token[0];
  playlistId = params.playlistId[0];
  document.querySelector('loader>p').innerHTML = 'Gotten Params';
  let token;

  console.log(refresh_token, playlistId);

  token = await refreshAccessToken(refresh_token).then(
    (data) => (token = data.access_token)
  );
  document.querySelector('loader>p').innerHTML = 'Updated Token';

  console.log(token);

  const playlistInfo = await getPlaylistInfo(playlistId, token);

  document.querySelector('loader>p').innerHTML = 'Fetched Playlist Info';
  console.log(playlistInfo);

  updateDOM(playlistInfo);
  document.querySelector('loader>p').innerHTML = 'Updated DOM';

  await checkCurrentlyPlaying(playlistId, token, refresh_token);
  document.querySelector('loader>p').innerHTML =
    'Checking for currently playing track';

  await updatePlaylist(token, playlistId);

  document
    .getElementById('saveDescription')
    .addEventListener('click', async () => {
      await updatePlaylistInfo(playlistId, token);
    });
}

async function updatePlaylistInfo(playlistId, token) {
  let descriptionValue = document.getElementById('description').value;
  let nameValue = document.getElementById('playlistName').value;

  descriptionValue = descriptionValue.trim();
  nameValue = nameValue.trim();
  if (descriptionValue !== '') {
    await changeDescription(token, playlistId, descriptionValue);
    console.log('Updated Description');
  }
  if (nameValue !== '') {
    await changeName(token, playlistId, nameValue);
    console.log('Updated Name');
  }
  console.log('Changes saved.');
  nameValue = '';
  descriptionValue = '';
}

async function getPlaylistInfo(playlistId, token) {
  const scans = await getScans(token, playlistId);
  let isCurrent = false;
  scans > 0 && (isCurrent = true);
  console.log(playlistId, token);
  const playlist = await fetchWebApi(`playlists/${playlistId}`, token, 'GET');
  const amountOfSongs = playlist.tracks.total;
  const songsList = await fetchWebApi(
    `playlists/${playlistId}/tracks`,
    token,
    'GET'
  );

  return {
    isCurrent,
    scans,
    amountOfSongs,
    songsList,
    playlist
  };
}

function updateDOM(data) {
  const isCurrent = data.isCurrent;
  const scans = data.scans;
  const amountOfSongs = data.amountOfSongs;
  const songsList = data.songsList;
  const playlist = data.playlist;
  const name = playlist.name;

  //   DOM ELEMENTS

  const title = document.getElementById('title');
  const scans_span = document.getElementById('scans_span');
  const playlist_container = document.getElementById('playlist');
  const qrCode = document.getElementById('qrcode');

  //   Update the DOM
  title.innerText = `Dashboard | ${name} | ${
    isCurrent ? 'Current' : 'Not Current'
  } Playlist`;
  scans_span.innerText = scans;
  document.getElementById('songs_count').innerText = `${amountOfSongs} songs`;

  //   Create the QR Code
  QRCode.toCanvas(qrCode, window.location.href, function (error) {
    if (error) {
      console.error(error);
    }
  });

  qrCode.onclick = () => {
    window.open(
      `https://party-play.foxxo.studio/addSong/index.html?playlistId=${playlist.id}&token=${refresh_token}`,
      '_blank'
    );
  };

  //   Add the songs to the playlist container

  {
    var i = 1;
    var size = songsList.items.length;
    songsList.items.forEach((item) => {
      const song = document.createElement('li');
      song.style.setProperty('--n', i++);
      song.style.setProperty('--size', size);
      song.classList.add('song');
      song.innerText = item.track.name;
      playlist_container.appendChild(song);
    });
  }

  document.getElementById('loading').style.transform = 'translateY(-100%)';
}

async function checkForNewSongs(token, playlistId) {
  const playlistInfo = await getPlaylistInfo(playlistId, token);
  const currentSongs = playlistInfo.songsList.items;
  let newSongs = await fetchWebApi(
    `playlists/${playlistId}/tracks`,
    token,
    'GET'
  );
  newSongs = newSongs.items;
  console.log(currentSongs, newSongs);
  if (currentSongs !== newSongs) {
    return { newSongs: newSongs, isNew: true, currentSongs };
  }
  return { newSongs: {}, isNew: false, currentSongs };
}

async function updatePlaylist(token, playlistId) {
  setInterval(async () => {
    let { newSongs, isNew, currentSongs } = await checkForNewSongs(
      token,
      playlistId
    );
    if (isNew) {
      newSongs = newSongs.filter((song) => {
        return !currentSongs.includes(song);
      });
      currentSongs = [...currentSongs, ...newSongs];
      console.log('UPDATRE DSONGS: ', currentSongs);
      updateDOMPlaylist(currentSongs);
    }
  }, 30000);
}

function updateDOMPlaylist(songs) {
  const playlist_container = document.getElementById('playlist');
  playlist_container.innerHTML = '';
  var i = 1;
  var size = songs.length;
  songs.forEach((item) => {
    const song = document.createElement('li');
    song.style.setProperty('--n', i++);
    song.style.setProperty('--size', size);
    song.classList.add('song');
    song.innerText = item.track.name;
    playlist_container.appendChild(song);
  });
}
