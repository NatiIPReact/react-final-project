import React, { createContext, useState, useContext } from 'react';

const LikedSongsStateContext = createContext();

export const LikedSongsGlobalStateProvider = ({ children }) => {
  const [likedSongs, setLikedSongs] = useState([]);

  return (
    <LikedSongsStateContext.Provider value={{ likedSongs, setLikedSongs }}>
      {children}
    </LikedSongsStateContext.Provider>
  );
};

export const useLikedSongsContext = () => {
  const context = useContext(LikedSongsStateContext);
  if (!context) {
    throw new Error("Liked Songs Context Error");
  }
  return context;
};