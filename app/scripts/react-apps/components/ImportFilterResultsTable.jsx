import React from "react";
import PropTypes from "prop-types";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";

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
              {browser.i18n.getMessage("ImportResultsColumnHeader_FilterType")}
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
              <TableRow key={index}>
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
                Object.keys(result.results).map((key, index) => (
                  <TableRow key={index}>
                    <TableCell variant="head">{key}</TableCell>
                    {result.results[key].error ? (
                      <TableCell align="center" colSpan={3}>
                        <Typography color="error">
                          {result.results[key].error}
                        </Typography>
                      </TableCell>
                    ) : (
                      <>
                        <TableCell align="right">
                          {result.results[key].total}
                        </TableCell>
                        <TableCell align="right">
                          {result.results[key].new}
                        </TableCell>
                        <TableCell align="right">
                          {result.results[key].duplicate}
                        </TableCell>
                        <TableCell align="right">
                          {result.results[key].invalid}
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
