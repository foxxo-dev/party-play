async function fetchWebApi(endpoint, token, method, body) {
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    method
  };

  // Include the request body if provided
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, options);

  if (res.status === 204) {
    return;
  }
  console.log(res);
  const data = await res.json();
  console.log(data);

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

export async function getTopTracks(token) {
  // Endpoint reference: https://developer.spotify.com/documentation/web-api/reference/get-recommendations
  const response = await fetchWebApi('me/top/tracks?limit=5', token, 'GET');
  return response.items;
}

async function getRecommendations(token, topTracksIds) {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-recommendations
  return (
    await fetchWebApi(
      `recommendations?limit=5&seed_tracks=${topTracksIds.join(',')}`,
      token,
      'GET'
    )
  ).tracks;
}

export async function addRecommendedTracks(token, playlistId) {
  const topTracks = await getTopTracks(token);
  const topTracksIds = topTracks.map((track) => track.id);
  const recommendations = await getRecommendations(token, topTracksIds);
  console.log(recommendations);
  const recommendationsUri = recommendations.map((track) => track.uri);
  await addTracksToPlaylist(playlistId, token, recommendationsUri);
}

export async function addTracksToPlaylist(playlistId, token, uris) {
  const response = await fetchWebApi(
    `playlists/${playlistId}/tracks`,
    token,
    'POST',
    {
      uris
    }
  );
  console.log(response);
  return response;
}
