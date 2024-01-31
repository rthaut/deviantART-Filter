import React from "react";
import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import AddIcon from "@mui/icons-material/Add";

import { GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";

export default function FilterDataGridToolbar({ title, createFilter }) {
  return (
    <GridToolbarContainer sx={{ marginBottom: 2 }}>
      <Box sx={{ marginRight: "auto" }}>
        <Button
          color="primary"
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => createFilter()}
        >
          {browser.i18n.getMessage("FilterDataGrid_ButtonLabel_CreateNew", [
            title.toLowerCase(),
          ])}
        </Button>
      </Box>
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

FilterDataGridToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  createFilter: PropTypes.func.isRequired,
};
