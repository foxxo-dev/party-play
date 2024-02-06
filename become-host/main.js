import {
  createPublicPlaylist,
  addRecommendedTracks,
  fetchWebApi
} from '../js/spotify-calls.js';
import { parseURLParams } from '../js/params-parser.js';
import QRCode from 'qrcode';

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('../js/service-worker.js');
      console.log('Service worker registered successfully.');
    } catch (error) {
      console.error('Error registering service worker:', error);
    }
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
    await addRecommendedTracks(token, playlist.id);

    document.body.innerHTML = `<div id="loading">
      <loader><div class="loader10"></div><p>Authentication Successful. Redirecting to Dashboard...</p></loader>
    </div>
        `;
    document.querySelector('title').innerText =
      'Creating Playlist... | Become Host | Party Play';

    setTimeout(() => {
      // redirect to dashboard
      window.location.href =
        '/dashboard/index.html?playlistId=' +
        playlist.id +
        '&token=' +
        refresh_token;
    }, 3000);
  } else {
    const scopes = [
      'playlist-modify-private',
      'user-top-read',
      'user-read-playback-state',
      'playlist-modify-public'
    ];
    window.location.href = `https://accounts.spotify.com/authorize?client_id=45b1711a56714857811215f27b15ffc7&response_type=code&redirect_uri=https://party-play.foxxo.studio/auth/process.html&scope=${scopes.join(
      '%20'
    )}&state=123`;
  }
}

// Call the main function
main();
