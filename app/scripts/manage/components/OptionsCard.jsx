import React, { useState } from 'react';
import {
    Typography,
    Divider,
    Card,
    CardContent,
    CardActions,
    Button,
    FormGroup,
    FormControl,
    FormControlLabel,
    Switch,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import useExtensionStorage from '../hooks/useExtensionStorage';

import { PAGES } from '../../constants/url';

const initialOptions = {
    'pages': Object.fromEntries(
        Object.keys(PAGES).map(page => [page, true])
    )
};

const OptionsCard = () => {
    const [alerts, setAlerts] = useState({
        'pages': false
    });

    const [options, setOptions] = useExtensionStorage({
        'type': 'local',
        'key': 'options',
        'initialValue': initialOptions
    });

    const resetOptions = e => {
        // TODO: this needs to have a confirmation (or remove the functionality altogether)
        setOptions(initialOptions);
    };

    const togglePageEnabled = event => {
        setOptions({
            ...options,
            'pages': {
                ...options.pages,
                [event.target.name]: event.target.checked
            }
        });
        setAlerts({
            ...alerts,
            'pages': true
        });
    };

    return (
        <Card>
            <CardContent>
                <Typography component="h2" variant="h6" gutterBottom>
                    Options {/* TODO: i18n */}
                </Typography>
                {options?.pages && <FormControl component="fieldset">
                    <Typography component="legend" variant="subtitle1">Enabled Pages</Typography> {/* TODO: i18n */}
                    <Typography component="p" variant="body2" color="textSecondary" gutterBottom>Enable or disable DeviantArt Filter on certain pages.</Typography> {/* TODO: i18n */}
                    <FormGroup>
                        {Object.keys(options?.pages).map((key, index) => (
                            <FormControlLabel
                                key={index}
                                label={key} // TODO: i18n (key will be part of message name, ex: PageName_Forums)
                                control={
                                    <Switch
                                        color="primary"
                                        checked={options?.pages[key]}
                                        onChange={togglePageEnabled} name={key}
                                    />
                                }
                            />
                        ))}
                    </FormGroup>
                    {alerts?.pages && <Alert severity="info"><strong>Note:</strong> Changes are saved immediately, but open pages must be refreshed/reloaded for changes to take effect.</Alert>} {/* TODO: i18n */}
                </FormControl>}
            </CardContent>
            <Divider variant="middle" />
            <CardActions>
                <Button color="primary" onClick={resetOptions}>
                    Reset to Defaults {/* TODO: i18n */}
                </Button>
            </CardActions>
        </Card>
    );
};

export default OptionsCard;
