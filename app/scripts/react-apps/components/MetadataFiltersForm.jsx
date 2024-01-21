import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import {
  Typography,
  Divider,
  FormControl,
  FormControlLabel,
  Switch,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
} from "@mui/material";

const MetadataFiltersForm = ({ metadata, setFilter }) => {
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
            {browser.i18n.getMessage("FilterTitle_User")}
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
          <Typography component="legend">
            {browser.i18n.getMessage("FilterTitle_Keywords")}
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
          <List dense disablePadding>
            {tags.map((tag, index) => (
              <ListItemButton
                key={index}
                disableRipple
                role={undefined}
                dense
                onClick={() => toggleTag(tag)}
              >
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
  metadata: PropTypes.object,
  setFilter: PropTypes.func.isRequired,
};

export default MetadataFiltersForm;
