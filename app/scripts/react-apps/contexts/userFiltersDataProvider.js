import React from "react";
import PropTypes from "prop-types";

import { FilterDataProvider } from "../hooks/useFilterData";

import {
  ID_PROP_NAME as usersIdPropName,
  STORAGE_KEY as usersFilterKey,
} from "../../filters/users";

const UserFiltersDataProvider = ({ children }) => (
  <FilterDataProvider filterKey={usersFilterKey} idPropName={usersIdPropName}>
    {children}
  </FilterDataProvider>
);

UserFiltersDataProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export default UserFiltersDataProvider;
