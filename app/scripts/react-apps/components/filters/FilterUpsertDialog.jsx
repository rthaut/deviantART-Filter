import React from "react";
import PropTypes from "prop-types";

import { useSnackbar } from "notistack";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";

import {
  CREATE_FILTER,
  UPDATE_FILTER,
  VALIDATE_NEW_FILTER,
  VALIDATE_UPDATED_FILTER,
} from "../../../constants/messages";

export default function FilterUpsertDialog({
  open,
  handleClose,
  title,
  oldFilter,
  filterKey,
  hiddenFilterProps,
  children,
  ...props
}) {
  const { enqueueSnackbar } = useSnackbar();

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

  const handleFilterValidation = async (action, value) => {
    const { isValid, message } = await sendFilterMessage(action, value);
    if (!isValid) {
      throw new Error(message);
    }
  };

  const updatingFilter = oldFilter !== undefined && oldFilter !== null;

  const onSubmit = async (event) => {
    event.preventDefault();
    const newFilter = {
      ...Object.fromEntries(new FormData(event.currentTarget).entries()),
      ...hiddenFilterProps,
    };

    let success = false;
    try {
      if (updatingFilter) {
        const filters = {
          new: newFilter,
          old: oldFilter,
        };
        await handleFilterValidation(VALIDATE_UPDATED_FILTER, filters);
        await sendFilterMessage(UPDATE_FILTER, filters);
      } else {
        await handleFilterValidation(VALIDATE_NEW_FILTER, newFilter);
        await sendFilterMessage(CREATE_FILTER, newFilter);
      }
      success = true;
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    }

    if (success) {
      handleClose();
      enqueueSnackbar(
        browser.i18n.getMessage(
          `Filter${updatingFilter ? "Updated" : "Created"}Successfully`,
        ),
        {
          variant: "success",
          preventDuplicate: true,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        },
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        handleClose();
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: "form",
        onSubmit,
      }}
      {...props}
    >
      <DialogTitle>
        {browser.i18n.getMessage(
          `FilterUpsertDialog_Title_${updatingFilter ? "Update" : "Create"}`,
          [title],
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {children}
          <DialogContentText
            component="div"
            dangerouslySetInnerHTML={{
              __html: browser.i18n.getMessage(
                `Filter_${filterKey}_UpsertHelpHTML`,
              ),
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {browser.i18n.getMessage("FilterUpsertDialog_ButtonLabel_Cancel")}
        </Button>
        <Button variant="contained" type="submit">
          {browser.i18n.getMessage("FilterUpsertDialog_ButtonLabel_Submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FilterUpsertDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  oldFilter: PropTypes.object,
  filterKey: PropTypes.string.isRequired,
  hiddenFilterProps: PropTypes.object,
  children: PropTypes.node.isRequired,
};
