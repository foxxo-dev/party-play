import {
  createPublicPlaylist,
  addRecommendedTracks,
  fetchWebApi
} from '../js/spotify-calls.js';
import { parseURLParams } from '../js/params-parser.js';
import QRCode from 'qrcode';

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
async function main() {
  const response = parseURLParams(window.location.href);
  var token = '';
  var refresh_token = '';

  if (response || response == []) {
    console.log(response);
    token = response.token[0];
    refresh_token = response.refresh_token[0];
    console.log('REFRESH TOKEN HOST: ', refresh_token);
    const playlist = await createPublicPlaylist(token);
    addRecommendedTracks(token, playlist.id);

    // Start checking the currently playing track periodically
    checkCurrentlyPlaying(playlist.id, token, refresh_token);

    document.body.innerHTML = `<h1>Playlist Created!</h1>
    <h1>Keep this window open to keep the playlist going!</h1>
        <h2>Share this URL with anyone to add songs to the playlist!</h2>
        <div class="main">
          <div class='url-container'>
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" hi-documents">
                <path xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round" stroke-width="2"
                  d="M13 3v7h7M6 7H5a1 1 0 00-1 1v12a1 1 0 001 1h9a1 1 0 001-1v-1M8 4v12a1 1 0 001 1h10a1 1 0 001-1V9.389a1 1 0 00-.263-.676l-4.94-5.389A1 1 0 0014.06 3H9a1 1 0 00-1 1z"/>
              </svg>
              <div class='tooltip'>
                <span>Copy URL</span>
              </div>
            </button>
            <a href="/addSong/index.html?playlistId=${playlist.id}&token=${refresh_token}">
              https://party-play.foxxo.studio/addSong/index.html?playlistId=SECRET&token=SECRET
            </a>
          </div>
          <canvas id="qrcode"></canvas>
        </div>
        <button onclick="window.open(
          '/qrcode-template/index.html?code=' +
          btoa(
            \`https://party-play.foxxo.studio/addSong/index.html?playlistId=${playlist.id}&token=${refresh_token}\`
          ), '_blank');"> Print QR Code </button>
        <div id="printMenu">
          <span>Scan QR Code to Play Your Song!</span>
        </div>
        
        <hr style="width: 75%; border: 2px solid white; opacity: 0.5 margin-inline: auto"  />
        <h3>Preview of Playlist</h3>
        <iframe src="https://party-play.foxxo.studio/addSong/index.html?playlistId=${playlist.id}&token=${refresh_token}" width="75%" height="480" style="border: 2px solid white; border-radius: 0.5rem; margin-inline: auto; "></iframe>
        `;

    // Generate QR code after playlist is created and tracks are added
    QRCode.toCanvas(
      document.getElementById('qrcode'),
      `https://party-play.foxxo.studio/addSong/index.html?playlistId=${playlist.id}&token=${refresh_token}`,
      function (error) {
        if (error) console.error(error);
        console.log('success!');
        // Make the QR code work
        document
          .querySelector('.url-container button')
          .addEventListener('click', () => {
            navigator.clipboard.writeText(
              `https://party-play.foxxo.studio/addSong/index.html?playlistId=${playlist.id}&token=${refresh_token}`
            );
          });
        const qr = document.createElement('img');
        qr.src = document.getElementById('qrcode').toDataURL();
        document.getElementById('qrcode').replaceWith(qr);
        qr.id = 'qrcode';
      }
    );
  } else {
    const scopes = [
      'playlist-modify-public',
      'user-top-read',
      'user-read-playback-state'
    ];
    window.location.href = `https://accounts.spotify.com/authorize?client_id=45b1711a56714857811215f27b15ffc7&response_type=code&redirect_uri=https://party-play.foxxo.studio/auth/process.html&scope=${scopes.join(
      '%20'
    )}&state=123`;
  }
}

// Call the main function
main();
