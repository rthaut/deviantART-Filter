/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import { MTableEditField } from "@material-table/core";

import FilterTable from "../components/FilterTable";

const UsersFilterView = () => {
  const [usernameError, setUsernameError] = useState({
    error: false,
    helperText: "",
  });

  const columns = [
    {
      title: browser.i18n.getMessage("Filter_Users_PropTitle_Username"),
      field: "username",
      editComponent: (props) => (
        <MTableEditField
          {...props}
          error={usernameError.error}
          helperText={usernameError.helperText ?? ""}
        />
      ),
      required: true,
      pattern: {
        regex: /^[\w-]+$/,
        hint: browser.i18n.getMessage("Filter_Users_PropPatternHint_Username"),
      },
      setError: setUsernameError,
    },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FilterTable
          columns={columns}
          filterKey="users"
          title={browser.i18n.getMessage("FilterTitle_User")}
        />
      </Grid>
    </Grid>
  );
};

export default UsersFilterView;
