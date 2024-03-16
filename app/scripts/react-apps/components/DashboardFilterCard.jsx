import React from "react";
import PropTypes from "prop-types";

import { NavLink } from "react-router-dom";
import { useLocalStorage } from "react-use";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";

import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useFilterData } from "../hooks/useFilterData";

const DashboardFilterCard = ({ title, link }) => {
  const {
    filterKey,
    enabled,
    setEnabled,
    loading,
    validFilters,
    invalidFilters,
  } = useFilterData();

  const [ignoreInvalidFiltersWarning] = useLocalStorage(
    `ignore-invalid-${filterKey}-filters`,
    false,
  );

  const allowedFilterCount = validFilters.filter(
    (filter) => (filter.type ?? "").toLowerCase() === "allowed",
  ).length;
  const blockedFilterCount = validFilters.length - allowedFilterCount;

  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader
        sx={{
          paddingBlockEnd: 0,
        }}
        action={
          loading ? null : (
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={enabled}
                  onChange={(event, checked) => setEnabled(checked)}
                />
              }
              label={browser.i18n.getMessage("FilterKey_Enabled_SwitchLabel")}
              slotProps={{
                typography: {
                  sx: (theme) => ({
                    color: enabled
                      ? theme.palette.text.primary
                      : theme.palette.text.disabled,
                  }),
                },
              }}
            />
          )
        }
        title={
          loading
            ? browser.i18n.getMessage("FilterNameLoading", [title])
            : browser.i18n.getMessage(
                `FilterNameWithCount_${validFilters.length == 1 ? "Singular" : "Plural"}`,
                [validFilters.length, title],
              )
        }
        titleTypographyProps={{
          component: "h2",
          variant: "h6",
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="column" spacing={1}>
          {!enabled && (
            <Alert severity="warning">
              {browser.i18n.getMessage("Warning_FilterName_Disabled", [title])}
            </Alert>
          )}
          {!ignoreInvalidFiltersWarning && invalidFilters.length > 0 && (
            <Alert severity="error">
              <AlertTitle sx={{ mb: 0 }}>
                {browser.i18n.getMessage("InvalidFilterData_Warning_Title")}
              </AlertTitle>
            </Alert>
          )}
          <List dense>
            <ListItem disableGutters>
              <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                <BlockIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary={browser.i18n.getMessage(
                  "FilterNameWithCount_Blocked",
                  [blockedFilterCount, title?.toLocaleLowerCase()],
                )}
                primaryTypographyProps={{ variant: "subtitle1" }}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary={browser.i18n.getMessage(
                  "FilterNameWithCount_Allowed",
                  [allowedFilterCount, title?.toLocaleLowerCase()],
                )}
                primaryTypographyProps={{ variant: "subtitle1" }}
              />
            </ListItem>
          </List>
        </Stack>
      </CardContent>
      <Divider variant="middle" />
      <CardActions>
        <Button color="primary" component={NavLink} to={link}>
          {browser.i18n.getMessage("ManageFilterText")}
        </Button>
      </CardActions>
    </Card>
  );
};

DashboardFilterCard.propTypes = {
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default DashboardFilterCard;
