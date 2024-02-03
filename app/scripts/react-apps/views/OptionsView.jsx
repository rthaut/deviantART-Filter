import React from "react";
import { Grid } from "@mui/material";

import OptionsCard from "../components/OptionsCard";

const OptionsView = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <OptionsCard />
      </Grid>
    </Grid>
  );
};

export default OptionsView;
