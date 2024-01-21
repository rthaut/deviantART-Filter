import React from "react";
import { Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { EXPORT_FILTERS } from "../../constants/messages";

const FiltersExportButton = () => {
  const exportFilters = async () => {
    const data = await browser.runtime.sendMessage({
      action: EXPORT_FILTERS,
    });
    const dataObj = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    const dataObjURL = URL.createObjectURL(dataObj);

    const date = new Date();
    const filename = browser.i18n.getMessage("ExtensionName").replace(" ", "_");

    const link = document.createElement("a");
    link.href = dataObjURL;
    link.download = `${filename}-${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}.json`;
    link.dispatchEvent(new MouseEvent("click"));
  };

  return (
    <Button
      onClick={exportFilters}
      color="primary"
      variant="contained"
      startIcon={<FileDownloadIcon />}
      fullWidth
    >
      {browser.i18n.getMessage("ExportButtonLabel")}
    </Button>
  );
};

export default FiltersExportButton;
