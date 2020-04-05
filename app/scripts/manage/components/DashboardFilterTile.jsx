import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
    Typography,
    Divider,
    Grid,
    Paper,
    Link,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    'paper': {
        'padding': theme.spacing(2),
        'overflow': 'auto',
    },
    'paperDivider': {
        'marginTop': theme.spacing(4),
        'marginBottom': theme.spacing(2),
    }
}));

const DashboardFilterTile = ({ filterKey, title, link }) => {
    const classes = useStyles();

    const [filterCount, setFilterCount] = useState(0);

    useEffect(() => {
        const getFilterCount = async () => {
            try {
                const data = await browser.storage.local.get(filterKey);
                setFilterCount(Array.from(data[filterKey]?? [])?.length);
            }
            catch (ex) {
                // console.error(ex);
            }
        };
        getFilterCount();
    }, [setFilterCount, filterKey]);

    const onStorageChanged = (changes, areaName) => {
        if (areaName === 'local' && Object.keys(changes).includes(filterKey)) {
            setFilterCount(changes[filterKey].newValue.length);
        }
    };

    useEffect(() => {
        if (!browser.storage.onChanged.hasListener(onStorageChanged)) {
            browser.storage.onChanged.addListener(onStorageChanged);
        }

        return () => {
            if (browser.storage.onChanged.hasListener(onStorageChanged)) {
                browser.storage.onChanged.removeListener(onStorageChanged);
            }
        };
    }, []);

    return (
        <Grid item xs={12} md={4}>
            <Paper className={classes.paper}>
                <Typography component="h2" variant="h6" color="textSecondary" gutterBottom>
                    {filterCount} {title}
                </Typography>
                <Divider className={classes.paperDivider} />
                <Link color="primary" component={NavLink} to={link}>View / Manage</Link>
            </Paper>
        </Grid>
    );
};

DashboardFilterTile.propTypes = {
    'filterKey': PropTypes.string,
    'title': PropTypes.string,
    'link': PropTypes.string,
};

export default DashboardFilterTile;
