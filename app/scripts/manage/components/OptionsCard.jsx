import React from 'react';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';

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

import useExtensionStorage from '../hooks/useExtensionStorage';

import { PAGES } from '../../constants/url';

const initialOptions = {
    'pages': Object.fromEntries(
        Object.keys(PAGES).map(page => [page, true])
    )
};

const OptionsCard = () => {

    const confirm = useConfirm();
    const { enqueueSnackbar } = useSnackbar();

    const [options, setOptions] = useExtensionStorage({
        'type': 'local',
        'key': 'options',
        'initialValue': initialOptions
    });

    const resetOptions = event => {
        confirm({
            'title': browser.i18n.getMessage('ConfirmOptionsResetTitle'),
            'description': browser.i18n.getMessage('ConfirmOptionsResetPrompt'),
            'confirmationText': browser.i18n.getMessage('ConfirmOptionsResetButton_Accept'),
            'cancellationText': browser.i18n.getMessage('ConfirmOptionsResetButton_Decline'),
        }).then(() => {
            setOptions(initialOptions);
            showReloadRequired();
        }).catch(() => {});
    };

    const togglePageEnabled = event => {
        setOptions({
            ...options,
            'pages': {
                ...options.pages,
                [event.target.name]: event.target.checked
            }
        });
        showReloadRequired();
    };

    const showReloadRequired = () => {
        enqueueSnackbar(browser.i18n.getMessage('OptionsChangePagesRequireReload'), {
            'variant': 'default',
            'preventDuplicate': true,
            'anchorOrigin': {
                'vertical': 'top',
                'horizontal': 'center',
            },
        });
    };

    return (
        <Card>
            <CardContent>
                <Typography component='h2' variant='h6' gutterBottom>{browser.i18n.getMessage('OptionsTitle')}</Typography>
                {options?.pages && <FormControl component='fieldset'>
                    <Typography component='legend' variant='subtitle1'>{browser.i18n.getMessage('Options_EnabledPages_Header')}</Typography>
                    <Typography component='p' variant='body2' color='textSecondary' gutterBottom>{browser.i18n.getMessage('Options_EnabledPages_HelpText')}</Typography>
                    <FormGroup>
                        {Object.keys(options?.pages).map((key, index) => (
                            <FormControlLabel
                                key={index}
                                label={browser.i18n.getMessage(`Options_EnabledPages_PageLabel_${key}`)}
                                control={
                                    <Switch
                                        color='primary'
                                        checked={options?.pages[key]}
                                        onChange={togglePageEnabled} name={key}
                                    />
                                }
                            />
                        ))}
                    </FormGroup>
                </FormControl>}
            </CardContent>
            <Divider variant='middle' />
            <CardActions>
                <Button color='primary' onClick={resetOptions}>{browser.i18n.getMessage('OptionsResetButtonLabel')}</Button>
            </CardActions>
        </Card>
    );
};

export default OptionsCard;
