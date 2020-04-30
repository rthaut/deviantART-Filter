/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
/* eslint-disable no-async-promise-executor */
import React, { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MaterialTable, { MTableEditRow } from 'material-table';
import { useSnackbar } from 'notistack';

import { isEqual } from 'lodash';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@material-ui/core';

import {
    AddBox,
    ArrowDownward,
    Check,
    ChevronLeft,
    ChevronRight,
    Clear,
    DeleteOutline,
    DeleteSweep,
    Edit,
    FilterList,
    FirstPage,
    LastPage,
    Remove,
    SaveAlt,
    Search,
    ViewColumn,
} from '@material-ui/icons';

import {
    ADD_FILTER,
    REMOVE_FILTER,
    SAVE_FILTER,
    UPDATE_FILTER,
    VALIDATE_NEW_FILTER,
    VALIDATE_UPDATED_FILTER,
} from '../../constants/messages';

const tableIcons = {
    'Add': forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    'Check': forwardRef((props, ref) => <Check {...props} ref={ref} />),
    'Clear': forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    'Delete': forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    'DeleteSweep': forwardRef((props, ref) => <DeleteSweep {...props} ref={ref} />),
    'DetailPanel': forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    'Edit': forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    'Export': forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    'Filter': forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    'FirstPage': forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    'LastPage': forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    'NextPage': forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    'PreviousPage': forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    'ResetSearch': forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    'Search': forwardRef((props, ref) => <Search {...props} ref={ref} />),
    'SortArrow': forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    'ThirdStateCheck': forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    'ViewColumn': forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

const errorTheme = createMuiTheme({
    'palette': {
        'primary': red,
    },
});

const FilterTable = ({ filterKey, columns, title, ...props }) => {

    const { enqueueSnackbar } = useSnackbar();

    const onStorageChanged = (changes, areaName) => {
        console.time('onStorageChanged()');
        if (areaName === 'local' && Object.keys(changes).includes(filterKey)) {
            setData(changes[filterKey].newValue);
        }
        console.timeEnd('onStorageChanged()');
    };

    useEffect(() => {
        if (!browser.storage.onChanged.hasListener(onStorageChanged)) {
            browser.storage.onChanged.addListener(onStorageChanged);
        }

        return () => {
            if (browser.storage.onChanged.hasListener(onStorageChanged)) {
                browser.storage.onChanged.removeListener(onStorageChanged);
            }
        };
    }, []);

    const loadData = async () => {
        const storageData = await browser.storage.local.get(filterKey);
        setData(Array.from(storageData[filterKey] ?? []));
    };

    const [data, setData] = useState([]);
    useEffect(() => {
        loadData();
    }, [filterKey]);

    const sendFilterMessage = async (action, value) => {
        console.time(`sendFilterMessage(${action})`);
        const response = await browser.runtime.sendMessage({
            action,
            'data': {
                'key': filterKey,
                value
            }
        });
        console.timeEnd(`sendFilterMessage(${action})`);
        return response;
    };

    const [confirmation, setConfirmation] = useState('');

    const confirmReset = () => {
        setConfirmation(browser.i18n.getMessage('ConfirmAllFiltersDeletePrompt', [data.length, title.toLowerCase()]));
    };

    const resetFilter = async () => {
        await sendFilterMessage(SAVE_FILTER, []);
        setData([]);
        setConfirmation('');
    };

    const closeConfirmation = () => {
        setConfirmation('');
    };

    const validateFilterProperties = filter => {
        for (const column of columns) {
            if (column.required) {
                if (filter[column.field] === undefined || !filter[column.field].length) {
                    column.setError?.({
                        'error': true,
                        'helperText': browser.i18n.getMessage('RequiredFieldLabel', [column.title])
                    });
                    return false;
                }
            }

            if (column.pattern) {
                if (!column.pattern?.regex?.test?.(filter[column.field])) {
                    column.setError?.({
                        'error': true,
                        'helperText': column.pattern?.hint ? browser.i18n.getMessage('InvalidFieldLabelWithHint', [column.pattern.hint]) : browser.i18n.getMessage('InvalidFieldLabel')
                    });
                    return false;
                }
            }

            column.setError?.({
                'error': false,
                'helperText': ''
            });
        }

        return true;
    };

    const validateFilter = async (action, value) => {
        const validation = await sendFilterMessage(action, value);
        if (!validation.isValid) {
            enqueueSnackbar(validation.message, {
                'variant': 'error',
                'preventDuplicate': true,
                'anchorOrigin': {
                    'vertical': 'top',
                    'horizontal': 'center',
                },
            });
            return false;
        }

        return true;
    };

    const validateNewFilter = async (newFilter) => {
        if (!validateFilterProperties(newFilter)) {
            return false;
        }

        return await validateFilter(VALIDATE_NEW_FILTER, newFilter);
    };

    const validateUpdatedFilter = async (newFilter, oldFilter) => {
        if (!validateFilterProperties(newFilter)) {
            return false;
        }

        return await validateFilter(VALIDATE_UPDATED_FILTER, { 'new': newFilter, 'old': oldFilter });
    };

    const stripTableData = ({ tableData, ...data }) => data;

    return (
        <>
            <MaterialTable {...props}
                title={browser.i18n.getMessage('FilterNameWithCount', [data.length, title])}
                icons={tableIcons}
                columns={columns}
                data={data}
                options={{
                    'draggable': false,
                    'pageSize': 10,
                    'pageSizeOptions': [10, 25, 50, 100],
                    'addRowPosition': 'first'
                }}
                editable={{
                    'onRowAdd': (newData) => new Promise(async (resolve, reject) => {
                        const newFilterData = stripTableData(newData);

                        const isValid = await validateNewFilter(newFilterData);
                        if (!isValid) {
                            reject();
                            return;
                        }

                        return sendFilterMessage(ADD_FILTER, newFilterData).then(resolve, reject);
                    }),
                    'onRowDelete': (oldData) => new Promise((resolve, reject) => {
                        const oldFilterData = stripTableData(oldData);

                        return sendFilterMessage(REMOVE_FILTER, oldFilterData).then(resolve, reject);
                    }),
                    'onRowUpdate': (newData, oldData) => new Promise(async (resolve, reject) => {
                        const newFilterData = stripTableData(newData);
                        const oldFilterData = stripTableData(oldData);

                        if (isEqual(oldFilterData, newFilterData)) {
                            resolve();
                            return;
                        }

                        const isValid = await validateUpdatedFilter(newFilterData, oldFilterData);
                        if (!isValid) {
                            reject();
                            return;
                        }

                        const value = {
                            'old': oldFilterData,
                            'new': newFilterData
                        };

                        return sendFilterMessage(UPDATE_FILTER, value).then(resolve, reject);
                    })
                }}
                actions={[
                    {
                        'icon': tableIcons.DeleteSweep,
                        'tooltip': browser.i18n.getMessage('DeleteAllFiltersButtonTooltip'),
                        'onClick': () => confirmReset(data),
                        'isFreeAction': true,
                        'disabled': data.length < 2
                    }
                ]}
                components={{
                    'EditRow': ({onEditingApproved, onEditingCanceled, ...props}) => {
                        return (
                            <MTableEditRow {...props}
                                onEditingApproved={(mode, newData, oldData) => {
                                    columns.forEach(column => column.setError?.({
                                        'error': false,
                                        'helperText': ''
                                    }));
                                    onEditingApproved(mode, newData, oldData);
                                }}
                                onEditingCanceled={(mode, rowData) => {
                                    columns.forEach(column => column.setError?.({
                                        'error': false,
                                        'helperText': ''
                                    }));
                                    onEditingCanceled(mode, rowData);
                                }}
                            />
                        );
                    }
                }}
            />
            <Dialog open={(confirmation?.length > 1)} onClose={closeConfirmation}>
                <DialogTitle>{browser.i18n.getMessage('ConfirmAllFiltersDeleteTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmation}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmation} color="primary" variant="contained" autoFocus>
                        {browser.i18n.getMessage('ConfirmAllFiltersDeleteButton_Decline')}
                    </Button>
                    <ThemeProvider theme={errorTheme}>
                        <Button onClick={resetFilter} color="primary" variant="outlined">
                        {browser.i18n.getMessage('ConfirmAllFiltersDeleteButton_Accept')}
                        </Button>
                    </ThemeProvider>
                </DialogActions>
            </Dialog>
        </>
    );

};

FilterTable.propTypes = {
    'filterKey': PropTypes.string.isRequired,
    'columns': PropTypes.array.isRequired,
    'title': PropTypes.string.isRequired,
};

export default FilterTable;
