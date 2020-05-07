import React, { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'react-use';
import {
    HashRouter as Router,
    Switch as RouterSwitch,
    Route,
} from 'react-router-dom';

import { SnackbarProvider } from 'notistack';

import clsx from 'clsx';

import {
    createMuiTheme,
    makeStyles,
    ThemeProvider,
} from '@material-ui/core/styles';
import {
    amber,
    blue,
    deepOrange,
    grey,
    green,
    red,
} from '@material-ui/core/colors';

import {
    useMediaQuery,
    AppBar,
    CssBaseline,
    IconButton,
    Toolbar,
    Typography,
    Drawer,
    Divider,
    Container,
    FormControlLabel,
    Switch,
    Box,
    Link,
    Button,
} from '@material-ui/core';

import {
    ChevronLeft as ChevronLeftIcon,
    Menu as MenuIcon,
} from '@material-ui/icons';

import DashboardView from './views/DashboardView';
import CategoriesFilterView from './views/CategoriesFilterView';
import KeywordsFilterView from './views/KeywordsFilterView';
import UsersFilterView from './views/UsersFilterView';

import SidebarMenu from './components/SidebarMenu';

const drawerWidth = 240;

export const useStyles = makeStyles((theme) => ({
    'root': {
        'display': 'flex',
    },
    'toolbar': {
        'paddingRight': 24, // keep right padding when drawer closed
    },
    'toolbarIcon': {
        'display': 'flex',
        'alignItems': 'center',
        'justifyContent': 'flex-end',
        'padding': '0 8px',
        ...theme.mixins.toolbar,
    },
    'appBar': {
        'zIndex': theme.zIndex.drawer + 1,
        'transition': theme.transitions.create(['width', 'margin'], {
            'easing': theme.transitions.easing.sharp,
            'duration': theme.transitions.duration.leavingScreen,
        }),
    },
    'appBarShift': {
        'marginLeft': drawerWidth,
        'width': `calc(100% - ${drawerWidth}px)`,
        'transition': theme.transitions.create(['width', 'margin'], {
            'easing': theme.transitions.easing.sharp,
            'duration': theme.transitions.duration.enteringScreen,
        }),
    },
    'menuButton': {
        'marginRight': 36,
    },
    'menuButtonHidden': {
        'display': 'none',
    },
    'title': {
        'flexGrow': 1,
    },
    'drawerPaper': {
        'position': 'relative',
        'whiteSpace': 'nowrap',
        'width': drawerWidth,
        'transition': theme.transitions.create('width', {
            'easing': theme.transitions.easing.sharp,
            'duration': theme.transitions.duration.enteringScreen,
        }),
    },
    'drawerPaperClose': {
        'overflowX': 'hidden',
        'transition': theme.transitions.create('width', {
            'easing': theme.transitions.easing.sharp,
            'duration': theme.transitions.duration.leavingScreen,
        }),
        'width': theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            'width': theme.spacing(9),
        },
    },
    'appBarSpacer': theme.mixins.toolbar,
    'content': {
        'display': 'flex',
        'flexDirection': 'column',
        'flexGrow': 1,
        'height': '100vh',
        'overflow': 'auto',
    },
    'container': {
        'flexGrow': 1,
        'paddingTop': theme.spacing(4),
        'paddingBottom': theme.spacing(4),
    },
    'footer': {
        'padding': theme.spacing(0, 4),
    },
    'footerDivider': {
        'margin': theme.spacing(2, 0),
    },
    'snackbarVariantSuccess': {
        'backgroundColor': green[600], // green
        'color': green[50],
    },
    'snackbarVariantError': {
        'backgroundColor': red[700], // dark red
        'color': red[50],
    },
    'snackbarVariantWarning': {
        'backgroundColor': blue['A400'], // nice blue
        'color': blue[50],
    },
    'snackbarVariantInfo': {
        'backgroundColor': amber[700], // amber
        'color': amber[50],
    },
}));

const App = () => {
    const classes = useStyles();

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useLocalStorage('dark-mode', prefersDarkMode);

    const theme = useMemo(() => createMuiTheme({
        'palette': {
            'primary': deepOrange,
            'secondary': grey,
            'type': darkMode ? 'dark' : 'light',
        },
    }), [darkMode]);

    const [open, setOpen] = useState(false);
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };

    const [info, setInfo] = useState({});

    useEffect(() => {
        browser.management.getSelf().then(_info => setInfo(_info));
    }, []);

    const notistackRef = React.createRef();
    const notistackDismiss = key => () => {
        notistackRef.current.closeSnackbar(key);
    };

    return (
        <ThemeProvider theme={theme}>
            <SnackbarProvider
                ref={notistackRef}
                maxSnack={3}
                classes={{
                    'variantSuccess': classes.snackbarVariantSuccess,
                    'variantError': classes.snackbarVariantError,
                    'variantWarning': classes.snackbarVariantWarning,
                    'variantInfo': classes.snackbarVariantInfo,
                }}
                action={(key) => (
                    <Button onClick={notistackDismiss(key)}>Dismiss</Button>
                )}
            >
                <Router>
                    <div className={classes.root}>
                        <CssBaseline />
                        <AppBar position="absolute" color="primary" className={clsx(classes.appBar, open && classes.appBarShift)}>
                            <Toolbar className={classes.toolbar}>
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={handleDrawerOpen}
                                    className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
                                >
                                    <MenuIcon />
                                </IconButton>
                                {/* TODO: Add the icon/logo here? */}
                                <Typography component="h1" variant="h6" className={classes.title}>
                                    {browser.i18n.getMessage('ExtensionName')}
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={darkMode}
                                            onChange={event => setDarkMode(event.target.checked)}
                                            color="secondary"
                                            name="darkMode"
                                        />
                                    }
                                    label={browser.i18n.getMessage('DarkModeSwitchLabel')}
                                />
                            </Toolbar>
                        </AppBar>
                        <Drawer variant="permanent" classes={{ 'paper': clsx(classes.drawerPaper, !open && classes.drawerPaperClose) }} open={open}>
                            <div className={classes.toolbarIcon}>
                                <IconButton onClick={handleDrawerClose}>
                                    <ChevronLeftIcon />
                                </IconButton>
                            </div>
                            <Divider />
                            <SidebarMenu />
                        </Drawer>
                        <main className={classes.content}>
                            <div className={classes.appBarSpacer} />
                            <Container maxWidth="lg" className={classes.container}>
                                <RouterSwitch>
                                    <Route path="/users">
                                        <UsersFilterView />
                                    </Route>
                                    <Route path="/keywords">
                                        <KeywordsFilterView />
                                    </Route>
                                    <Route path="/categories">
                                        <CategoriesFilterView />
                                    </Route>
                                    <Route path="/">
                                        <DashboardView />
                                    </Route>
                                </RouterSwitch>
                            </Container>
                            {info && (
                                <Box className={classes.footer} color="text.secondary">
                                    <Divider className={classes.footerDivider} />
                                    <Typography paragraph variant="caption" align="right">
                                        <Link href={info.homepageUrl} target="_blank" rel="noopener noreferrer">{info.name || info.shortName} {info.versionName || info.version}</Link> by <Link href="https://ryan.thaut.me/" target="_blank" rel="noopener noreferrer">Ryan Thaut</Link>.
                                    </Typography>
                                </Box>
                            )}
                        </main>
                    </div>
                </Router>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
