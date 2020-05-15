import React, { useEffect, useState } from 'react';

import {
    createMuiTheme,
    ThemeProvider,
} from '@material-ui/core/styles';
import {
    deepOrange,
    grey,
} from '@material-ui/core/colors';

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Typography,
    Button,
    Grid,
} from '@material-ui/core';

import {
    Alert,
    AlertTitle
} from '@material-ui/lab';

import {
    FETCH_METADATA,
    IMPORT_FILTERS,
    SHOW_FILTER_DEVIATION_MODAL,
    HIDE_FILTER_DEVIATION_MODAL,
} from '../constants/messages';

import MetadataFiltersForm from './components/MetadataFiltersForm';
import MetadataFiltersResults from './components/MetadataFiltersResults';

const initialFilters = {
    'users': [],
    'keywords': [],
    'categories': [],
};

const theme = createMuiTheme({
    'palette': {
        'primary': deepOrange,
        'secondary': grey,
    },
});

const CreateFiltersApp = () => {

    const [error, setError] = useState({
        'help': '',
        'error': ''
    });

    const [metadata, setMetadata] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [results, setResults] = useState(null);

    const [title, setTitle] = useState('Create Filters from Deviation'); // TODO: i18n
    const [working, setWorking] = useState(false);

    const onRuntimeMessage = (message) => {
        switch (message.action) {
            case SHOW_FILTER_DEVIATION_MODAL:
                loadMetadata(message.data.link);
                break;
        }
    };

    useEffect(() => {
        if (!browser.runtime.onMessage.hasListener(onRuntimeMessage)) {
            browser.runtime.onMessage.addListener(onRuntimeMessage);
        }

        return () => {
            if (browser.runtime.onMessage.hasListener(onRuntimeMessage)) {
                browser.runtime.onMessage.removeListener(onRuntimeMessage);
            }
        };
    }, []);

    const setFilter = (name, value) => {
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const reset = () => {
        setFilters(initialFilters);
        setResults(null);

        if (metadata?.title) {
            setTitle(`Create Filters for Deviation "<em>${metadata.title}</em>"`); // TODO: i18n
        } else {
            setTitle('Create Filters for Deviation'); // TODO: i18n
        }
    };

    useEffect(() => {
        reset();
    }, [metadata]);

    const closeModal = () => {
        browser.runtime.sendMessage({
            'action': HIDE_FILTER_DEVIATION_MODAL
        });
        reset();
    };

    const mapCount = (obj, property) => Object.values(obj).reduce((prev, cur) => prev += cur[property], 0);

    const loadMetadata = async (url) => {
        setWorking(true);

        try {
            const _metadata = await browser.runtime.sendMessage({
                'action': FETCH_METADATA,
                'data': {
                    url
                }
            });
            setMetadata(_metadata);
        } catch (error) {
            setError({
                'help': 'An error occurred while retrieving deviation metadata. Please try again.', // TODO: i18n
                error
            });
            setMetadata(null);
        }

        setWorking(false);
    };

    const createFilters = async () => {
        setWorking(true);

        try {
            const _results = await browser.runtime.sendMessage({
                'action': IMPORT_FILTERS,
                'data': filters
            });
            setResults(_results);

            const count = mapCount(_results, 'new');
            setTitle(`Created ${count} ${count === 1 ? 'Filter' : 'Filters'} Successfully`); // TODO: i18n
        } catch (error) {
            setError({
                'help': 'An error occurred while creating filters. Please try again.', // TODO: i18n
                error
            });
            setResults(null);
        }

        setWorking(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={true} onClose={closeModal}>

                <DialogTitle disableTypography>
                    <Typography variant='h6' dangerouslySetInnerHTML={{ '__html': title }} />
                </DialogTitle>

                <DialogContent>

                    {error?.error && (<Alert severity='error'>
                        <AlertTitle><strong>{error.help}</strong></AlertTitle>
                        <Typography gutterBottom>
                            If the problem persists, please report it with the following information: {/* TODO: i18n */}
                            <code>{error.error.message}</code>
                        </Typography>
                    </Alert>)}

                    {working ?
                        <Grid container direction='column' justify='center' alignItems='center'><CircularProgress /></Grid> : results ?
                        <MetadataFiltersResults results={results} /> :
                        <MetadataFiltersForm metadata={metadata} setFilter={setFilter} />
                    }

                </DialogContent>

                <DialogActions>
                    {results ? (<>
                        <Button variant='contained' color='primary' onClick={closeModal}>Close</Button>{/* TODO: i18n */}
                    </>): (<>
                        <Button onClick={closeModal}>Cancel</Button>{/* TODO: i18n */}
                        <Button variant='contained' color='primary' onClick={createFilters} disabled={mapCount(filters, 'length') < 1}>Create Filters</Button>{/* TODO: i18n */}
                    </>)}
                </DialogActions>

            </Dialog>
        </ThemeProvider>
    );
};

export default CreateFiltersApp;
