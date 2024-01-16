import { getPlaylistTracks, search } from '../js/spotify-calls.js';
import { parseURLParams } from '../js/params-parser.js';

import { createAttr } from '../js/attribution';
import { createTermsPopup } from '../js/terms-popup';

createAttr(document.body);
createTermsPopup(document.body);

const { playlistId, userId, token } = parseURLParams(window.location.href);
getPlaylistTracks(playlistId, token);

