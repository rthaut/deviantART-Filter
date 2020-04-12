import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { EXPORT_FILTERS } from '../../constants/messages';

import FiltersImporter from '../components/FiltersImporter';

const useStyles = makeStyles((theme) => ({
    'helpText': {
        'marginBottom': theme.spacing(4),
    }
}));

const ImportExportView = () => {
    const classes = useStyles();

    const exportFilters = async () => {
        const data = await browser.runtime.sendMessage({
            'action': EXPORT_FILTERS
        });
        const dataObj = new Blob([JSON.stringify(data)], { 'type': 'application/json' });
        const dataObjURL = URL.createObjectURL(dataObj);

        const date = new Date();
        const filename = browser.i18n.getMessage('ExtensionName').replace(' ', '_');

        const link = document.createElement('a');
        link.href = dataObjURL;
        link.download = `${filename}-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.json`;
        link.dispatchEvent(new MouseEvent('click'));
    };

    return (
        <Grid container spacing={3}>
            <Grid item md={12} lg={3}>
                <Card>
                    <CardContent>
                        <Typography component="h2" variant="h6" color="textSecondary" gutterBottom>
                            {browser.i18n.getMessage('ExportHeading')}
                        </Typography>
                        <Typography component="p" variant="body2" color="textSecondary" className={classes.helpText}>
                            {browser.i18n.getMessage('ExportHelpText')}
                        </Typography>
                        <Button variant="contained" color="primary" onClick={exportFilters}>{browser.i18n.getMessage('ExportButtonLabel')}</Button>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item md={12} lg={9}>
                <Card>
                    <CardContent>
                        <Typography component="h2" variant="h6" color="textSecondary" gutterBottom>
                            {browser.i18n.getMessage('ImportHeading')}
                        </Typography>
                        <FiltersImporter />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default ImportExportView;
