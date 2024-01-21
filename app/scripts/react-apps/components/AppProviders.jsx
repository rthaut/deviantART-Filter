import React from "react";
import PropTypes from "prop-types";

import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";

import CssBaseline from "@mui/material/CssBaseline";

import { DarkModeProvider } from "../hooks/useDarkMode";
import useTheme from "../hooks/useTheme";

const MuiProviders = ({ children }) => {
  const theme = useTheme();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

MuiProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

const AppProviders = ({ children }) => {
  return (
    <DarkModeProvider>
      <MuiProviders>{children}</MuiProviders>
    </DarkModeProvider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
