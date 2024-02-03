import * as React from "react";

import { useDarkMode } from "./useDarkMode";

import { createTheme } from "@mui/material/styles";
import { deepOrange, grey } from "@mui/material/colors";

export const useTheme = () => {
  const [darkMode] = useDarkMode();
  return React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: deepOrange,
          secondary: grey,
        },
      }),
    [darkMode],
  );
};

export default useTheme;
