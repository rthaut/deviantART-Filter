/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import { MTableEditField } from 'material-table';

import FilterTable from '../components/FilterTable';

class KeywordsFilterView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            'columns': [
                {
                    'title': 'Keyword',
                    'field': 'keyword',
                    'editComponent': props => (
                        // TODO: use a library, like react-text-mask, to enforce pattern and/or show validity?
                        <MTableEditField {...props} inputProps={{ 'pattern': '[a-zA-Z0-9]+\\S*', 'required': true }} />
                    ),
                },
                {
                    'title': 'Is Wildcard',
                    'field': 'wildcard',
                    'type': 'boolean',
                    'editComponent': props => (
                        <MTableEditField {...props} color="primary" />
                    ),
                }
            ]
        };
    }

    render() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FilterTable columns={this.state.columns} filterKey='keywords' title='Filtered Keywords' />
                </Grid>
            </Grid>
        );
    }

}

export default KeywordsFilterView;
