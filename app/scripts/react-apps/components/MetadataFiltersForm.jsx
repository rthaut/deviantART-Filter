import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

const MetadataFiltersForm = ({ enabledFilters, metadata, setFilter }) => {
  const [selectedUsername, setSelectedUsername] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    setSelectedUsername("");
    setSelectedTags([]);
  }, [metadata]);

  useEffect(() => {
    if (selectedUsername.length) {
      setFilter("users", [
        {
          username: selectedUsername,
        },
      ]);
    } else {
      setFilter("users", []);
    }
  }, [selectedUsername]);

  useEffect(() => {
    if (selectedTags.length) {
      setFilter(
        "keywords",
        selectedTags.map((tag) => ({
          keyword: tag,
          wildcard: false,
        })),
      );
    } else {
      setFilter("keywords", []);
    }
  }, [selectedTags]);

  const username = metadata?.author_name?.trim();
  const tags = metadata?.tags?.split(",").map((tag) => tag.trim());

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags.filter((t) => t !== tag)]);
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  if (!metadata) {
    return null;
  }

  return (
    <Box
      as="form"
      noValidate
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      {username && (
        <FormControl component="fieldset">
          <Typography component="legend" sx={{ padding: 0 }}>
            {browser.i18n.getMessage("FilterTitle_Users_Singular")}
          </Typography>
          <Typography
            component="p"
            variant="body2"
            color="textSecondary"
            gutterBottom
          >
            <strong>
              {browser.i18n.getMessage(
                "CreateFiltersFromDeviation_OptionalIndicator",
              )}
            </strong>{" "}
            {browser.i18n.getMessage(
              "CreateFiltersFromDeviation_Username_Help",
            )}
          </Typography>
          {!enabledFilters.includes("users") && (
            <Alert
              severity="warning"
              variant="standard"
              sx={{
                marginBlock: 1,
              }}
            >
              {browser.i18n.getMessage("Warning_FilterName_Disabled", [
                browser.i18n.getMessage("FilterTitle_Users_Singular"),
              ])}
            </Alert>
          )}
          <List dense disablePadding>
            <ListItem dense>
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={selectedUsername === username}
                    onChange={(e) =>
                      setSelectedUsername(e.target.checked ? username : "")
                    }
                  />
                }
                label={username}
              />
            </ListItem>
          </List>
        </FormControl>
      )}

      {username && tags && <Divider />}

      {tags && (
        <FormControl component="fieldset">
          <Typography component="legend" sx={{ padding: 0 }}>
            {browser.i18n.getMessage("FilterTitle_Keywords_Plural")}
          </Typography>
          <Typography
            component="p"
            variant="body2"
            color="textSecondary"
            gutterBottom
          >
            <strong>
              {browser.i18n.getMessage(
                "CreateFiltersFromDeviation_OptionalIndicator",
              )}
            </strong>{" "}
            {browser.i18n.getMessage("CreateFiltersFromDeviation_Tags_Help")}
          </Typography>
          {!enabledFilters.includes("keywords") && (
            <Alert
              severity="warning"
              variant="standard"
              sx={{
                marginBlock: 1,
              }}
            >
              {browser.i18n.getMessage("Warning_FilterName_Disabled", [
                browser.i18n.getMessage("FilterTitle_Keywords_Singular"),
              ])}
            </Alert>
          )}
          <List dense disablePadding>
            {tags.map((tag, index) => (
              <ListItemButton key={index} onClick={() => toggleTag(tag)}>
                <ListItemIcon>
                  <Checkbox
                    disableRipple
                    edge="start"
                    color="primary"
                    checked={selectedTags.includes(tag)}
                    tabIndex={-1}
                  />
                </ListItemIcon>
                <ListItemText primary={tag} />
              </ListItemButton>
            ))}
          </List>
        </FormControl>
      )}
    </Box>
  );
};

MetadataFiltersForm.propTypes = {
  enabledFilters: PropTypes.arrayOf(PropTypes.string).isRequired,
  metadata: PropTypes.object,
  setFilter: PropTypes.func.isRequired,
};

export default MetadataFiltersForm;
