import React from "react";
import PropTypes from "prop-types";

import { useConfirm } from "material-ui-confirm";

import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
  useGridApiContext,
} from "@mui/x-data-grid";

import { REMOVE_FILTERS } from "../../../../constants/messages";
import { useFilterData } from "../../../hooks/useFilterData";

export default function FilterDataGridToolbar({ title, createFilter }) {
  const apiRef = useGridApiContext();

  const confirm = useConfirm();

  const { filterKey, sendFilterMessage, exportFiltersToFile } = useFilterData();

  const deleteFilters = (filtersToDelete) => {
    console.log({ filtersToDelete });
    confirm({
      title: browser.i18n.getMessage("ConfirmMultipleFiltersDeleteTitle"),
      description: browser.i18n.getMessage(
        "ConfirmMultipleFiltersDeletePrompt",
        [
          filtersToDelete.length,
          browser.i18n.getMessage(`FilterTitle_${filterKey}_Singular`) ?? title,
        ],
      ),
      confirmationText: browser.i18n.getMessage(
        "ConfirmFilterDeleteButton_Accept",
      ),
      cancellationText: browser.i18n.getMessage(
        "ConfirmFilterDeleteButton_Decline",
      ),
    })
      .then(() => {
        return sendFilterMessage(REMOVE_FILTERS, filtersToDelete);
      })
      .catch(() => {});
  };

  return (
    <GridToolbarContainer sx={{ marginBottom: 2 }}>
      <Stack
        alignItems="center"
        direction="row"
        useFlexGap
        flexWrap="wrap"
        spacing={2}
        sx={{ marginRight: "auto" }}
      >
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
        <Divider orientation="vertical" flexItem />
        <Button
          color="error"
          variant="outlined"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={() => {
            const selectedRows = apiRef.current.getSelectedRows();
            deleteFilters(Array.from(selectedRows.values()));
          }}
          disabled={apiRef.current.getSelectedRows().size === 0}
        >
          {browser.i18n.getMessage("SelectedFilters_ButtonLabel_Delete")}
        </Button>
        <Button
          color="primary"
          variant="outlined"
          size="small"
          startIcon={<ArchiveIcon />}
          onClick={() => {
            const selectedRows = apiRef.current.getSelectedRows();
            exportFiltersToFile(Array.from(selectedRows.values()));
          }}
          disabled={apiRef.current.getSelectedRows().size === 0}
        >
          {browser.i18n.getMessage("SelectedFilters_ButtonLabel_Export")}
        </Button>
        {apiRef.current.getSelectedRows().size > 0 && (
          <>
            <Divider orientation="vertical" flexItem />
            <Button
              color="inherit"
              variant="outlined"
              size="small"
              startIcon={<ClearAllIcon />}
              onClick={() => {
                apiRef.current.setRowSelectionModel([]);
              }}
            >
              {browser.i18n.getMessage(
                "SelectedFilters_ButtonLabel_ClearSelection",
              )}
            </Button>
          </>
        )}
      </Stack>
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

FilterDataGridToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  createFilter: PropTypes.func.isRequired,
};
