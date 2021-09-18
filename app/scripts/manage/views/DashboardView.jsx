import React from "react";
import { Grid, Card, CardContent, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import DashboardFilterCard from "../components/DashboardFilterCard";
import FiltersExportButton from "../components/FiltersExportButton";
import FiltersImporter from "../components/FiltersImporter";
import OptionsCard from "../components/OptionsCard";

const useStyles = makeStyles((theme) => ({
  helpText: {
    marginBottom: theme.spacing(4),
  },
}));

const DashboardView = () => {
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <DashboardFilterCard
          filterKey="users"
          title={browser.i18n.getMessage("FilterTitle_User")}
          link="/users"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DashboardFilterCard
          filterKey="keywords"
          title={browser.i18n.getMessage("FilterTitle_Keyword")}
          link="/keywords"
        />
      </Grid>
      <Grid item xs={12} md={4} lg={3}>
        <Card>
          <CardContent>
            <Typography component="h2" variant="h6" gutterBottom>
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
            <FiltersExportButton variant="contained" color="secondary">
              {browser.i18n.getMessage("ExportButtonLabel")}
            </FiltersExportButton>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8} lg={9}>
        <Card>
          <CardContent>
            <Typography component="h2" variant="h6" gutterBottom>
              {browser.i18n.getMessage("ImportHeading")}
            </Typography>
            <FiltersImporter />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8} lg={6}>
        <OptionsCard />
      </Grid>
    </Grid>
  );
};

export default DashboardView;
