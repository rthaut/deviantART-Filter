/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import VirtualizedAutoComplete from '../components/VirtualizedAutoComplete';
import FilterTable from '../components/FilterTable';
import { FETCH_CATEGORIES } from '../../constants/messages';

const ERROR_OPTION = browser.i18n.getMessage('CategoriesMenuErrorOption');

const CategoriesFilterView = () => {

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState('options', []);

    const [categoryNameError, setCategoryNameError] = useState({
        'error': false,
        'helperText': '',
    });

    useEffect(() => {
        const loadOptions = async () => {
            setLoading(true);
            try {
                const options = await browser.runtime.sendMessage({
                    'action': FETCH_CATEGORIES
                });
                setOptions(options);
            } catch (error) {
                console.error(error);
                setOptions([ERROR_OPTION]);
            }
            setLoading(false);
        };
        loadOptions();
    }, []);

    const columns = [
        {
            'title': browser.i18n.getMessage('Filter_Categories_PropTitle_Name'),
            'field': 'name',
            'editComponent': props => (
                <VirtualizedAutoComplete
                    options={options}
                    getOptionDisabled={(option) => option === ERROR_OPTION}
                    label={browser.i18n.getMessage('CategoriesMenuLabel')}
                    noOptionsText={browser.i18n.getMessage('CategoriesMenuNoOptionsText')}
                    value={props.value}
                    onChange={props.onChange}
                    autoHighlight
                    disableListWrap
                    filterSelectedOptions
                    selectOnFocus
                    size="small"
                    loading={loading}
                    error={categoryNameError.error}
                    helperText={categoryNameError.helperText ?? ''}
                />
            ),
            'required': true,
            'setError': setCategoryNameError,
        }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <FilterTable columns={columns} filterKey='categories' title={browser.i18n.getMessage('FilterTitle_Category')} />
            </Grid>
        </Grid>
    );

};

export default CategoriesFilterView;
