// eslint-disable-next-line no-unused-vars
import * as React from "react";

import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "notistack";

import useExtensionStorage from "../hooks/useExtensionStorage";

import { DEFAULT_OPTIONS, OPTIONS_STORAGE_KEY } from "../../constants/options";

const useOptions = () => {
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();

  const [options, setOptions] = useExtensionStorage({
    type: "local",
    key: OPTIONS_STORAGE_KEY,
    initialValue: DEFAULT_OPTIONS,
  });

  const showReloadRequired = () => {
    enqueueSnackbar(
      browser.i18n.getMessage("Options_Change_PagesRequireReload"),
      {
        variant: "default",
        preventDuplicate: true,
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      },
    );
  };

  const resetOptions = (_event) => {
    confirm({
      title: browser.i18n.getMessage("ConfirmOptionsResetTitle"),
      description: browser.i18n.getMessage("ConfirmOptionsResetPrompt"),
      confirmationText: browser.i18n.getMessage(
        "ConfirmOptionsResetButton_Accept",
      ),
      cancellationText: browser.i18n.getMessage(
        "ConfirmOptionsResetButton_Decline",
      ),
    })
      .then(() => {
        setOptions(DEFAULT_OPTIONS);
        showReloadRequired();
      })
      .catch(() => {});
  };

  const setGroupedBoolean = (group, name, value, reloadedRequired = true) => {
    setOptions({
      ...options,
      [group]: {
        ...options?.[group],
        [name]: value,
      },
    });
    if (reloadedRequired) {
      showReloadRequired();
    }
  };

  const toggleGroupedBoolean =
    (group, reloadedRequired = true) =>
    (event) => {
      setOptions({
        ...options,
        [group]: {
          ...options?.[group],
          [event.target.name]: event.target.checked,
        },
      });
      if (reloadedRequired) {
        showReloadRequired();
      }
    };

  return {
    options,
    setOptions,
    resetOptions,
    showReloadRequired,
    setGroupedBoolean,
    toggleGroupedBoolean,
  };
};

export default useOptions;
