import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { makeStyles } from "@material-ui/core/styles";

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
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  fieldset: {
    margin: theme.spacing(0, 0, 2),
    width: "100%",
  },
  legend: {
    padding: theme.spacing(0),
  },
  divider: {
    margin: theme.spacing(0, 0, 3),
  },
  checkboxList: {
    width: "100%",
  },
  checkboxListItem: {
    padding: theme.spacing(0),
  },
  checkboxListIcon: {
    minWidth: "auto !important",
  },
}));

const MetadataFiltersForm = ({ metadata, setFilter }) => {
  const classes = useStyles();

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
        }))
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
    <form noValidate>
      {username && (
        <FormControl component="fieldset" className={classes.fieldset}>
          <Typography component="legend" className={classes.legend}>
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
                "CreateFiltersFromDeviation_OptionalIndicator"
              )}
            </strong>{" "}
            {browser.i18n.getMessage(
              "CreateFiltersFromDeviation_Username_Help"
            )}
          </Typography>
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
        </FormControl>
      )}

      {username && tags && <Divider className={classes.divider} />}

      {tags && (
        <FormControl component="fieldset" className={classes.fieldset}>
          <Typography component="legend" className={classes.legend}>
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
                "CreateFiltersFromDeviation_OptionalIndicator"
              )}
            </strong>{" "}
            {browser.i18n.getMessage("CreateFiltersFromDeviation_Tags_Help")}
          </Typography>
          <List className={classes.checkboxList} dense disablePadding>
            {tags.map((tag, index) => (
              <ListItem
                key={index}
                button
                disableRipple
                role={undefined}
                dense
                disableGutters
                onClick={() => toggleTag(tag)}
                className={classes.checkboxListItem}
              >
                <ListItemIcon className={classes.checkboxListIcon}>
                  <Checkbox
                    disableRipple
                    edge="start"
                    color="primary"
                    checked={selectedTags.includes(tag)}
                    tabIndex={-1}
                  />
                </ListItemIcon>
                <ListItemText primary={tag} />
              </ListItem>
            ))}
          </List>
        </FormControl>
      )}
    </form>
  );
};

MetadataFiltersForm.propTypes = {
  metadata: PropTypes.object,
  setFilter: PropTypes.func.isRequired,
};

export default MetadataFiltersForm;
