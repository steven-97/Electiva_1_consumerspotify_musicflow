export const getSpotifyUserProfile = async (accessToken) => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    console.log("response", response);
    return response.json();
  } catch (error) {
    console.error("Error al obtener el perfil del usuario de Spotify:", error);
    throw error;
  }
};

export const getSpotifyUserTracks = async (accessToken) => {
  console.log("accessToken", accessToken);

  try {
    const response = await fetch("https://api.spotify.com/v1/me/tracks", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    console.log("responsetracks", response);
    return response.json();
  } catch (error) {
    console.error("Error al obtener el perfil del usuario de Spotify:", error);
    throw error;
  }
};

export const getSpotifyCurrentUserPlaylist = async (accessToken) => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    return response.json();
  } catch (error) {
    console.error("Error al obtener el perfil del usuario de Spotify:", error);
    throw error;
  }
};

export const getSpotifyPlaylistById = async (accessToken, playlistId) => {
  try {

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );

    return response.json();
  } catch (error) {
    console.error("Error al obtener el perfil del usuario de Spotify:", error);
    throw error;
  }
};


export const getSpotifyTrackById  = async (accessToken, id) => {
  try {

    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${id}`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );

    return response.json();
  } catch (error) {
    console.error("Error al obtener el perfil del usuario de Spotify:", error);
    throw error;
  }
};
