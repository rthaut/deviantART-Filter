import React from 'react';
import { Grid } from '@material-ui/core';
import FilterTable from '../components/FilterTable';

const CategoriesFilterView = () => {
    const columns = [
        {
            'title': 'Category Name',
            'field': 'path'
        }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <FilterTable columns={columns} filterKey='categories' title='Filtered Categories' />
            </Grid>
        </Grid>
    );
};
export default CategoriesFilterView;
