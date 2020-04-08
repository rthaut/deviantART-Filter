import React from 'react';
import PropTypes from 'prop-types';
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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    'resultsTable': {
        '& .MuiTableCell-head': {
            'fontWeight': theme.typography.fontWeightBold
        }
    }
}));

export const Processing = ({ text, color = 'inherit', ...props }) => {
    return (
        <Grid container spacing={2} direction="row" justify="center" alignItems="center" {...props}>
            <Grid item>
                <CircularProgress color={color} size={24} />
            </Grid>
            <Grid item>
                <Typography component="p" variant="subtitle1">{text}</Typography>
            </Grid>
        </Grid>
    );
};

Processing.propTypes = {
    'text': PropTypes.string,
    'color': PropTypes.string,
};

const ImportFilterResultsTable = ({ results }) => {
    const classes = useStyles();

    return (
        <TableContainer>
            <Table className={classes.resultsTable}>
                <TableHead>
                    <TableRow>
                        <TableCell>File Name</TableCell>
                        <TableCell>Filter Type</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">New</TableCell>
                        <TableCell align="right">Duplicates</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {results.map((result, index) => (<React.Fragment key={index}>
                        <TableRow key={index}>
                            <TableCell variant="head" rowSpan={result.results ? Object.keys(result.results).length + 1 : 2}>{result.file.path}</TableCell>
                        </TableRow>
                        {result.results ? Object.keys(result.results).map((key, index) => (<TableRow key={index}>
                            <TableCell variant="head">{key}</TableCell>
                            <TableCell align="right">{result.results[key].total}</TableCell>
                            <TableCell align="right">{result.results[key].new}</TableCell>
                            <TableCell align="right">{result.results[key].duplicate}</TableCell>
                        </TableRow>)) : (<TableRow>
                            <TableCell colSpan={4}>
                                <Processing text="Processing..." />
                            </TableCell>
                        </TableRow>)}
                    </React.Fragment>))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

ImportFilterResultsTable.propTypes = {
    'results': PropTypes.arrayOf(PropTypes.object),
};

export default ImportFilterResultsTable;
