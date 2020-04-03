import React from 'react';
import { Grid } from '@material-ui/core';
import FilterTable from '../components/FilterTable';

const UsersFilterView = () => {
    const columns = [
        {
            'title': 'Username',
            'field': 'username'
        }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <FilterTable columns={columns} filterKey='users' title='Filtered Users' />
            </Grid>
        </Grid>
    );
};

export default UsersFilterView;
