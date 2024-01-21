import React, { useEffect } from "react";
import { useList } from "react-use";
import { useDropzone } from "react-dropzone";

import { Box, Typography } from "@mui/material";

import useTheme from "../hooks/useTheme";

import ImportFilterResultsTable from "./ImportFilterResultsTable";

import { IMPORT_FILTERS } from "../../constants/messages";

const FiltersImporter = () => {
  const theme = useTheme();

  const [imports, { set: setImports, upsert: upsertImports }] = useList([]);

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    accept: "application/json",
  });

  const readFileData = (file) =>
    new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onabort = () => reject("File reading aborted");
        reader.onerror = () => reject("File reading failed");
        reader.onload = () => {
          const data = JSON.parse(reader.result);
          resolve(data);
        };

        reader.readAsText(file);
      } catch (ex) {
        console.error("Failed to read data from file(s)", ex);
        reject("File reading failed");
      }
    });

  const importFileData = async (data) => {
    return await browser.runtime.sendMessage({
      action: IMPORT_FILTERS,
      data: data,
    });
  };

  const processFiles = (files) => {
    const imports = files.map((file) => ({ file }));
    setImports(imports);

    // process each file in sequence with a promise reducer
    imports.reduce(
      (promise, currentImport) =>
        promise.then(async () => {
          const data = await readFileData(currentImport.file);
          const result = await importFileData(data);
          currentImport.results = result;
          upsertImports((a, b) => a.file.path === b.file.path, currentImport);
        }),
      Promise.resolve(),
    );
  };

  useEffect(() => {
    processFiles(acceptedFiles);
  }, [acceptedFiles]);

  return (
    <>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: theme.spacing(3),
          border: 2,
          borderColor: isDragReject
            ? theme.palette.error.main
            : isDragActive
              ? theme.palette.text.primary
              : theme.palette.text.hint,
          borderRadius: 2,
          borderStyle: isDragReject
            ? theme.palette.error.main
            : isDragActive
              ? "solid"
              : "dashed",
          bgColor: theme.palette.background.default,
          color: isDragReject
            ? theme.palette.error.main
            : theme.palette.text.primary,
          outline: "none",
          transition: "border .2s ease-in-out",
        }}
        variant="outlined"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Typography
          component="p"
          variant="subtitle2"
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("ImportInstructions"),
          }}
        ></Typography>
        {isDragReject && (
          <Typography component="p" variant="h6">
            {browser.i18n.getMessage("InvalidImportFileTypeMessage")}
          </Typography>
        )}
      </Box>
      {imports.length > 0 && (
        <Box sx={{ marginTop: theme.spacing(3) }}>
          <ImportFilterResultsTable results={imports} />
        </Box>
      )}
    </>
  );
};

export default FiltersImporter;
