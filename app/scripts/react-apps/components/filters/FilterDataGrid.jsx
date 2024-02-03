import React, { useState } from "react";
import PropTypes from "prop-types";

import { useConfirm } from "material-ui-confirm";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Tooltip from "@mui/material/Tooltip";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { DataGrid, GridActionsCellItem, gridClasses } from "@mui/x-data-grid";

import FilterUpsertDialog from "./FilterUpsertDialog";

import FilterDataGridMainMenu from "./FilterDataGridComponents/FilterDataGridMainMenu";
import FilterDataGridToolbar from "./FilterDataGridComponents/FilterDataGridToolbar";
import FilterDataGridColumnMenu from "./FilterDataGridComponents/FilterDataGridColumnMenu";
import FilterDataGridNoRowsOverlay, {
  OVERLAY_HEIGHT,
} from "./FilterDataGridComponents/FilterDataGridNoRowsOverlay";

import InvalidFilterDataWarning from "./InvalidFilterDataWarning";

import { useFilterData } from "../../hooks/useFilterData";

import { REMOVE_FILTER, SAVE_FILTER } from "../../../constants/messages";

const DISABLE_FOCUS_STYLES = {
  [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
    outline: "none",
  },
  [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
    {
      outline: "none",
    },
};

export default function FilterDataGrid({
  title,
  columns,
  filterDialogFormFields,
}) {
  const confirm = useConfirm();

  const [showFilterUpsertDialog, setShowFilterUpsertDialog] = useState(false);
  const [filterToEdit, setFilterToEdit] = useState(null);

  const {
    filterKey,
    idPropName: rowIdPropName,
    enabled,
    setEnabled,
    loading,
    validFilters: rows,
    invalidFilters: invalidRows,
    purgeInvalidFilters,
  } = useFilterData();

  const sendFilterMessage = async (action, value) => {
    const response = await browser.runtime.sendMessage({
      action,
      data: {
        key: filterKey,
        value,
      },
    });
    return response;
  };

  const onExportClick = () => {
    const dataObj = new Blob([JSON.stringify({ [filterKey]: rows })], {
      type: "application/json",
    });
    const dataObjURL = URL.createObjectURL(dataObj);

    const date = new Date();
    const filename =
      browser.i18n.getMessage("ExtensionName").replace(" ", "_") + "_" + title;

    const link = document.createElement("a");
    link.href = dataObjURL;
    link.download = `${filename}-${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}.json`;
    link.dispatchEvent(new MouseEvent("click"));
  };

  const onResetClick = () => {
    confirm({
      title: browser.i18n.getMessage("ConfirmAllFiltersDeleteTitle"),
      description: browser.i18n.getMessage("ConfirmAllFiltersDeletePrompt", [
        rows.length,
        title.toLowerCase(),
      ]),
      confirmationText: browser.i18n.getMessage(
        "ConfirmAllFiltersDeleteButton_Accept",
      ),
      cancellationText: browser.i18n.getMessage(
        "ConfirmAllFiltersDeleteButton_Decline",
      ),
    })
      .then(() => sendFilterMessage(SAVE_FILTER, []))
      .catch(() => {});
  };

  const createFilter = () => {
    setFilterToEdit(null);
    setShowFilterUpsertDialog(true);
  };

  const editFilter = (filter) => {
    setFilterToEdit(filter);
    setShowFilterUpsertDialog(true);
  };

  const deleteFilter = (filter) => {
    confirm({
      title: browser.i18n.getMessage("ConfirmFilterDeleteTitle"),
      description: browser.i18n.getMessage("ConfirmFilterDeletePrompt", [
        filter[rowIdPropName],
        title.toLowerCase(),
      ]),
      confirmationText: browser.i18n.getMessage(
        "ConfirmFilterDeleteButton_Accept",
      ),
      cancellationText: browser.i18n.getMessage(
        "ConfirmFilterDeleteButton_Decline",
      ),
    })
      .then(() => {
        return sendFilterMessage(REMOVE_FILTER, filter);
      })
      .catch(() => {});
  };

  const actionsColumn = {
    field: "actions",
    type: "actions",
    headerName: browser.i18n.getMessage("FilterDataGrid_ColumnHeader_Actions"),
    width: 100,
    getActions: ({ row: filter }) => {
      return [
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip
              title={browser.i18n.getMessage(
                "FilterDataGrid_ActionTooltip_Edit",
              )}
            >
              <EditIcon />
            </Tooltip>
          }
          label={browser.i18n.getMessage("FilterDataGrid_ActionTooltip_Edit")}
          className="textPrimary"
          onClick={() => editFilter(filter)}
          color="inherit"
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip
              title={browser.i18n.getMessage(
                "FilterDataGrid_ActionTooltip_Delete",
              )}
            >
              <DeleteIcon />
            </Tooltip>
          }
          label={browser.i18n.getMessage("FilterDataGrid_ActionTooltip_Delete")}
          onClick={() => deleteFilter(filter)}
          color="inherit"
        />,
      ];
    },
  };

  return (
    <>
      {invalidRows.length > 0 && (
        <InvalidFilterDataWarning
          filterKey={filterKey}
          idPropName={rowIdPropName}
          invalidFilters={invalidRows}
          purgeInvalidFilters={purgeInvalidFilters}
        />
      )}
      <Card>
        <CardHeader
          action={
            rows.length > 0 && (
              <FilterDataGridMainMenu
                title={title}
                onExportClick={onExportClick}
                onResetClick={onResetClick}
              />
            )
          }
          title={
            loading
              ? browser.i18n.getMessage("FilterNameLoading", [title])
              : browser.i18n.getMessage(
                  `FilterNameWithCount_${rows.length === 1 ? "Singular" : "Plural"}`,
                  [rows.length, title],
                )
          }
          titleTypographyProps={{
            component: "h2",
            variant: "h6",
          }}
        />
        <CardContent>
          {!enabled && (
            <Alert
              severity="warning"
              variant="standard"
              sx={{
                mb: 4,
              }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setEnabled(true)}
                >
                  {browser.i18n.getMessage("FilterType_Enable_ButtonLabel")}
                </Button>
              }
            >
              {browser.i18n.getMessage("Warning_FilterName_Disabled", [title])}
            </Alert>
          )}
          <DataGrid
            autoHeight
            columns={[...columns, actionsColumn]}
            disableRowSelectionOnClick
            getRowId={(row) => row[rowIdPropName]}
            ignoreDiacritics
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25, page: 0 },
              },
            }}
            loading={loading}
            rows={rows}
            slots={{
              columnMenu: FilterDataGridColumnMenu,
              noRowsOverlay: FilterDataGridNoRowsOverlay,
              toolbar: rows.length > 0 ? FilterDataGridToolbar : undefined,
            }}
            slotProps={{
              noRowsOverlay: { title, createFilter },
              toolbar: { title, createFilter },
            }}
            sx={{
              border: 0,
              "--DataGrid-overlayHeight": OVERLAY_HEIGHT,
              ...DISABLE_FOCUS_STYLES,
            }}
          />
        </CardContent>
      </Card>

      <FilterUpsertDialog
        open={showFilterUpsertDialog}
        handleClose={() => {
          setShowFilterUpsertDialog(false);
        }}
        filterKey={filterKey}
        title={browser.i18n.getMessage("FilterTitle_Keyword")}
        oldFilter={filterToEdit}
        onTransitionExited={() => {
          setFilterToEdit(null);
        }}
      >
        {filterDialogFormFields({ filter: filterToEdit })}
      </FilterUpsertDialog>
    </>
  );
}

FilterDataGrid.propTypes = {
  title: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({ field: PropTypes.string.isRequired }),
  ),
  filterDialogFormFields: PropTypes.func.isRequired,
};
