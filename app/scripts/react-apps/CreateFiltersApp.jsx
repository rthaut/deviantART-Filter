import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";

import { Alert, AlertTitle } from "@mui/lab";

import {
  FETCH_METADATA,
  IMPORT_FILTERS,
  SHOW_FILTER_DEVIATION_MODAL,
  HIDE_FILTER_DEVIATION_MODAL,
} from "../constants/messages";

import AppProviders from "./components/AppProviders";
import LogoIcon from "./components/LogoIcon";
import MetadataFiltersForm from "./components/MetadataFiltersForm";
import MetadataFiltersResults from "./components/MetadataFiltersResults";

const initialFilters = {
  users: [],
  keywords: [],
};

const CreateFiltersAppMain = () => {
  const [error, setError] = useState({
    message: "",
    error: "",
  });

  const [metadata, setMetadata] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState(null);

  const [title, setTitle] = useState(
    browser.i18n.getMessage("CreateFiltersFromDeviation_Title"),
  );
  const [working, setWorking] = useState(false);

  const onRuntimeMessage = (message) => {
    switch (message.action) {
      case SHOW_FILTER_DEVIATION_MODAL:
        loadMetadata(message.data.link);
        break;
    }
  };

  useEffect(() => {
    if (!browser.runtime.onMessage.hasListener(onRuntimeMessage)) {
      browser.runtime.onMessage.addListener(onRuntimeMessage);
    }

    return () => {
      if (browser.runtime.onMessage.hasListener(onRuntimeMessage)) {
        browser.runtime.onMessage.removeListener(onRuntimeMessage);
      }
    };
  }, []);

  const setFilter = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const reset = () => {
    setFilters(initialFilters);
    setResults(null);
    setTitle(browser.i18n.getMessage("CreateFiltersFromDeviation_Title"));
  };

  useEffect(() => {
    reset();
  }, [metadata]);

  const closeModal = async () => {
    await browser.runtime.sendMessage({
      action: HIDE_FILTER_DEVIATION_MODAL,
    });
    setMetadata(null);
  };

  const mapCount = (obj, property) =>
    Object.values(obj).reduce((prev, cur) => (prev += cur[property]), 0);

  const loadMetadata = async (url) => {
    setWorking(true);

    try {
      const _metadata = await browser.runtime.sendMessage({
        action: FETCH_METADATA,
        data: {
          url,
        },
      });
      setMetadata(_metadata);
    } catch (error) {
      setError({
        message: browser.i18n.getMessage(
          "CreateFiltersFromDeviation_Error_FetchingMetadata",
        ),
        error,
      });
      setMetadata(null);
    }

    setWorking(false);
  };

  const createFilters = async () => {
    setWorking(true);

    try {
      const _results = await browser.runtime.sendMessage({
        action: IMPORT_FILTERS,
        data: filters,
      });
      setResults(_results);

      const count = mapCount(_results, "new");
      setTitle(
        browser.i18n.getMessage(
          `CreateFiltersFromDeviation_Title_SuccessWithCount_${
            count == 1 ? "Singular" : "Plural"
          }`,
          [count],
        ),
      );
    } catch (error) {
      setError({
        message: browser.i18n.getMessage(
          "CreateFiltersFromDeviation_Error_CreatingFilters",
        ),
        error,
      });
      setResults(null);
    }

    setWorking(false);
  };

  return (
    <Dialog open={true} onClose={closeModal} maxWidth="sm">
      <DialogTitle>
        <Box sx={{ display: "flex", gap: 1 }}>
          <LogoIcon color="primary" fontSize="large" />
          <Typography component="span" variant="h5" gutterBottom>
            {title}
          </Typography>
        </Box>
        {metadata?.title && !results && (
          <Typography component="span" variant="h6">
            &quot;{metadata.title}&quot; by {metadata.author_name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {error?.message && (
          <Alert severity="error">
            <AlertTitle>
              <strong>{error.message}</strong>
            </AlertTitle>
            {error.error?.message ? (
              <>
                <Typography variant="body1" gutterBottom>
                  {browser.i18n.getMessage(
                    "CreateFiltersFromDeviation_Error_Instructions_HasError",
                  )}
                </Typography>
                <Typography component="code" variant="inherit">
                  {error.error.message}
                </Typography>
              </>
            ) : (
              <Typography variant="body1" gutterBottom>
                {browser.i18n.getMessage(
                  "CreateFiltersFromDeviation_Error_Instructions",
                )}
              </Typography>
            )}
          </Alert>
        )}

        {working ? (
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress />
          </Grid>
        ) : results ? (
          <MetadataFiltersResults results={results} />
        ) : (
          <MetadataFiltersForm metadata={metadata} setFilter={setFilter} />
        )}
      </DialogContent>

      <DialogActions>
        {results ? (
          <>
            <Button variant="contained" color="secondary" onClick={closeModal}>
              {browser.i18n.getMessage(
                "CreateFiltersFromDeviation_Button_Close",
              )}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={closeModal}>
              {browser.i18n.getMessage(
                "CreateFiltersFromDeviation_Button_Cancel",
              )}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={createFilters}
              disabled={mapCount(filters, "length") < 1}
            >
              {browser.i18n.getMessage(
                `CreateFiltersFromDeviation_Button_CreateWithCount_${
                  mapCount(filters, "length") == 1 ? "Singular" : "Plural"
                }`,
                [mapCount(filters, "length")],
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

const CreateFiltersApp = () => {
  return (
    <AppProviders>
      <CreateFiltersAppMain />
    </AppProviders>
  );
};

export default CreateFiltersApp;
