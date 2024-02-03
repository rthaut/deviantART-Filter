import React from "react";
import PropTypes from "prop-types";

import { FilterDataProvider } from "../hooks/useFilterData";

import {
  ID_PROP_NAME as keywordsIdPropName,
  STORAGE_KEY as keywordsFilterKey,
} from "../../filters/keywords";

const KeywordFiltersDataProvider = ({ children }) => (
  <FilterDataProvider
    filterKey={keywordsFilterKey}
    idPropName={keywordsIdPropName}
  >
    {children}
  </FilterDataProvider>
);

KeywordFiltersDataProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export default KeywordFiltersDataProvider;
