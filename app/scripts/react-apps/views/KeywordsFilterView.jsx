/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Grid, Chip } from "@mui/material";
import { MTableEditField } from "@material-table/core";

import FilterTable from "../components/FilterTable";

const KeywordsFilterView = () => {
  const [keywordError, setKeywordError] = useState({
    error: false,
    helperText: "",
  });

  const columns = [
    {
      title: browser.i18n.getMessage("Filter_Keywords_PropTitle_Keyword"),
      field: "keyword",
      editComponent: (props) => (
        <MTableEditField
          {...props}
          error={keywordError.error}
          helperText={keywordError.helperText ?? ""}
        />
      ),
      required: true,
      pattern: {
        regex: /^[a-zA-Z0-9]+\S*$/,
        hint: browser.i18n.getMessage(
          "Filter_Keywords_PropPatternHint_Keyword",
        ),
      },
      setError: setKeywordError,
    },
    {
      title: browser.i18n.getMessage("Filter_Keywords_PropTitle_Wildcard"),
      field: "wildcard",
      type: "boolean",
      editComponent: (props) => <MTableEditField {...props} color="primary" />,
      render: (rowData) => (
        <Chip
          size="small"
          variant={rowData.wildcard ? "default" : "outlined"}
          label={rowData.wildcard ? "Yes" : "No"}
        />
      ),
    },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FilterTable
          columns={columns}
          filterKey="keywords"
          title={browser.i18n.getMessage("FilterTitle_Keyword")}
        />
      </Grid>
    </Grid>
  );
};

export default KeywordsFilterView;
