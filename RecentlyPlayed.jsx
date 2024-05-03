import React, { createContext, useState, useContext } from 'react';

const RecentlyPlayedStateContext = createContext();

export const RecentlyPlayedGlobalStateProvider = ({ children }) => {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  return (
    <RecentlyPlayedStateContext.Provider value={{ recentlyPlayed, setRecentlyPlayed }}>
      {children}
    </RecentlyPlayedStateContext.Provider>
  );
};

export const useRecentlyPlayedContext = () => {
  const context = useContext(RecentlyPlayedStateContext);
  if (!context) {
    throw new Error("Recently Played Context Error");
  }
  return context;
};