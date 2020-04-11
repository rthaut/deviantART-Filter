/* eslint-disable react/display-name */
import React, { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MaterialTable from 'material-table';

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

import { ADD_FILTER, REMOVE_FILTER, SAVE_FILTER, UPDATE_FILTER } from '../../constants/messages';

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

const FilterTable = ({ filterKey, columns, ...rest }) => {

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
        console.time('sendFilterMessage()');
        await browser.runtime.sendMessage({
            action,
            'data': {
                'key': filterKey,
                value
            }
        });
        console.timeEnd('sendFilterMessage()');
    };

    const [confirmation, setConfirmation] = useState('');

    const confirmReset = () => {
        setConfirmation(`Are you sure you want to delete all ${data.length} of your ${filterKey} filters?`);
    };

    const resetFilter = async () => {
        await sendFilterMessage(SAVE_FILTER, []);
        setData([]);
        setConfirmation('');
    };

    const closeConfirmation = () => {
        setConfirmation('');
    };

    const stripTableData = ({ tableData, ...data }) => data;

    return (
        <>
            <MaterialTable
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
                    'onRowAdd': (newData) => new Promise((resolve, reject) => {
                        const newFilterData = stripTableData(newData);

                        sendFilterMessage(ADD_FILTER, newFilterData).then(resolve, reject);
                    }),
                    'onRowDelete': (oldData) => new Promise((resolve, reject) => {
                        const oldFilterData = stripTableData(oldData);

                        sendFilterMessage(REMOVE_FILTER, oldFilterData).then(resolve, reject);
                    }),
                    'onRowUpdate': (newData, oldData) => new Promise((resolve, reject) => {
                        const newFilterData = stripTableData(newData);
                        const oldFilterData = stripTableData(oldData);

                        const value = {
                            'old': oldFilterData,
                            'new': newFilterData
                        };

                        sendFilterMessage(UPDATE_FILTER, value).then(resolve, reject);
                    })
                }}
                actions={[
                    {
                        'icon': tableIcons.DeleteSweep,
                        'tooltip': 'Delete All',
                        'onClick': () => confirmReset(data),
                        'isFreeAction': true,
                        'disabled': data.length < 2
                    }
                ]}
                {...rest}
            />
            <Dialog open={(confirmation?.length > 1)} onClose={closeConfirmation}>
                <DialogTitle>Confirm</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmation}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmation} color="primary" variant="contained" autoFocus>
                        No
                    </Button>
                    <ThemeProvider theme={errorTheme}>
                        <Button onClick={resetFilter} color="primary" variant="outlined">
                            Yes
                        </Button>
                    </ThemeProvider>
                </DialogActions>
            </Dialog>
        </>
    );

};

FilterTable.propTypes = {
    'filterKey': PropTypes.string,
    'columns': PropTypes.array
};

export default FilterTable;
