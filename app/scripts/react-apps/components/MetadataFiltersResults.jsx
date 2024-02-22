import React from "react";
import PropTypes from "prop-types";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

const MetadataFiltersResults = ({ results }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              {browser.i18n.getMessage("ImportResultsColumnHeader_FilterType")}
            </TableCell>
            <TableCell align="center">
              {browser.i18n.getMessage("ImportResultsColumnHeader_NewCount")}
            </TableCell>
            <TableCell align="center">
              {browser.i18n.getMessage(
                "ImportResultsColumnHeader_DuplicateCount",
              )}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(results).map(([filterType, result]) => (
            <TableRow key={filterType}>
              <TableCell variant="head">
                {browser.i18n.getMessage(`FilterTitle_${filterType}`)}
              </TableCell>
              <TableCell align="center">{result.new}</TableCell>
              <TableCell align="center">{result.duplicate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

MetadataFiltersResults.propTypes = {
  results: PropTypes.object.isRequired,
};

export default MetadataFiltersResults;
