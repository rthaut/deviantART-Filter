import React from "react";
import PropTypes from "prop-types";

import { makeStyles } from "@mui/styles";

import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";

import { Clear as ClearIcon, Done as DoneIcon } from "@mui/icons-material";

const useStyles = makeStyles((theme) => ({
  avatarPrimary: {
    color: "#ffffff",
    backgroundColor: theme.palette.primary.main,
  },
}));

const MetadataFiltersResults = ({ results }) => {
  const classes = useStyles();

  return (
    <List dense disablePadding>
      {Object.keys(results).map((result, index) => (
        <ListItem key={index} dense disableGutters>
          <ListItemAvatar>
            <Avatar
              className={results[result].new > 0 ? classes.avatarPrimary : ""}
            >
              {results[result].new > 0 ? <DoneIcon /> : <ClearIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`${results[result].new} ${browser.i18n.getMessage(
              `FilterTitle_${result}`
            )}`}
            secondary={`${results[result].duplicate} ${browser.i18n.getMessage(
              "ImportResultsColumnHeader_DuplicateCount"
            )}`}
          />
        </ListItem>
      ))}
    </List>
  );
};

MetadataFiltersResults.propTypes = {
  results: PropTypes.object.isRequired,
};

export default MetadataFiltersResults;
