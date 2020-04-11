/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import { MTableEditField } from 'material-table';

import FilterTable from '../components/FilterTable';

class UsersFilterView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            'columns': [
                {
                    'title': 'Username',
                    'field': 'username',
                    'editComponent': props => (
                        // TODO: use a library, like react-text-mask, to enforce pattern and/or show validity?
                        <MTableEditField {...props} inputProps={{ 'pattern': '[\\w\\-]+', 'required': true }} />
                    ),
                }
            ]
        };
    }

    render() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FilterTable columns={this.state.columns} filterKey='users' title='Filtered Users' />
                </Grid>
            </Grid>
        );
    }

}

export default UsersFilterView;
