import React, { createContext, useState, useContext } from 'react';

const RecommendedStateContext = createContext();

export const RecommendedGlobalStateProvider = ({ children }) => {
  const [recommended, setRecommended] = useState([]);

  return (
    <RecommendedStateContext.Provider value={{ recommended, setRecommended }}>
      {children}
    </RecommendedStateContext.Provider>
  );
};

export const useRecommendedContext = () => {
  const context = useContext(RecommendedStateContext);
  if (!context) {
    throw new Error("Recommended Context Error");
  }
  return context;
};