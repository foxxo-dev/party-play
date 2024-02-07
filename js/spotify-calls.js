var scans = 0;

export async function fetchWebApi(endpoint, token, method, body) {
  console.log(
    'Requesting:',
    endpoint,
    'with method:',
    method,
    ' and body: ',
    body
  );
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
    console.log('BODY: ', options.body);
  }

  try {
    const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, options);
    // const responseText = await res.text(); // Log the raw response text
    // console.log('Raw response:', responseText);
    // if (!responseText) {
    //   console.error('Empty response from the API');
    //   return; // Or handle accordingly
    // }

    if (!res.ok) {
      console.error('Error in fetchWebApi. HTTP status:', res.status);
      if (res.status === 401) {
        console.log('401');
        // window.location.href = '/auth/error.html?error=token-expired&state=401';
        return;
      }
    }

    if (res.status === 401) {
      window.location.href = '/auth/error.html?';
      return;
    }

    if (res.status === 204) {
      return;
    }

    console.log(res);

    const data = await res.json();
    console.log('Response data:', data);

    if (data.error) {
      console.error('DATA ERROR');
      throw new Error(data.error.message);
    }

    console.log('RETURNING DATA: ', data);

    return data;
  } catch (error) {
    console.error('Error in fetchWebApi:', error);
    throw error;
  }
}

export async function getMe(token) {
  return await fetchWebApi('me', token, 'GET');
}

async function getPlaylist(token, playlistId) {
  return await fetchWebApi(`playlists/${playlistId}`, token, 'GET');
}
async function getScanCount(token, playlistId) {
  const playlist = await getPlaylist(token, playlistId);
  console.log(playlist);
  const description = playlist.description;
  console.log('Original Scans: ', description.substring(0, 3));
  const scanCount = parseInt(description.substring(0, 3));
  return scanCount;
}

export async function changeDescription(token, playlistId, _description) {
  const _scans = await getScanCount(token, playlistId);
  _description = `${_scans}  ${_description}`;
  console.log(_description);

  const res = await fetchWebApi(`playlists/${playlistId}`, token, 'PUT', {
    description: _description,
    public: true
  });

  return res;
}

export async function changeName(token, playlistId, _name) {
  const res = await fetchWebApi(`playlists/${playlistId}`, token, 'PUT', {
    name: _name,
    public: true
  });

  return res;
}

export async function addScan(token, playlistId) {
  try {
    const playlist = await fetchWebApi(`playlists/${playlistId}`, token, 'GET');
    const randId = Math.floor(Math.random() * 1000000000);
    scans = await getScanCount(token, playlistId);
    console.log('Scans: ', scans);
    scans++;
    const description = `${scans}  scans. This playlist was created by Party Play, with the code ${randId}.`;

    playlist.description = description;

    const updatedPlaylist = await fetchWebApi(
      `playlists/${playlistId}`,
      token,
      'PUT',
      {
        description: description,
        public: true
      }
    );
    console.log('updatePlaylistDescription response:', updatedPlaylist);
    return updatedPlaylist;
  } catch (error) {
    console.error('updatePlaylistDescription error:', error);
    throw error; // Propagate the error
  }
}

export async function getScans(token, playlistId) {
  const playlist = await getPlaylist(token, playlistId);
  const description = playlist.description;
  console.log('Original Scans: ', description.substring(0, 3));
  const scanCount = parseInt(description.substring(0, 3));
  if (isNaN(scanCount)) {
    return 0;
  }
  return scanCount;
}

export async function createPublicPlaylist(accessToken) {
  try {
    const randId = Math.floor(Math.random() * 1000000000);
    const playlistName = `Party Play Playlist #${randId}`;
    const description = `0  This playlist was created by Party Play, with the code ${randId}. Note: scans are still in development.`;

    const playlist = await fetchWebApi('me/playlists', accessToken, 'POST', {
      name: playlistName,
      description,
      public: true
    });

    console.log('createPublicPlaylist response:', playlist);
    return playlist;
  } catch (error) {
    console.error('createPublicPlaylist error:', error);
    throw error; // Propagate the error
  }
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
  console.log('DATA: ', response.data);
  return response;
}

export async function getTopTracks(token) {
  // Endpoint reference: https://developer.spotify.com/documentation/web-api/reference/get-recommendations
  const response = await fetchWebApi('me/top/tracks?limit=5', token, 'GET');
  return response.items;
}

async function getRecommendations(token, topTracksIds) {
  const trackSeeds = topTracksIds.join(',');
  console.log(trackSeeds);
  const response = await fetchWebApi(
    `recommendations?limit=10&seed_tracks=${trackSeeds}`,
    token,
    'GET'
  );

  console.log(response);

  const data = await response;
  return data.tracks || [];
}

export async function addRecommendedTracks(token, playlistId) {
  const topTracks = await getTopTracks(token);
  const topTracksIds = topTracks.map((track) => track.id);
  console.log(topTracksIds);
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

export async function refreshToken(refreshToken) {
  console.log('REFRESH TOKEN: ', refreshToken);

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const clientId = '45b1711a56714857811215f27b15ffc7';
  const clientSecret = 'd009262d84014f33a5fe5dddf731248f';

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`)
    },
    body: body
  };

  try {
    const response = await fetch(
      'https://accounts.spotify.com/api/token',
      options
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}
