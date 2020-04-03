import React from 'react';
import { Grid } from '@material-ui/core';
import FilterTable from '../components/FilterTable';

const KeywordsFilterView = () => {
    const columns = [
        {
            'title': 'Keyword',
            'field': 'keyword'
        },
        {
            'title': 'Is Wildcard',
            'field': 'wildcard',
            'type': 'boolean'
        }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <FilterTable columns={columns} filterKey='keywords' title='Filtered Keywords' />
            </Grid>
        </Grid>
    );
};

export default KeywordsFilterView;
