async function fetchWebApi(endpoint, token, method, body) {
  const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    method,
    body: JSON.stringify(body)
  });

  if (res.status === 204) {
    return;
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
}

export async function getMe(token) {
  return await fetchWebApi('me', token, 'GET');
}

export async function createPublicPlaylist(accessToken) {
  const randId = Math.floor(Math.random() * 1000000000);
  const playlistName = `Party Play Playlist #${randId}`;
  const description =
    'This playlist was created by Party Play. Your unique code is: ' + randId;

  const playlist = await fetchWebApi('me/playlists', accessToken, 'POST', {
    name: playlistName,
    public: true,
    description
  });

  return playlist;
}

export async function search(query, token) {
  const response = await fetchWebApi(
    `search?q=${query}&type=track`,
    token,
    'GET'
  );
  console.log(response);
  return response;
}

export async function getPlaylistTracks(playlistId, token) {
  const response = await fetchWebApi(
    `playlists/${playlistId}/tracks`,
    token,
    'GET'
  );
  console.log(response);
  return response;
}
