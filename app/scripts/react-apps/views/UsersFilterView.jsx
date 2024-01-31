import React from "react";
import PropTypes from "prop-types";

import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";

import { STORAGE_KEY as filterKey } from "../../filters/users";

import FilterDataGrid from "../components/filters/FilterDataGrid";

const columns = [
  {
    field: "username",
    headerName: browser.i18n.getMessage("Filter_Users_PropTitle_Username"),
    type: "string",
    flex: 1,
  },
];

const FilterDialogFormContent = ({ filter }) => (
  <>
    <FormControl variant="standard" margin="dense" fullWidth required>
      <InputLabel htmlFor="username">
        {browser.i18n.getMessage("Filter_Users_PropTitle_Username")}
      </InputLabel>
      <Input
        autoFocus
        id="username"
        name="username"
        type="text"
        defaultValue={filter?.["username"]}
      />
      <FormHelperText>
        {browser.i18n.getMessage("Filter_Users_PropFieldHint_Username")}
      </FormHelperText>
    </FormControl>
  </>
);

FilterDialogFormContent.propTypes = {
  filter: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }),
};

const UsersFilterView = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FilterDataGrid
          columns={columns}
          filterKey={filterKey}
          rowIdPropName="username"
          title={browser.i18n.getMessage("FilterTitle_User")}
          filterDialogFormFields={FilterDialogFormContent}
        />
      </Grid>
    </Grid>
  );
};

export default UsersFilterView;
