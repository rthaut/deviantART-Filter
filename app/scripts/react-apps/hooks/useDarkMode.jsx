import React, { createContext, useContext, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import { useLocalStorage } from "react-use";

import useMediaQuery from "@mui/material/useMediaQuery";

export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useLocalStorage("dark-mode", prefersDarkMode);

  useEffect(() => {
    setDarkMode((value) => value || prefersDarkMode);
  }, [prefersDarkMode]);

  const value = useMemo(() => [darkMode, setDarkMode], [darkMode]);

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};

DarkModeProvider.propTypes = {
  children: PropTypes.element,
};

export const useDarkMode = () => {
  return useContext(DarkModeContext);
};
