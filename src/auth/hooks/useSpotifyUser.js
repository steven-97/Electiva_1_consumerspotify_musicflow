import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export const getSpotifyUserProfile = async (accessToken) => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    return response.json();
  } catch (error) {
    toast.error("Error al obtener el perfil del usuario de Spotify:", error);

    throw error;
  }
};

export const getSpotifyUserTracks = async (accessToken) => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/tracks", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    return response.json();
  } catch (error) {
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
    throw error;
  }
};

export const getSpotifyTrackById = async (accessToken, id) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    return response.json();
  } catch (error) {
    throw error;
  }
};

export const saveSpotifyData = async (userId, token) => {
  const profile = await getSpotifyUserProfile(token);
  const playlists = await getSpotifyCurrentUserPlaylist(token);

  const userRef = doc(db, "users", userId);
  await setDoc(
    userRef,
    {
      spotify: {
        token,
        profile,
        playlists,
        lastUpdated: new Date(),
      },
    },
    { merge: true }
  );
};

export const saveUserPlaylists = async (userId, playlists) => {
  try {
    const playlistsRef = collection(db, "users", userId, "spotify_playlists");

    const snapshot = await getDocs(playlistsRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    const newBatch = writeBatch(db);
    playlists.forEach((playlist) => {
      const playlistRef = doc(playlistsRef, playlist.id);
      newBatch.set(playlistRef, {
        id: playlist.id,
        name: playlist.name,
        owner: playlist.owner.display_name,
        image: playlist.images?.[0]?.url,
        url: playlist.external_urls?.spotify,
        tracks: playlist.tracks?.total || 0,
        lastUpdated: new Date(),
      });
    });
    await newBatch.commit();
  } catch (error) {
    throw error;
  }
};

export const getUserPlaylistsFromDB = async (userId) => {
  try {
    const playlistsRef = collection(db, "users", userId, "spotify_playlists");
    const snapshot = await getDocs(playlistsRef);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    throw error;
  }
};

export const getOtherUsersPlaylists = async (currentUserId) => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(
      query(usersRef, where("spotify", "!=", null))
    );

    const allPlaylists = [];

    for (const doc of querySnapshot.docs) {
      const user = doc.data();
      if (user.uid === currentUserId) continue;

      const userPlaylists = await getUserPlaylistsFromDB(user.uid);
      allPlaylists.push(
        ...userPlaylists.map((p) => ({
          ...p,
          userId: user.uid,
          userDisplayName: user.owner || user.email.split("@")[0],
          userPhoto: user.photoURL,
        }))
      );
    }

    return allPlaylists;
  } catch (error) {
    throw error;
  }
};
