/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import VirtualizedAutoComplete from '../components/VirtualizedAutoComplete';

import FilterTable from '../components/FilterTable';

class CategoriesFilterView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            'columns': [
                {
                    'title': browser.i18n.getMessage('Filter_Categories_PropTitle_Name'),
                    'field': 'name',
                    'editComponent': props => (
                        <VirtualizedAutoComplete
                            options={require('../../../data/categories.json')}
                            label={browser.i18n.getMessage('CategoriesMenuLabel')}
                            noOptionsText={browser.i18n.getMessage('CategoriesMenuNoOptionsText')}
                            value={props.value}
                            onChange={props.onChange}
                            autoHighlight
                            disableListWrap
                            filterSelectedOptions
                            selectOnFocus
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
                    <FilterTable columns={this.state.columns} filterKey='categories' title={browser.i18n.getMessage('FilterTitle_Category')} />
                </Grid>
            </Grid>
        );
    }

}

export default CategoriesFilterView;
