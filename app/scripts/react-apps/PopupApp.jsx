import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListSubheader from "@mui/material/ListSubheader";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import LabelIcon from "@mui/icons-material/Label";
import PeopleIcon from "@mui/icons-material/People";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import AppProviders from "./components/AppProviders";
import LogoIcon from "./components/LogoIcon";

import useExtensionStorage from "./hooks/useExtensionStorage";

import { SHOW_MANAGEMENT_PAGE } from "../constants/messages";
import { ENABLED_FILTERS_STORAGE_KEY, SUPPORTED_FILTERS } from "../filters";

const PopupApp = () => {
  const [enabledFilterTypes, setEnabledFilterTypes] = useExtensionStorage({
    type: "local",
    key: ENABLED_FILTERS_STORAGE_KEY,
    initialValue: SUPPORTED_FILTERS,
  });

  const handleToggleFilterType = (value, enabled) =>
    setEnabledFilterTypes((enabledFilterTypes) => {
      const enabledFilterTypesSet = new Set([...enabledFilterTypes]);

      if (enabled) {
        enabledFilterTypesSet.add(value);
      } else {
        enabledFilterTypesSet.delete(value);
      }

      return Array.from(enabledFilterTypesSet);
    });

  const openManagementScreen = (_event) =>
    browser.runtime.sendMessage({
      action: SHOW_MANAGEMENT_PAGE,
    });

  return (
    <AppProviders>
      <Box
        component="main"
        sx={{
          maxWidth: "320px",
          width: "100%",
        }}
      >
        <Toolbar sx={{ display: "flex" }}>
          <LogoIcon
            color="primary"
            fontSize="large"
            sx={{ marginRight: "12px" }}
          />
          <Typography variant="h6" align="left">
            {browser.i18n.getMessage("ExtensionName")}
          </Typography>
        </Toolbar>
        <Divider />
        <Stack direction="column">
          <List
            dense
            sx={{ width: "100%" }}
            subheader={
              <ListSubheader>
                {browser.i18n.getMessage("Options_EnabledFilterTypes_Header")}
              </ListSubheader>
            }
          >
            <ListItem>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <FormControlLabel
                label={browser.i18n.getMessage("FilterTitle_Users")}
                labelPlacement="start"
                control={
                  <Switch
                    edge="end"
                    checked={enabledFilterTypes.includes("users")}
                    onChange={(event, checked) =>
                      handleToggleFilterType("users", checked)
                    }
                  />
                }
                sx={{
                  justifyContent: "space-between",
                  marginInline: 0,
                  width: "100%",
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LabelIcon />
              </ListItemIcon>
              <FormControlLabel
                label={browser.i18n.getMessage("FilterTitle_Keywords")}
                labelPlacement="start"
                control={
                  <Switch
                    edge="end"
                    checked={enabledFilterTypes.includes("keywords")}
                    onChange={(event, checked) =>
                      handleToggleFilterType("keywords", checked)
                    }
                  />
                }
                sx={{
                  justifyContent: "space-between",
                  marginInline: 0,
                  width: "100%",
                }}
              />
            </ListItem>
          </List>
          <Box sx={{ padding: 1, width: "100%" }}>
            <Button
              fullWidth
              variant="contained"
              onClick={openManagementScreen}
              endIcon={<OpenInNewIcon />}
            >
              {browser.i18n.getMessage(
                "BrowserAction_Popup_ButtonLabel_OpenManagementWindow",
              )}
            </Button>
          </Box>
        </Stack>
      </Box>
    </AppProviders>
  );
};

export default PopupApp;
