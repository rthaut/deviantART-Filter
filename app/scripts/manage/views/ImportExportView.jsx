import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import FiltersImporter from '../components/FiltersImporter';

const useStyles = makeStyles((theme) => ({
    'helpText': {
        'marginBottom': theme.spacing(4),
    }
}));

const ImportExportView = () => {

    const classes = useStyles();

    return (
        <Grid container spacing={3}>
            <Grid item md={12} lg={3}>
                <Card>
                    <CardContent>
                        <Typography component="h2" variant="h6" color="textSecondary" gutterBottom>
                            Export Filters to File
                        </Typography>
                        <Typography component="p" variant="body2" color="textSecondary" className={classes.helpText}>
                            Use this to export all of your current filters to a file (for backup or migration purposes)
                        </Typography>
                        <Button variant="contained" color="primary">Export Filter Data</Button>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item md={12} lg={9}>
                <Card>
                    <CardContent>
                        <Typography component="h2" variant="h6" color="textSecondary" gutterBottom>
                            Import Filters from File(s)
                        </Typography>
                        <FiltersImporter />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default ImportExportView;
