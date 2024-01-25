import {
  getPlaylistTracks,
  search,
  addTracksToPlaylist
} from '../js/spotify-calls.js';
import { parseURLParams } from '../js/params-parser.js';

import { createAttr } from '../js/attribution';
import { createTermsPopup } from '../js/terms-popup';

createAttr(document.body);
createTermsPopup(document.body);

const { playlistId, userId, token } = parseURLParams(window.location.href);

const search_frm = document.getElementById('search');

async function createPlaylist() {
  const playlist = document.getElementById('playlist');
  playlist.innerHTML = '';

  let tracks = await getPlaylistTracks(playlistId, token);
  tracks = tracks.items;

  tracks.forEach((trackObj) => {
    const track = trackObj.track;

    const name = track.name;
    const authors = track.artists.map((artist) => artist.name).join(', ');
    const spotifyUrl = track.external_urls.spotify;
    const image = track.album.images[0].url;
    console.log(track);
    playlist.innerHTML += ` <div class="card">
        <img src="${image}" alt="Cover" />
        <div>
          <span class="title">${name}</span>
          <span class="artist">${authors}</span>
          <a class="spotify-attribution" href="${spotifyUrl}">Play on Spotify</a>
        </div>
      </div>`;
  });
}

createPlaylist();

search_frm.addEventListener('click', async (e) => {
  document.getElementById('search-overlay').style.display = 'flex';
  document.getElementById('search').focus();
  document.getElementById('search').style.position = 'absolute';
  document.getElementById('search').style.top = '0.5rem';
  document.getElementById('search').style.left = '50%';
  document.getElementById('search').style.transform = 'translateX(-50%)';
  document.getElementById('search').style.zIndex = '110';
});

function addTrackToPlaylistClick(uri) {
  addTracksToPlaylist(playlistId, token, [uri]);
  document.getElementById('search-overlay').style.display = 'none';
  document.getElementById('search').value = '';
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
    card.classList.add('card', 'result-card');
    card.addEventListener('click', () => {
      addTrackToPlaylistClick(uri);
      document.getElementById('playlist').innerHTML = '';
      createPlaylist();
    });

    const img = document.createElement('img');
    img.src = image;
    img.alt = 'Cover';
    card.appendChild(img);

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

    card.appendChild(div);
    results.appendChild(card);
  });

  if (e.key === 'Enter') {
    addTracksToPlaylist(playlistId, token, [track.uri]);
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
