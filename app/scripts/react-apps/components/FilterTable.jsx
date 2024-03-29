/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
/* eslint-disable no-async-promise-executor */
import React, { forwardRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "notistack";

import MaterialTable, { MTableEditRow } from "@material-table/core";

import { isEqual } from "lodash-es";

import AddBoxIcon from "@mui/icons-material/AddBox";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import RemoveIcon from "@mui/icons-material/Remove";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

import {
  ADD_FILTER,
  REMOVE_FILTER,
  SAVE_FILTER,
  UPDATE_FILTER,
  VALIDATE_NEW_FILTER,
  VALIDATE_UPDATED_FILTER,
} from "../../constants/messages";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBoxIcon {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <CheckIcon {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => (
    <DeleteOutlineIcon {...props} ref={ref} />
  )),
  DeleteSweep: forwardRef((props, ref) => (
    <DeleteSweepIcon {...props} ref={ref} />
  )),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRightIcon {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <EditIcon {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAltIcon {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterListIcon {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPageIcon {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPageIcon {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => (
    <ChevronRightIcon {...props} ref={ref} />
  )),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeftIcon {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <SearchIcon {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => (
    <ArrowDownwardIcon {...props} ref={ref} />
  )),
  ThirdStateCheck: forwardRef((props, ref) => (
    <RemoveIcon {...props} ref={ref} />
  )),
  ViewColumn: forwardRef((props, ref) => (
    <ViewColumnIcon {...props} ref={ref} />
  )),
};

const FilterTable = ({ filterKey, columns, title, ...props }) => {
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();

  const onStorageChanged = (changes, areaName) => {
    console.time("onStorageChanged()");
    if (areaName === "local" && Object.keys(changes).includes(filterKey)) {
      setData(changes[filterKey].newValue);
    }
    console.timeEnd("onStorageChanged()");
  };

  useEffect(() => {
    if (!browser.storage.onChanged.hasListener(onStorageChanged)) {
      browser.storage.onChanged.addListener(onStorageChanged);
    }

    return () => {
      if (browser.storage.onChanged.hasListener(onStorageChanged)) {
        browser.storage.onChanged.removeListener(onStorageChanged);
      }
    };
  }, []);

  const loadData = async () => {
    const storageData = await browser.storage.local.get(filterKey);
    setData(Array.from(storageData[filterKey] ?? []));
  };

  const [data, setData] = useState([]);
  useEffect(() => {
    loadData();
  }, [filterKey]);

  const sendFilterMessage = async (action, value) => {
    console.time(`sendFilterMessage(${action})`);
    const response = await browser.runtime.sendMessage({
      action,
      data: {
        key: filterKey,
        value,
      },
    });
    console.timeEnd(`sendFilterMessage(${action})`);
    return response;
  };

  const confirmReset = (data) => {
    confirm({
      title: browser.i18n.getMessage("ConfirmAllFiltersDeleteTitle"),
      description: browser.i18n.getMessage("ConfirmAllFiltersDeletePrompt", [
        data.length,
        title.toLowerCase(),
      ]),
      confirmationText: browser.i18n.getMessage(
        "ConfirmAllFiltersDeleteButton_Accept",
      ),
      cancellationText: browser.i18n.getMessage(
        "ConfirmAllFiltersDeleteButton_Decline",
      ),
    })
      .then(() => {
        resetFilter();
      })
      .catch(() => {});
  };

  const resetFilter = async () => {
    await sendFilterMessage(SAVE_FILTER, []);
    setData([]);
  };

  const validateFilterProperties = (filter) => {
    for (const column of columns) {
      if (column.required) {
        if (
          filter[column.field] === undefined ||
          !filter[column.field].length
        ) {
          column.setError?.({
            error: true,
            helperText: browser.i18n.getMessage("RequiredFieldLabel", [
              column.title,
            ]),
          });
          return false;
        }
      }

      if (column.pattern) {
        if (!column.pattern?.regex?.test?.(filter[column.field])) {
          column.setError?.({
            error: true,
            helperText: column.pattern?.hint
              ? browser.i18n.getMessage("InvalidFieldLabelWithHint", [
                  column.pattern.hint,
                ])
              : browser.i18n.getMessage("InvalidFieldLabel"),
          });
          return false;
        }
      }

      column.setError?.({
        error: false,
        helperText: "",
      });
    }

    return true;
  };

  const validateFilter = async (action, value) => {
    const validation = await sendFilterMessage(action, value);
    if (!validation.isValid) {
      enqueueSnackbar(validation.message, {
        variant: "error",
        preventDuplicate: true,
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
      return false;
    }

    return true;
  };

  const validateNewFilter = async (newFilter) => {
    if (!validateFilterProperties(newFilter)) {
      return false;
    }

    return await validateFilter(VALIDATE_NEW_FILTER, newFilter);
  };

  const validateUpdatedFilter = async (newFilter, oldFilter) => {
    if (!validateFilterProperties(newFilter)) {
      return false;
    }

    return await validateFilter(VALIDATE_UPDATED_FILTER, {
      new: newFilter,
      old: oldFilter,
    });
  };

  const stripTableData = ({ tableData, ...data }) => data;

  return (
    <MaterialTable
      {...props}
      title={browser.i18n.getMessage("FilterNameWithCount", [
        data.length,
        title,
      ])}
      icons={tableIcons}
      columns={columns}
      data={data}
      options={{
        draggable: false,
        pageSize: 10,
        pageSizeOptions: [10, 25, 50, 100],
        addRowPosition: "first",
      }}
      editable={{
        onRowAdd: (newData) =>
          new Promise(async (resolve, reject) => {
            const newFilterData = stripTableData(newData);

            const isValid = await validateNewFilter(newFilterData);
            if (!isValid) {
              reject();
              return;
            }

            return sendFilterMessage(ADD_FILTER, newFilterData).then(
              resolve,
              reject,
            );
          }),
        onRowDelete: (oldData) =>
          new Promise((resolve, reject) => {
            const oldFilterData = stripTableData(oldData);

            return sendFilterMessage(REMOVE_FILTER, oldFilterData).then(
              resolve,
              reject,
            );
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(async (resolve, reject) => {
            const newFilterData = stripTableData(newData);
            const oldFilterData = stripTableData(oldData);

            if (isEqual(oldFilterData, newFilterData)) {
              resolve();
              return;
            }

            const isValid = await validateUpdatedFilter(
              newFilterData,
              oldFilterData,
            );
            if (!isValid) {
              reject();
              return;
            }

            const value = {
              old: oldFilterData,
              new: newFilterData,
            };

            return sendFilterMessage(UPDATE_FILTER, value).then(
              resolve,
              reject,
            );
          }),
      }}
      actions={[
        {
          icon: tableIcons.DeleteSweep,
          tooltip: browser.i18n.getMessage("DeleteAllFiltersButtonTooltip"),
          onClick: () => confirmReset(data),
          isFreeAction: true,
          disabled: data.length < 2,
        },
      ]}
      components={{
        EditRow: ({ onEditingApproved, onEditingCanceled, ...props }) => {
          return (
            <MTableEditRow
              {...props}
              onEditingApproved={(mode, newData, oldData) => {
                columns.forEach((column) =>
                  column.setError?.({
                    error: false,
                    helperText: "",
                  }),
                );
                onEditingApproved(mode, newData, oldData);
              }}
              onEditingCanceled={(mode, rowData) => {
                columns.forEach((column) =>
                  column.setError?.({
                    error: false,
                    helperText: "",
                  }),
                );
                onEditingCanceled(mode, rowData);
              }}
            />
          );
        },
      }}
    />
  );
};

FilterTable.propTypes = {
  filterKey: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};

export default FilterTable;
