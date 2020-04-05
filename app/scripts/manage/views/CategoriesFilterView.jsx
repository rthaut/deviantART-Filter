/* eslint-disable react/prop-types */
import React from 'react';
import {
    Grid,
} from '@material-ui/core';
import FilterTable from '../components/FilterTable';
import VirtualizedAutoComplete from '../components/VirtualizedAutoComplete';

class CategoriesFilterView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            'columns': [
                {
                    'title': 'Category Name',
                    'field': 'path',
                    'editComponent': props => (
                        <VirtualizedAutoComplete
                            // TODO: this should use the background script to fetch categories via the API
                            options={require('../../../data/categories.json')}
                            label="Select a Category"
                            noOptionsText="No matching categories"
                            value={props.value}
                            onChange={props.onChange}
                            autoHighlight
                            disableListWrap
                            filterSelectedOptions
                            size="small"
                        />
                    )
                }
            ]
        };
    }

    render() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FilterTable columns={this.state.columns} filterKey='categories' title='Filtered Categories' />
                </Grid>
            </Grid>
        );
    }

}

export default CategoriesFilterView;
