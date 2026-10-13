import { useMemo } from "react";

import { useDarkMode } from "./useDarkMode";

import { createTheme } from "@mui/material/styles";
import { deepOrange, grey } from "@mui/material/colors";

export const useTheme = () => {
  const [darkMode] = useDarkMode();
  return useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: deepOrange,
          secondary: grey,
        },
        components: {
          // MUI 9 shrank the default to 36px; the sidebar and tag list are
          // laid out for the old width
          MuiListItemIcon: {
            styleOverrides: {
              root: { minWidth: 56 },
            },
          },
        },
      }),
    [darkMode],
  );
};

export default useTheme;
