import React from "react";
import PropTypes from "prop-types";

import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";

import FilterDataGrid from "../components/filters/FilterDataGrid";
import KeywordFiltersDataProvider from "../contexts/keywordsFiltersDataProvider";

const FilterDialogFormContent = ({ filter }) => (
  <>
    <Stack
      direction="row"
      justifyContent="space-around"
      alignItems="center"
      spacing={2}
    >
      <FormControl
        variant="standard"
        margin="dense"
        sx={{ flexGrow: 1 }}
        required
      >
        <InputLabel htmlFor="keyword">
          {browser.i18n.getMessage("Filter_Keywords_PropTitle_Keyword")}
        </InputLabel>
        <Input
          autoFocus
          id="keyword"
          name="keyword"
          type="text"
          defaultValue={filter?.["keyword"]}
        />
        <FormHelperText>
          {browser.i18n.getMessage("Filter_Keywords_PropFieldHint_Keyword")}
        </FormHelperText>
      </FormControl>
      <FormControl
        variant="standard"
        margin="dense"
        sx={{ flexShrink: 1, flexWrap: "nowrap" }}
      >
        <FormControlLabel
          control={
            <Switch
              defaultChecked={Boolean(filter?.["wildcard"])}
              id="wildcard"
              name="wildcard"
            />
          }
          label={browser.i18n.getMessage("Filter_Keywords_PropTitle_Wildcard")}
        />
      </FormControl>
    </Stack>
  </>
);

FilterDialogFormContent.propTypes = {
  filter: PropTypes.shape({
    keyword: PropTypes.string.isRequired,
    wildcard: PropTypes.bool,
  }),
};

const columns = [
  {
    field: "keyword",
    headerName: browser.i18n.getMessage("Filter_Keywords_PropTitle_Keyword"),
    type: "string",
    flex: 1,
  },
  {
    field: "wildcard",
    headerName: browser.i18n.getMessage("Filter_Keywords_PropTitle_Wildcard"),
    type: "boolean",
    flex: 0,
    width: 180,
    valueGetter: ({ value }) => Boolean(value), // NOTE: ensures value isn't null for filtering
    renderCell: ({ row, value }) => (
      <Tooltip
        arrow
        placement="right"
        title={browser.i18n.getMessage(
          `Filter_Keywords_PropHint_Wildcard_${value ? "True" : "False"}`,
          [row.keyword],
        )}
      >
        <Chip
          size="small"
          variant={value ? "default" : "outlined"}
          label={browser.i18n.getMessage(
            `Filter_Keywords_Property_Wildcard_${value ? "True" : "False"}`,
          )}
        />
      </Tooltip>
    ),
  },
];

const KeywordsFilterView = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <KeywordFiltersDataProvider>
          <FilterDataGrid
            columns={columns}
            title={browser.i18n.getMessage("FilterTitle_Keyword")}
            filterDialogFormFields={FilterDialogFormContent}
          />
        </KeywordFiltersDataProvider>
      </Grid>
    </Grid>
  );
};

export default KeywordsFilterView;
