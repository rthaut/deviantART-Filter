import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

import DashboardFilterCard from "../components/DashboardFilterCard";
import FiltersExportButton from "../components/FiltersExportButton";
import FiltersImporter from "../components/FiltersImporter";
import OptionsCard from "../components/OptionsCard";

const DashboardView = () => {
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
              sx={{ marginBottom: 2 }}
            >
              {browser.i18n.getMessage("ExportHelpText")}
            </Typography>
            <FiltersExportButton />
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
