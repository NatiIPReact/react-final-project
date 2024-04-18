import React, { createContext, useState, useContext } from 'react';

const PlaylistsStateContext = createContext();

export const PlaylistsGlobalStateProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);

  return (
    <PlaylistsStateContext.Provider value={{ playlists, setPlaylists }}>
      {children}
    </PlaylistsStateContext.Provider>
  );
};

export const usePlaylistsContext = () => {
  const context = useContext(PlaylistsStateContext);
  if (!context) {
    throw new Error("Playlists Context Error");
  }
  return context;
};