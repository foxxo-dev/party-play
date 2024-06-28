import {
  getPlaylistTracks,
  search,
  addTracksToPlaylist,
  addScan
} from '../js/spotify-calls.js';
import { parseURLParams } from '../js/params-parser.js';

import { createAttr } from '../js/attribution';
import { createTermsPopup } from '../js/terms-popup';
import { refreshToken } from '../js/spotify-calls.js';

createAttr(document.body);
createTermsPopup(document.body);

var { playlistId, token } = parseURLParams(window.location.href);

const search_frm = document.getElementById('search');

// console.log('--------------------------------------');
// console.log('REFRESH TOKEN HOST: ', token);
var token_temp = await refreshToken(token);
console.log('Temp Token OBJ', token_temp);

token = token_temp.access_token;

addScan(token, playlistId);

console.log(token);

async function createPlaylist() {
  const playlist = document.getElementById('playlist');

  let tracks = await getPlaylistTracks(playlistId, token);

  playlist.innerHTML = '<span class="play-title>Next Song: </span>';
  tracks.forEach((trackObj) => {
    const track = trackObj.track;

    const name = track.name;
    const authors = track.artists.map((artist) => artist.name).join(', ');
    const spotifyUrl = track.external_urls.spotify;
    const image = track.album.images[0].url;

    // Create card div
    const card = document.createElement('div');
    card.className = 'card';

    // Create cover image
    const coverImage = document.createElement('img');
    coverImage.src = image;
    coverImage.alt = 'Cover';

    // Create Spotify icon image
    const spotifyIcon = document.createElement('img');
    spotifyIcon.src = '../assets/Spotify_Icon_RGB_White.png';
    spotifyIcon.alt = 'Spotify Icon';
    spotifyIcon.className = 'spotify-icon-card';

    // Create div for text content
    const textContent = document.createElement('div');

    // Create title span
    const titleSpan = document.createElement('span');
    titleSpan.className = 'title';
    titleSpan.textContent = name;

    // Create artist span
    const artistSpan = document.createElement('span');
    artistSpan.className = 'artist';
    artistSpan.textContent = authors;

    // Create Spotify link
    const spotifyLink = document.createElement('a');
    spotifyLink.className = 'spotify-attribution';
    spotifyLink.href = spotifyUrl;
    spotifyLink.textContent = 'Play on Spotify';

    // Append elements to text content div
    textContent.appendChild(titleSpan);
    textContent.appendChild(artistSpan);
    textContent.appendChild(spotifyLink);

    // Append elements to card div
    card.appendChild(coverImage);
    card.appendChild(spotifyIcon);
    card.appendChild(textContent);

    // Append card to playlist
    playlist.appendChild(card);
  });

}

createPlaylist();
setInterval(createPlaylist, 20000);

search_frm.addEventListener('click', async (e) => {
  document.getElementById('search-overlay').style.display = 'flex';
  document.getElementById('search').focus();
  document.getElementById('search').style.position = 'absolute';
  document.getElementById('search').style.top = '0.5rem';
  document.getElementById('search').style.left = '50%';
  document.getElementById('search').style.transform = 'translateX(-50%)';
  document.getElementById('search').style.zIndex = '110';
});

async function addTrackToPlaylistClick(uri) {
  await addTracksToPlaylist(playlistId, token, [uri]);
  document.getElementById('search-overlay').style.display = 'none';
  document.getElementById('search').value = '';
  document.getElementById('playlist').innerHTML = '';
  document.getElementById('search').style.transform = 'translateX(0%)';
  document.getElementById('search').style.position = 'initial';
}

search_frm.addEventListener('keydown', async (e) => {
  const query = search_frm.value;
  console.log(query);
  if (!query.trim()) return;
  const result = await search(query, token);
  console.log(result);
  let tracks = result.tracks.items;
  tracks = tracks.slice(0, 8);

  const results = document.getElementById('results');
  results.innerHTML = '';

  tracks.forEach((trackObj) => {
    const name = trackObj.name;
    const authors = trackObj.artists.map((artist) => artist.name).join(', ');
    const spotifyUrl = trackObj.external_urls.spotify;
    const image = trackObj.album.images[0].url;
    const uri = trackObj.uri;
    console.log(trackObj);

    const card = document.createElement('div');

    card.classList.add('result-card');
    card.addEventListener('click', async () => {
      await addTrackToPlaylistClick(uri);
      document.getElementById('playlist').innerHTML = 'Loading...';
      await createPlaylist();
    });

    const content = document.createElement('div');

    const img = document.createElement('img');
    img.src = image;
    img.alt = 'Cover';
    content.appendChild(img);

    const div = document.createElement('div');

    const title = document.createElement('span');
    title.classList.add('title');
    title.textContent = name;
    div.appendChild(title);

    const artist = document.createElement('span');
    artist.classList.add('artist');
    artist.textContent = authors;
    div.appendChild(artist);

    const spotifyLink = document.createElement('a');
    spotifyLink.classList.add('spotify-attribution');
    spotifyLink.href = spotifyUrl;
    spotifyLink.textContent = 'Play on Spotify';
    div.appendChild(spotifyLink);

    content.appendChild(div);
    content.className = 'result-card-content card';

    const bg = document.createElement('div');
    bg.style.backgroundImage = `url(${image})`;
    bg.className = 'card-bg'

    card.appendChild(bg);

    card.appendChild(content);
    card.innerHTML +=
      '<img src="../assets/Spotify_Icon_RGB_White.png" alt="Spotify Icon" class="spotify-icon-card" />';
    results.appendChild(card);
  });

  if (e.key === 'Enter') {
    addTracksToPlaylist(playlistId, token, [trackObj.uri]);
    search_frm.value = '';
    console.log('enter');
    document.getElementById('playlist').innerHTML = '';
    createPlaylist();
  }
});

/*
const query = e.target.value;
  const result = await search(query, token);
  console.log(result);
  const track = result.tracks.items[0];

  addTracksToPlaylist(playlistId, token, [track.uri]);
  search_frm.value = '';
  */
