import React from "react";
import PropTypes from "prop-types";

import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";
import DoneIcon from "@mui/icons-material/Done";

const MetadataFiltersResults = ({ results }) => {
  return (
    <List dense disablePadding>
      {Object.keys(results).map((result, index) => (
        <ListItem key={index} dense disableGutters>
          <ListItemAvatar>
            <Avatar
              sx={(theme) => ({
                bgcolor:
                  results[result].new > 0
                    ? theme.palette.primary.main
                    : undefined,
                color:
                  results[result].new > 0
                    ? theme.palette.primary.contrastText
                    : undefined,
              })}
            >
              {results[result].new > 0 ? <DoneIcon /> : <ClearIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`${results[result].new} ${browser.i18n.getMessage(
              `FilterTitle_${result}`,
            )}`}
            secondary={`${results[result].duplicate} ${browser.i18n.getMessage(
              "ImportResultsColumnHeader_DuplicateCount",
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
