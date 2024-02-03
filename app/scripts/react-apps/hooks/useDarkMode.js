import * as React from "react";
import PropTypes from "prop-types";

import { useLocalStorage } from "react-use";

import useMediaQuery from "@mui/material/useMediaQuery";

const LOCAL_STORAGE_KEY = "dark-mode";

export const DarkModeContext = React.createContext();

export const DarkModeProvider = ({ children }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [darkMode, setDarkMode] = useLocalStorage(
    LOCAL_STORAGE_KEY,
    prefersDarkMode,
  );

  React.useEffect(() => {
    setDarkMode((value) => value || prefersDarkMode);
  }, [prefersDarkMode]);

  React.useEffect(() => {
    window.addEventListener("storage", () => {
      const rawValue = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (rawValue !== null) {
        setDarkMode(JSON.parse(rawValue));
      }
    });
  }, []);

  const value = React.useMemo(() => [darkMode, setDarkMode], [darkMode]);

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};

DarkModeProvider.propTypes = {
  children: PropTypes.element,
};

export const useDarkMode = () => React.useContext(DarkModeContext);
