import { useEffect } from "react";

import { useLocalStorage } from "react-use";

import useMediaQuery from "@mui/material/useMediaQuery";

export const useDarkMode = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useLocalStorage("dark-mode", prefersDarkMode);

  useEffect(() => {
    setDarkMode(value => value || prefersDarkMode);
  }, [prefersDarkMode]);

  return [darkMode, setDarkMode];
};

export default useDarkMode;