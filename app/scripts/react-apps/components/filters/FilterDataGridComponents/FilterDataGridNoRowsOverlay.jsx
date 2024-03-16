import React from "react";
import PropTypes from "prop-types";

import { alpha } from "@mui/material/styles";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";

export const OVERLAY_HEIGHT = "208px";

export default function FilterDataGridNoRowsOverlay({
  buttonTitle,
  helpTextTitle,
  createFilter,
}) {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={4}
      sx={{ height: "100%" }}
    >
      <Typography
        dangerouslySetInnerHTML={{
          __html: browser.i18n.getMessage("FilterDataGrid_EmptyStateHTML", [
            helpTextTitle.toLocaleLowerCase(),
          ]),
        }}
        sx={(theme) => ({
          // manually matching the MuiLink component's style for <a> tags in the HTML of the localized message
          "& a": {
            color: theme.palette.primary.main,
            textDecoration: "underline",
            textDecorationColor: alpha(theme.palette.primary.main, 0.4),
            "&:hover": {
              textDecorationColor: "inherit",
            },
          },
        })}
      />
      <Button
        color="primary"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => createFilter()}
      >
        {browser.i18n.getMessage("FilterDataGrid_ButtonLabel_CreateNew", [
          buttonTitle.toLowerCase(),
        ])}
      </Button>
    </Stack>
  );
}

FilterDataGridNoRowsOverlay.propTypes = {
  buttonTitle: PropTypes.string.isRequired,
  helpTextTitle: PropTypes.string.isRequired,
  createFilter: PropTypes.func.isRequired,
};
