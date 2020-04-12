import React from 'react';
import { Grid } from '@material-ui/core';
import DashboardFilterTile from '../components/DashboardFilterTile';

const DashboardView = () => {
    return (
        <Grid container spacing={3}>
            <DashboardFilterTile
                filterKey="users"
                title={browser.i18n.getMessage('FilterTitle_User')}
                link="/users"
            />
            <DashboardFilterTile
                filterKey="keywords"
                title={browser.i18n.getMessage('FilterTitle_Keyword')}
                link="/keywords"
            />
            <DashboardFilterTile
                filterKey="categories"
                title={browser.i18n.getMessage('FilterTitle_Category')}
                link="/categories"
            />
        </Grid>
    );
};

export default DashboardView;
