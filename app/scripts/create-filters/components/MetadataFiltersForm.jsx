import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
    makeStyles,
} from '@material-ui/core/styles';

import {
    Typography,
    Divider,
    FormControl,
    FormControlLabel,
    Switch,
    Breadcrumbs,
    Chip,
    Checkbox,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';

import {
    Clear as ClearIcon,
    Done as DoneIcon,
    NavigateNext as NavigateNextIcon,
} from '@material-ui/icons';

export const useStyles = makeStyles((theme) => ({
    'form': {
        'display': 'flex',
        'flexDirection': 'column',
        'margin': 'auto',
        'width': 'fit-content',
    },
    'fieldset': {
        'margin': theme.spacing(0, 0, 2),
    },
    'legend': {
        'padding': theme.spacing(0),
    },
    'divider': {
        'margin': theme.spacing(0, 0, 3),
    },
    'checkboxList': {
        'width': '100%',
    },
    'checkboxListItem': {
        'padding': theme.spacing(0),
    },
    'checkboxListIcon': {
        'minWidth': 'auto !important',
    },
}));

const MetadataFiltersForm = ({ metadata, setFilter }) => {
    const classes = useStyles();

    const [selectedUsername, setSelectedUsername] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        setSelectedUsername('');
        setSelectedTags([]);
        setSelectedCategory('');
    }, [metadata]);

    useEffect(() => {
        if (selectedUsername.length) {
            setFilter('users', [{
                'username': selectedUsername
            }]);
        } else {
            setFilter('users', []);
        }
    }, [selectedUsername]);

    useEffect(() => {
        if (selectedCategory.length) {
            setFilter('categories', [{
                'name': selectedCategory
            }]);
        } else {
            setFilter('categories', []);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (selectedTags.length) {
            setFilter('keywords', selectedTags.map(tag => ({
                'keyword': tag,
                'wildcard': false
            })));
        } else {
            setFilter('keywords', []);
        }
    }, [selectedTags]);

    const username = metadata?.author_name?.trim();
    const tags = metadata?.tags?.split(',').map(tag => tag.trim());
    const categories = metadata?.category?.split(' > ').map(category => category.trim());

    const toggleTag = tag => {
        if (selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags.filter(t => t !== tag)]);
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    return (
        <form className={classes.form} noValidate>

            {username && (<FormControl component='fieldset' className={classes.fieldset}>
                <Typography component='legend' className={classes.legend}>Username</Typography>{/* TODO: i18n */}
                <Typography component='p' variant='body2' color='textSecondary' gutterBottom><strong>Optional.</strong> Toggle the switch to create a new user filter.</Typography>{/* TODO: i18n */}
                <FormControlLabel
                    control={<Switch
                        color='primary'
                        checked={selectedUsername === username}
                        onChange={e => setSelectedUsername(e.target.checked ? username : '')}
                    />}
                    label={username}
                />
            </FormControl>)}

            {username && categories && <Divider className={classes.divider} />}

            {categories && (<FormControl component='fieldset' className={classes.fieldset}>
                <Typography component='legend' className={classes.legend}>Category</Typography>{/* TODO: i18n */}
                <Typography component='p' variant='body2' color='textSecondary' gutterBottom><strong>Optional.</strong> Click on sections of the following category hierarchy to create a new category filter.<br />(You can click on a selected section to unselect it.)</Typography>{/* TODO: i18n */}
                <Breadcrumbs separator={<NavigateNextIcon />}>
                    {categories.map((category, index, categories) => {
                        const current = categories.slice(0, index + 1).join(' > ').trim();
                        const previous = categories.slice(0, index).join(' > ').trim();
                        const selected = selectedCategory.includes(current);
                        return (
                            <Chip
                                key={index}
                                size='small'
                                variant={selected ? 'default' : 'outlined'}
                                color={selected ? 'primary' : 'default'}
                                label={category}
                                clickable
                                onClick={() => selected && selectedCategory === current ? setSelectedCategory(previous) : setSelectedCategory(current)}
                                icon={selected ? <DoneIcon /> : <ClearIcon />}
                            />
                        );
                    })}
                </Breadcrumbs>
            </FormControl>)}

            {(username || categories) && tags && <Divider className={classes.divider} />}

            {tags && (<FormControl component='fieldset' className={classes.fieldset}>
                <Typography component='legend' className={classes.legend}>Keywords</Typography>{/* TODO: i18n */}
                <Typography component='p' variant='body2' color='textSecondary' gutterBottom><strong>Optional.</strong> Select one or more of the following tags to create new keyword filters.</Typography>{/* TODO: i18n */}
                <List className={classes.checkboxList} dense>
                    {tags.map((tag, index) => (
                        <ListItem key={index} button disableRipple role={undefined} dense disableGutters onClick={() => toggleTag(tag)} className={classes.checkboxListItem}>
                            <ListItemIcon className={classes.checkboxListIcon}>
                                <Checkbox
                                    disableRipple
                                    edge='start'
                                    color='primary'
                                    checked={selectedTags.includes(tag)}
                                    tabIndex={-1}
                                />
                            </ListItemIcon>
                            <ListItemText primary={tag} />
                        </ListItem>
                    ))}
                </List>
            </FormControl>)}

        </form>
    );
};

MetadataFiltersForm.propTypes = {
    'metadata': PropTypes.object.isRequired,
    'setFilter': PropTypes.func.isRequired,
};

export default MetadataFiltersForm;
