import React, { createContext, useState, useContext } from 'react';

const XPStateContext = createContext();

export const XPGlobalStateProvider = ({ children }) => {
  const [xp, setXP] = useState(0);

  return (
    <XPStateContext.Provider value={{ xp, setXP }}>
      {children}
    </XPStateContext.Provider>
  );
};

export const useXPContext = () => {
  const context = useContext(XPStateContext);
  if (!context) {
    throw new Error("XP Context Error");
  }
  return context;
};