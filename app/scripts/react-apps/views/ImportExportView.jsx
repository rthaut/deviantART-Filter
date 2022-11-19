import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import FiltersExportButton from "../components/FiltersExportButton";
import FiltersImporter from "../components/FiltersImporter";

const useStyles = makeStyles((theme) => ({
  helpText: {
    marginBottom: theme.spacing(4),
  },
}));

const ImportExportView = () => {
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      <Grid item md={12} lg={3}>
        <Card>
          <CardContent>
            <Typography
              component="h2"
              variant="h6"
              color="textSecondary"
              gutterBottom
            >
              {browser.i18n.getMessage("ExportHeading")}
            </Typography>
            <Typography
              component="p"
              variant="body2"
              color="textSecondary"
              className={classes.helpText}
            >
              {browser.i18n.getMessage("ExportHelpText")}
            </Typography>
            <FiltersExportButton variant="contained" color="primary">
              {browser.i18n.getMessage("ExportButtonLabel")}
            </FiltersExportButton>
          </CardContent>
        </Card>
      </Grid>
      <Grid item md={12} lg={9}>
        <Card>
          <CardContent>
            <Typography
              component="h2"
              variant="h6"
              color="textSecondary"
              gutterBottom
            >
              {browser.i18n.getMessage("ImportHeading")}
            </Typography>
            <FiltersImporter />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ImportExportView;
