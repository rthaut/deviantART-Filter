import React from 'react';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';

import {
    makeStyles,
} from '@material-ui/core/styles';

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
    Select,
    MenuItem,
} from '@material-ui/core';

import useExtensionStorage from '../hooks/useExtensionStorage';

import { PAGES } from '../../constants/url';

const initialOptions = {
    'pages': Object.keys(PAGES).map(page => [page, true]).reduce((acc, val) => (acc[val[0]] = val[1], acc), {}),
    'showUpdatedPageOnUpdate': 'patch'
};

const useStyles = makeStyles((theme) => ({
    'fieldset': {
        'width': '100%',
        'margin': theme.spacing(1, 0, 2),
    },
    'legend': {
        'padding': theme.spacing(0),
    },
}));

const OptionsCard = () => {
    const classes = useStyles();

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

    const handleUpdatePageChange = event => {
        setOptions({
            ...options,
            'showUpdatedPageOnUpdate': event.target.value
        });
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

                {options?.pages && <FormControl component='fieldset' className={classes.fieldset}>
                    <Typography component='legend' className={classes.legend}>{browser.i18n.getMessage('Options_EnabledPages_Header')}</Typography>
                    <Typography component='p' variant='body2' color='textSecondary' gutterBottom>{browser.i18n.getMessage('Options_EnabledPages_HelpText')}</Typography>
                    <FormGroup>
                        {Object.keys(options?.pages).map((key, index) => (
                            <FormControlLabel
                                key={index}
                                label={browser.i18n.getMessage(`Options_EnabledPages_PageLabel_${key}`)}
                                control={
                                    <Switch
                                        name={key}
                                        color='primary'
                                        checked={options?.pages[key]}
                                        onChange={togglePageEnabled}
                                    />
                                }
                            />
                        ))}
                    </FormGroup>
                </FormControl>}

                {options?.showUpdatedPageOnUpdate && <FormControl component='fieldset' className={classes.fieldset} variant='outlined' size='small'>
                    <Typography component='legend' className={classes.legend}>{browser.i18n.getMessage('Options_ShowUpdatedPage_Header')}</Typography>
                    <Typography component='p' variant='body2' color='textSecondary' gutterBottom>{browser.i18n.getMessage('Options_ShowUpdatedPage_HelpText')}</Typography>
                    <Select value={options?.showUpdatedPageOnUpdate} onChange={handleUpdatePageChange}>
                        {['patch', 'minor', 'major', 'none'].map((key, index) => (
                            <MenuItem key={index} value={key}>{browser.i18n.getMessage(`Options_ShowUpdatedPage_OptionLabel_${key}`)}</MenuItem>
                        ))}
                    </Select>
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
