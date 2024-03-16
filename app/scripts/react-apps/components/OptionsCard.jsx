import React from "react";

import { useConfirm } from "material-ui-confirm";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import useOptions from "../hooks/useOptions";

import { DEFAULT_OPTIONS, SUBMISSION_TYPES } from "../../constants/options";

const OptionsCard = () => {
  const confirm = useConfirm();

  const {
    options,
    setOptions,
    resetOptions,
    setGroupedBoolean,
    toggleGroupedBoolean,
  } = useOptions();

  const togglePageEnabled = toggleGroupedBoolean("pages");
  const toggleMetadataOption = toggleGroupedBoolean("metadata", false);
  const togglePlaceholderOption = toggleGroupedBoolean("placeholders", false);

  const handleToggleMetadataEnabled = async (event) => {
    const disabling = event.target.checked === false;
    if (disabling) {
      confirm({
        title: browser.i18n.getMessage("ConfirmOptionsDisableMetadataTitle"),
        description: browser.i18n.getMessage(
          "ConfirmOptionsDisableMetadataPrompt",
        ),
        confirmationText: browser.i18n.getMessage(
          "ConfirmOptionsDisableMetadataButton_Accept",
        ),
        cancellationText: browser.i18n.getMessage(
          "ConfirmOptionsDisableMetadataButton_Decline",
        ),
      })
        .then(() => {
          setGroupedBoolean("metadata", "enabled", false);
        })
        .catch(() => {});
    } else {
      setGroupedBoolean("metadata", "enabled", true);
    }
  };

  const handleUpdatePageChange = (event) => {
    setOptions({
      ...options,
      showUpdatedPageOnUpdate: event.target.value,
    });
  };

  const handleUntaggedSubmissionTypesChange = (event) => {
    const value =
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value;

    value.sort((a, b) => a.localeCompare(b));

    setOptions({
      ...options,
      filterUntaggedSubmissionTypes: value,
    });
  };

  const renderUntaggedSubmissionTypes = (selected) => {
    if (!selected || selected.length === 0) {
      return (
        <em>
          {browser.i18n.getMessage(
            "Options_FilterUntaggedSubmissions_SelectedList_None",
          )}
        </em>
      );
    }

    const selectedLabels = selected.map(
      (key) =>
        SUBMISSION_TYPES[key] ??
        browser.i18n.getMessage(`SubmissionType_PluralLabel_${key}`) ??
        key,
    );

    switch (selectedLabels.length) {
      case 1:
        return browser.i18n.getMessage(
          "Options_FilterUntaggedSubmissions_SelectedList_SingleOption",
          selectedLabels,
        );
      case 2:
        return browser.i18n.getMessage(
          "Options_FilterUntaggedSubmissions_SelectedList_DualOptions",
          selectedLabels,
        );
      default:
        return browser.i18n.getMessage(
          "Options_FilterUntaggedSubmissions_SelectedList_MultipleOptions",
          [selectedLabels.slice(0, -1).join(", "), selectedLabels.slice(-1)],
        );
    }
  };
  return (
    <Card>
      <CardContent>
        <Typography component="h2" variant="h6" gutterBottom>
          {browser.i18n.getMessage("OptionsTitle")}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl
              component="fieldset"
              sx={{ marginTop: 1, marginBottom: 2 }}
            >
              <Typography component="legend" sx={{ padding: 0 }}>
                {browser.i18n.getMessage("Options_EnabledPages_Header")}
              </Typography>
              <Typography
                component="p"
                variant="body2"
                color="textSecondary"
                gutterBottom
              >
                {browser.i18n.getMessage("Options_EnabledPages_HelpText")}
              </Typography>
              <FormGroup>
                {Object.keys(DEFAULT_OPTIONS.pages).map((key) => (
                  <FormControlLabel
                    key={key}
                    label={browser.i18n.getMessage(
                      `Options_EnabledPages_PageLabel_${key}`,
                    )}
                    control={
                      <Switch
                        name={key}
                        color="primary"
                        checked={options?.pages[key]}
                        onChange={togglePageEnabled}
                      />
                    }
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl
              component="fieldset"
              sx={{ marginTop: 1, marginBottom: 2 }}
            >
              <Typography component="legend" sx={{ padding: 0 }}>
                {browser.i18n.getMessage(
                  "Options_PlaceholderFunctionality_Header",
                )}
              </Typography>
              <Typography
                component="p"
                variant="body2"
                color="textSecondary"
                gutterBottom
              >
                {browser.i18n.getMessage(
                  "Options_PlaceholderFunctionality_HelpText",
                )}
              </Typography>
              <FormGroup>
                {Object.keys(DEFAULT_OPTIONS.placeholders).map((key) => (
                  <FormControlLabel
                    key={key}
                    label={browser.i18n.getMessage(
                      `Options_PlaceholderFunctionality_OptionLabel_${key}`,
                    )}
                    control={
                      <Switch
                        name={key}
                        color="primary"
                        checked={options?.placeholders[key]}
                        onChange={togglePlaceholderOption}
                      />
                    }
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl
              component="fieldset"
              sx={{ marginTop: 1, marginBottom: 2 }}
              variant="outlined"
              size="small"
            >
              <Typography component="legend" sx={{ padding: 0 }}>
                {browser.i18n.getMessage("Options_ShowUpdatedPage_Header")}
              </Typography>
              <Typography
                component="p"
                variant="body2"
                color="textSecondary"
                gutterBottom
              >
                {browser.i18n.getMessage("Options_ShowUpdatedPage_HelpText")}
              </Typography>
              <Select
                value={options?.showUpdatedPageOnUpdate}
                onChange={handleUpdatePageChange}
              >
                {["patch", "minor", "major", "none"].map((key) => (
                  <MenuItem key={key} value={key}>
                    {browser.i18n.getMessage(
                      `Options_ShowUpdatedPage_OptionLabel_${key}`,
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl
              component="fieldset"
              sx={{ marginTop: 1, marginBottom: 2 }}
              variant="outlined"
              size="small"
            >
              <Typography component="legend" sx={{ padding: 0 }}>
                {browser.i18n.getMessage(
                  "Options_FilterUntaggedSubmissions_Header",
                )}
              </Typography>
              <Typography
                component="p"
                variant="body2"
                color="textSecondary"
                gutterBottom
              >
                {browser.i18n.getMessage(
                  "Options_FilterUntaggedSubmissions_HelpText",
                )}
              </Typography>
              <Select
                multiple
                displayEmpty
                value={options.filterUntaggedSubmissionTypes ?? []}
                onChange={handleUntaggedSubmissionTypesChange}
                renderValue={renderUntaggedSubmissionTypes}
              >
                {Object.entries(SUBMISSION_TYPES).map(([key, label]) => (
                  <MenuItem key={key} value={key} dense disableGutters>
                    <Checkbox
                      checked={(
                        options.filterUntaggedSubmissionTypes ?? []
                      ).includes(key)}
                    />
                    <ListItemText primary={label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl
              component="fieldset"
              sx={{ marginTop: 1, marginBottom: 2 }}
            >
              <Typography component="legend" sx={{ padding: 0 }}>
                {browser.i18n.getMessage(
                  "Options_MetadataFunctionality_Header",
                )}
              </Typography>
              <Typography
                component="p"
                variant="body2"
                color="textSecondary"
                gutterBottom
              >
                {browser.i18n.getMessage(
                  "Options_MetadataFunctionality_HelpText",
                )}
              </Typography>
              <FormGroup>
                <FormControlLabel
                  label={
                    <>
                      {browser.i18n.getMessage(
                        `Options_MetadataFunctionality_OptionLabel_Enabled`,
                      )}
                      <br />
                      <Typography
                        component="span"
                        color="warning.dark"
                        dangerouslySetInnerHTML={{
                          __html: browser.i18n.getMessage(
                            "Options_MetadataFunctionality_OptionHelpText_Enabled",
                          ),
                        }}
                      />
                    </>
                  }
                  control={
                    <Switch
                      name="enabled"
                      color="primary"
                      checked={options.metadata.enabled}
                      onChange={handleToggleMetadataEnabled}
                    />
                  }
                />
              </FormGroup>
              <Divider variant="fullWidth" sx={{ marginY: 1 }} />
              <FormGroup>
                {Object.keys(DEFAULT_OPTIONS.metadata)
                  .filter((key) => key !== "enabled")
                  .map((key) => (
                    <FormControlLabel
                      key={key}
                      label={browser.i18n.getMessage(
                        `Options_MetadataFunctionality_OptionLabel_${key}`,
                      )}
                      control={
                        <Switch
                          name={key}
                          color="primary"
                          checked={options?.metadata[key]}
                          onChange={toggleMetadataOption}
                        />
                      }
                    />
                  ))}
              </FormGroup>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
      <Divider variant="middle" />
      <CardActions>
        <Button color="primary" onClick={resetOptions}>
          {browser.i18n.getMessage("Options_ButtonLabel_Reset")}
        </Button>
      </CardActions>
    </Card>
  );
};

export default OptionsCard;
