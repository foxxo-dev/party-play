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
getPlaylistTracks(playlistId, token);

const search_frm = document.getElementById('search');

// THIS IS ALL TEMPORARY CODE, WILL BE REMOVED LATER FOR IMPROVED FUNCTIONALITY

search_frm.addEventListener('change', async (e) => {
  const query = e.target.value;
  const result = await search(query, token);
  console.log(result);
  const track = result.tracks.items[0];

  addTracksToPlaylist(playlistId, token, [track.uri]);
  search_frm.value = '';
});
