import React, { useEffect } from 'react';
import { useList } from 'react-use';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';

import {
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import ImportFilterResultsTable from './ImportFilterResultsTable';

import { IMPORT_FILTERS } from '../../constants/messages';

const useStyles = makeStyles((theme) => ({
    'dropzone': {
        'flex': 1,
        'display': 'flex',
        'flexDirection': 'column',
        'alignItems': 'center',
        'textAlign': 'center',
        'padding': theme.spacing(3),
        'borderWidth': 2,
        'borderRadius': 2,
        'borderColor': theme.palette.text.hint,
        'borderStyle': 'dashed',
        'backgroundColor': theme.palette.background.default,
        'color': theme.palette.text.primary,
        'outline': 'none',
        'transition': 'border .2s ease-in-out'
    },
    'dropzoneActive': {
        'borderColor': theme.palette.text.primary,
        'borderStyle': 'solid',
    },
    'dropzoneReject': {
        'borderColor': theme.palette.error.main,
        'color': theme.palette.error.main,
    },
    'results': {
        'marginTop': theme.spacing(3),
    },
}));

const FiltersImporter = () => {
    const classes = useStyles();

    const [imports, { 'set': setImports, 'upsert': upsertImports }] = useList([]);

    const { acceptedFiles, getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        'accept': 'application/json'
    });

    const readFileData = file => new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();

            reader.onabort = () => reject('File reading aborted');
            reader.onerror = () => reject('File reading failed');
            reader.onload = () => {
                const data = JSON.parse(reader.result);
                resolve(data);
            };

            reader.readAsText(file);
        } catch (ex) {
            console.error('Failed to read data from file(s)', ex);
            reject('File reading failed');
        }
    });

    const importFileData = async (data) => {
        return await browser.runtime.sendMessage({
            'action': IMPORT_FILTERS,
            'data': data
        });
    };

    const processFiles = files => {
        const imports = files.map(file => ({ file }));
        setImports(imports);

        // process each file in sequence with a promise reducer
        imports.reduce((promise, currentImport) => promise.then(async () => {
            const data = await readFileData(currentImport.file);
            const result = await importFileData(data);
            currentImport.results = result;
            upsertImports((a, b) => a.file.path === b.file.path, currentImport);
        }), Promise.resolve());
    };

    useEffect(() => {
        processFiles(acceptedFiles);
    }, [acceptedFiles]);

    return (
        <>
            <div className={clsx(classes.dropzone, isDragActive && classes.dropzoneActive, isDragReject && classes.dropzoneReject)} variant="outlined" {...getRootProps()}>
                <input {...getInputProps()} />
                <Typography component="p" variant="subtitle2">
                    Drag &amp; drop your <em>DeviantArt Filter</em> file(s) here<br />
                    (or click anywhere in this box to open your file browser)
                </Typography>
                {isDragReject && <Typography component="p" variant="h6">That is not an accepted file format.</Typography>}
            </div>
            {imports.length > 0 && <div className={classes.results}>
                <ImportFilterResultsTable results={imports} />
            </div>}
        </>
    );
};

export default FiltersImporter;

