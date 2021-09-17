import React, { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "react-use";

import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { deepOrange, grey } from "@material-ui/core/colors";

import {
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  Button,
  Grid,
  SvgIcon,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

import {
  FETCH_METADATA,
  IMPORT_FILTERS,
  SHOW_FILTER_DEVIATION_MODAL,
  HIDE_FILTER_DEVIATION_MODAL,
} from "../constants/messages";

import MetadataFiltersForm from "./components/MetadataFiltersForm";
import MetadataFiltersResults from "./components/MetadataFiltersResults";

const initialFilters = {
  users: [],
  keywords: [],
};

function LogoIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 38 24">
      <path d="M 30.382812 23.636719 L 31.0625 24 L 37.953125 24 L 37.953125 16.949219 L 37.257812 16.246094 L 31.0625 12.917969 L 30.371094 11.871094 L 30.371094 0 L 20.90625 0 L 20.90625 6.527344 L 20.21875 7.109375 L 7.617188 0.363281 L 6.9375 0 L 0.046875 0 L 0.046875 7.050781 L 0.738281 7.753906 L 6.9375 11.082031 L 7.628906 12.128906 L 7.628906 24 L 17.09375 24 L 17.09375 17.472656 L 17.785156 16.890625 Z M 30.382812 23.636719 " />
    </SvgIcon>
  );
}

const useStyles = makeStyles((theme) => ({
  dialogHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  dialogIcon: {
    marginRight: theme.spacing(1),
  },
}));

const CreateFiltersApp = () => {
  const classes = useStyles();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode] = useLocalStorage("dark-mode", prefersDarkMode);

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          primary: deepOrange,
          secondary: grey,
          type: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  const [error, setError] = useState({
    message: "",
    error: "",
  });

  const [metadata, setMetadata] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState(null);

  const [title, setTitle] = useState(
    browser.i18n.getMessage("CreateFiltersFromDeviation_Title")
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
          "CreateFiltersFromDeviation_Error_FetchingMetadata"
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
          [count]
        )
      );
    } catch (error) {
      setError({
        message: browser.i18n.getMessage(
          "CreateFiltersFromDeviation_Error_CreatingFilters"
        ),
        error,
      });
      setResults(null);
    }

    setWorking(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={true} onClose={closeModal} maxWidth="sm">
        <DialogTitle disableTypography>
          <div className={classes.dialogHeader}>
            <LogoIcon
              color="primary"
              fontSize="large"
              className={classes.dialogIcon}
            />
            <Typography variant="h5">{title}</Typography>
          </div>
          {metadata?.title && !results && (
            <Typography variant="h6">{metadata.title}</Typography>
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
                      "CreateFiltersFromDeviation_Error_Instructions_HasError"
                    )}
                  </Typography>
                  <Typography component="code" variant="inherit">
                    {error.error.message}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" gutterBottom>
                  {browser.i18n.getMessage(
                    "CreateFiltersFromDeviation_Error_Instructions"
                  )}
                </Typography>
              )}
            </Alert>
          )}

          {working ? (
            <Grid
              container
              direction="column"
              justify="center"
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
              <Button
                variant="contained"
                color="secondary"
                onClick={closeModal}
              >
                {browser.i18n.getMessage(
                  "CreateFiltersFromDeviation_Button_Close"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={closeModal}>
                {browser.i18n.getMessage(
                  "CreateFiltersFromDeviation_Button_Cancel"
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
                  [mapCount(filters, "length")]
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default CreateFiltersApp;
