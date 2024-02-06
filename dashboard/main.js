import { changeDescription, fetchWebApi } from '../js/spotify-calls.js';
import { parseURLParams } from '../js/params-parser.js';
import { getScans } from '../js/spotify-calls';
import QRCode from 'qrcode';

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
if (response) {
  console.log(response);
  main(response);
}

async function main(params) {
  const refresh_token = params.token[0];
  const playlistId = params.playlistId[0];
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

  document.getElementById('saveDescription').addEventListener('click', () => {
    changeDescription(
      token,
      playlistId,
      document.getElementById('description').value
    ).then(() => {
      console.log('Updated Description');
    });
  });
}

async function getPlaylistInfo(playlistId, token) {
  const scans = await getScans(token, playlistId);
  const isCurrent = false;
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
  const songsAmountTitle = document.createElement('h2');
  songsAmountTitle.innerText = `Songs (${amountOfSongs})`;
  playlist_container.appendChild(songsAmountTitle);
  songsList.items.forEach((item) => {
    const song = document.createElement('li');
    song.classList.add('song');
    song.innerText = item.track.name;
    playlist_container.appendChild(song);
  });

  document.getElementById('loading').style.transform = 'translateY(-100%)';
}
