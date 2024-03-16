import React, { useState } from "react";
import PropTypes from "prop-types";

import { useConfirm } from "material-ui-confirm";

import { styled } from "@mui/material/styles";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
  DataGrid,
  GridActionsCellItem,
  GridLogicOperator,
  gridClasses,
  useGridApiRef,
} from "@mui/x-data-grid";

import FilterUpsertDialog from "./FilterUpsertDialog";

import FilterDataGridMainMenu from "./FilterDataGridComponents/FilterDataGridMainMenu";
import FilterDataGridToolbar from "./FilterDataGridComponents/FilterDataGridToolbar";
import FilterDataGridColumnMenu from "./FilterDataGridComponents/FilterDataGridColumnMenu";
import FilterDataGridNoRowsOverlay, {
  OVERLAY_HEIGHT,
} from "./FilterDataGridComponents/FilterDataGridNoRowsOverlay";

import InvalidFilterDataWarning from "./InvalidFilterDataWarning";

import useOptions from "../../hooks/useOptions";
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

const FilterDataGridCardContent = styled(CardContent)(({ theme }) => ({
  "&:last-child": {
    paddingTop: 0,
    paddingBottom: theme.spacing(1),
  },
}));

export default function FilterDataGrid({
  title,
  columns,
  filterDialogFormFields,
}) {
  const apiRef = useGridApiRef();

  const confirm = useConfirm();

  const [showFilterUpsertDialog, setShowFilterUpsertDialog] = useState(false);
  const [filterToEdit, setFilterToEdit] = useState(null);

  const {
    filterKey,
    idPropName: rowIdPropName,
    enabled,
    setEnabled,
    loading,
    validFilters,
    invalidFilters,
    purgeInvalidFilters,
    sendFilterMessage,
    exportFiltersToFile,
  } = useFilterData();

  const { options, setOptions } = useOptions();
  const onlyShowAllowed = (options.onlyShowAllowed ?? []).includes(filterKey);
  const toggleOnlyShowAllowed = () => {
    setOptions({
      ...options,
      onlyShowAllowed: onlyShowAllowed
        ? options.onlyShowAllowed.filter((f) => f !== filterKey)
        : Array.from(new Set([...options.onlyShowAllowed, filterKey])),
    });
  };

  const [visibleFilterType, setVisibleFilterType] = useState("blocked");

  const [filterModel, setFilterModel] = useState({
    items: [
      {
        id: "type",
        field: "type",
        operator: "equals",
        value: "blocked",
      },
    ],
    logicOperator: GridLogicOperator.And,
  });

  const handleVisibleFilterTypeTabChange = (event, newValue) => {
    setVisibleFilterType(newValue);
    apiRef.current.setFilterModel({
      items: [
        {
          id: "type",
          field: "type",
          operator: "equals",
          value: newValue,
        },
      ],
      logicOperator: GridLogicOperator.And,
    });
    apiRef.current.setRowSelectionModel([]);
  };

  const onExportClick = () => {
    exportFiltersToFile(validFilters);
  };

  const onResetClick = () => {
    confirm({
      title: browser.i18n.getMessage("ConfirmAllFiltersDeleteTitle"),
      description: browser.i18n.getMessage("ConfirmAllFiltersDeletePrompt", [
        validFilters.length,
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
      {invalidFilters.length > 0 && (
        <InvalidFilterDataWarning
          filterKey={filterKey}
          idPropName={rowIdPropName}
          invalidFilters={invalidFilters}
          purgeInvalidFilters={purgeInvalidFilters}
        />
      )}
      <Card>
        <CardHeader
          action={
            validFilters.length > 0 && (
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
                  `FilterNameWithCount_${validFilters.length === 1 ? "Singular" : "Plural"}`,
                  [validFilters.length, title],
                )
          }
          titleTypographyProps={{
            component: "h2",
            variant: "h6",
          }}
        />
        <FilterDataGridCardContent>
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
                  {browser.i18n.getMessage("FilterKey_Enable_ButtonLabel")}
                </Button>
              }
            >
              {browser.i18n.getMessage("Warning_FilterName_Disabled", [title])}
            </Alert>
          )}
          <FormControl disabled={loading || !enabled}>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={onlyShowAllowed}
                  onChange={toggleOnlyShowAllowed}
                />
              }
              label={browser.i18n.getMessage(
                `FilterOption_OnlyShowAllowed_${filterKey}`,
              )}
            />
            <FormHelperText
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage(
                  `FilterOption_HelpText_OnlyShowAllowed_${filterKey}`,
                ),
              }}
              sx={(theme) => ({
                marginInline: 0,
                marginBlockEnd: theme.spacing(1),
              })}
            />
          </FormControl>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 1 }}
            >
              <Tabs
                value={visibleFilterType}
                onChange={handleVisibleFilterTypeTabChange}
              >
                <Tab
                  label={browser.i18n.getMessage(
                    `FilterTitle_Blocked_${filterKey}_Plural`,
                  )}
                  value="blocked"
                />
                <Tab
                  label={browser.i18n.getMessage(
                    `FilterTitle_Allowed_${filterKey}_Plural`,
                  )}
                  value="allowed"
                />
              </Tabs>
            </Box>
            <DataGrid
              apiRef={apiRef}
              autoHeight
              checkboxSelection
              columns={[...columns, actionsColumn]}
              columnVisibilityModel={{
                type: false,
              }}
              disableColumnFilter
              filterModel={filterModel}
              onFilterModelChange={setFilterModel}
              getRowId={(row) => row[rowIdPropName]}
              ignoreDiacritics
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25, page: 0 },
                },
              }}
              loading={loading}
              rows={validFilters}
              slots={{
                columnMenu: FilterDataGridColumnMenu,
                noRowsOverlay: FilterDataGridNoRowsOverlay,
                toolbar:
                  validFilters.length > 0 ? FilterDataGridToolbar : undefined,
              }}
              slotProps={{
                noRowsOverlay: {
                  buttonTitle: browser.i18n.getMessage(
                    `FilterTitle_${visibleFilterType}_${filterKey}_Singular`,
                  ),
                  helpTextTitle: title,
                  createFilter,
                },
                toolbar: {
                  title: browser.i18n.getMessage(
                    `FilterTitle_${visibleFilterType}_${filterKey}_Singular`,
                  ),
                  createFilter,
                },
              }}
              sx={{
                border: 0,
                "--DataGrid-overlayHeight": OVERLAY_HEIGHT,
                ...DISABLE_FOCUS_STYLES,
              }}
            />
          </Box>
        </FilterDataGridCardContent>
      </Card>

      <FilterUpsertDialog
        open={showFilterUpsertDialog}
        handleClose={() => {
          setShowFilterUpsertDialog(false);
        }}
        filterKey={filterKey}
        title={browser.i18n.getMessage(
          `FilterTitle_${visibleFilterType}_${filterKey}_Singular`,
        )}
        oldFilter={filterToEdit}
        onTransitionExited={() => {
          setFilterToEdit(null);
        }}
        hiddenFilterProps={{
          type: visibleFilterType,
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
