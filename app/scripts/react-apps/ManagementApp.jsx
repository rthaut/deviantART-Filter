import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Switch as RouterSwitch,
  Route,
} from "react-router-dom";

import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from "notistack";

import { styled } from "@mui/material/styles";

import {
  AppBar as MuiAppBar,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  Drawer as MuiDrawer,
  Divider,
  Container,
  FormControlLabel,
  Switch,
  Box,
  Link,
  Button,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

import DashboardView from "./views/DashboardView";
import OptionsView from "./views/OptionsView";
import KeywordsFilterView from "./views/KeywordsFilterView";
import UsersFilterView from "./views/UsersFilterView";

import AppProviders from "./components/AppProviders";
import LogoIcon from "./components/LogoIcon";
import SidebarMenu from "./components/SidebarMenu";

import { useDarkMode } from "./hooks/useDarkMode";

const drawerWidth = 240;

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    overflowX: "hidden",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
    }),
  },
}));

const ManagementAppMain = () => {
  const [darkMode, setDarkMode] = useDarkMode();

  const [open, setOpen] = useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [info, setInfo] = useState({});

  useEffect(() => {
    browser.management.getSelf().then((_info) => setInfo(_info));
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" color="primary" open={open}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={toggleDrawer}
            size="large"
            sx={{
              marginRight: "36px",
            }}
          >
            {open ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
          <LogoIcon
            color="white"
            fontSize="large"
            sx={{
              marginRight: "12px",
            }}
          />
          <Typography component="h1" variant="h6">
            {browser.i18n.getMessage("ExtensionName")}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(event) => setDarkMode(event.target.checked)}
                color={darkMode ? "primary" : "secondary"}
                name="darkMode"
              />
            }
            label={browser.i18n.getMessage("DarkModeSwitchLabel")}
            sx={{
              marginLeft: "auto",
            }}
          />
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Offset />
        <SidebarMenu />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Offset />
        <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 4 }}>
          <RouterSwitch>
            <Route path="/users">
              <UsersFilterView />
            </Route>
            <Route path="/keywords">
              <KeywordsFilterView />
            </Route>
            <Route path="/options">
              <OptionsView />
            </Route>
            <Route path="/">
              <DashboardView />
            </Route>
          </RouterSwitch>
        </Container>
        {info && (
          <Box color="text.secondary">
            <Divider />
            <Container sx={{ paddingTop: 2 }}>
              <Typography paragraph variant="caption" align="right">
                <Link
                  href={info.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {info.name || info.shortName}{" "}
                  {info.versionName || info.version}
                </Link>
                {" " + browser.i18n.getMessage("Credits_CreatedBy") + " "}
                <Link
                  href="https://ryan.thaut.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ryan Thaut
                </Link>
                .
              </Typography>
            </Container>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const ManagementApp = () => {
  const notistackRef = React.createRef();
  const notistackDismiss = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <AppProviders>
      <SnackbarProvider
        ref={notistackRef}
        maxSnack={3}
        action={(key) => (
          <Button onClick={notistackDismiss(key)} color="inherit">
            {browser.i18n.getMessage("Snackbar_ButtonLabel_Dismiss")}
          </Button>
        )}
      >
        <ConfirmProvider
          defaultOptions={{
            buttonOrder: ["confirm", "cancel"],
            confirmationButtonProps: {
              color: "primary",
              variant: "outlined",
            },
            cancellationButtonProps: {
              autoFocus: true,
              color: "primary",
              variant: "contained",
            },
            cancellationText: browser.i18n.getMessage(
              "ConfirmDialog_DefaultButtonLabel_Cancel",
            ),
            confirmationText: browser.i18n.getMessage(
              "ConfirmDialog_DefaultButtonLabel_Confirm",
            ),
          }}
        >
          <Router>
            <CssBaseline />
            <ManagementAppMain />
          </Router>
        </ConfirmProvider>
      </SnackbarProvider>
    </AppProviders>
  );
};

export default ManagementApp;
