import React from "react";
import PropTypes from "prop-types";

import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

export const Processing = ({ text, color = "inherit", ...props }) => {
  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      <Grid item>
        <CircularProgress color={color} size={24} />
      </Grid>
      <Grid item>
        <Typography component="p" variant="subtitle1">
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
};

Processing.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
};

const ImportFilterResultsTable = ({ results }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              {browser.i18n.getMessage("ImportResultsColumnHeader_FileName")}
            </TableCell>
            <TableCell>
              {browser.i18n.getMessage("ImportResultsColumnHeader_FilterKey")}
            </TableCell>
            <TableCell align="right">
              {browser.i18n.getMessage("ImportResultsColumnHeader_TotalCount")}
            </TableCell>
            <TableCell align="right">
              {browser.i18n.getMessage("ImportResultsColumnHeader_NewCount")}
            </TableCell>
            <TableCell align="right">
              {browser.i18n.getMessage(
                "ImportResultsColumnHeader_DuplicateCount",
              )}
            </TableCell>
            <TableCell align="right">
              {browser.i18n.getMessage(
                "ImportResultsColumnHeader_InvalidCount",
              )}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <TableCell
                  variant="head"
                  rowSpan={
                    result.results ? Object.keys(result.results).length + 1 : 2
                  }
                >
                  {result.file.path}
                </TableCell>
              </TableRow>
              {result.results ? (
                Object.keys(result.results).map((filterKey, index) => (
                  <TableRow key={index}>
                    <TableCell variant="head">
                      {browser.i18n.getMessage(
                        `FilterTitle_${filterKey}_Plural`,
                      )}
                    </TableCell>
                    {result.results[filterKey].error ? (
                      <TableCell align="center" colSpan={3}>
                        <Typography color="error">
                          {result.results[filterKey].error}
                        </Typography>
                      </TableCell>
                    ) : (
                      <>
                        <TableCell align="right">
                          {result.results[filterKey].total}
                        </TableCell>
                        <TableCell align="right">
                          {result.results[filterKey].new}
                        </TableCell>
                        <TableCell align="right">
                          {result.results[filterKey].duplicate}
                        </TableCell>
                        <TableCell align="right">
                          {result.results[filterKey].invalid}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Processing
                      text={browser.i18n.getMessage(
                        "ImportResultsProcessingMessage",
                      )}
                    />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

ImportFilterResultsTable.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ImportFilterResultsTable;
