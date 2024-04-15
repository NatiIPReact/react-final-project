import { createContext, useState } from "react";
const Sound = createContext();
const SoundContext = ({children}) => {
    const [currentSound, setCurrentSound] = useState(null);
    return (<Sound.Provider value={{currentSound, setCurrentSound}}>{children}</Sound.Provider>)
}
export {SoundContext,Sound}