import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

import FiltersExportButton from "../components/FiltersExportButton";
import FiltersImporter from "../components/FiltersImporter";

const ImportExportView = () => {
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
            <Typography component="p" variant="body2" color="textSecondary">
              {browser.i18n.getMessage("ExportHelpText")}
            </Typography>
            <FiltersExportButton />
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
