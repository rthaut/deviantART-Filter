import React from 'react';
import { Grid } from '@material-ui/core';
import DashboardFilterTile from '../components/DashboardFilterTile';

const DashboardView = () => {
    return (
        <Grid container spacing={3}>
            <DashboardFilterTile filterKey="users" title="User Filters" link="/users" />
            <DashboardFilterTile filterKey="keywords" title="Keyword Filters" link="/keywords" />
            <DashboardFilterTile filterKey="categories" title="Category Filters" link="/categories" />
        </Grid>
    );
};

export default DashboardView;
