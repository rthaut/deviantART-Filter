import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';

import { EXPORT_FILTERS } from '../../constants/messages';

const FiltersExportButton = ({children, ...props}) => {
    const exportFilters = async () => {
        const data = await browser.runtime.sendMessage({
            'action': EXPORT_FILTERS
        });
        const dataObj = new Blob([JSON.stringify(data)], { 'type': 'application/json' });
        const dataObjURL = URL.createObjectURL(dataObj);

        const date = new Date();
        const filename = browser.i18n.getMessage('ExtensionName').replace(' ', '_');

        const link = document.createElement('a');
        link.href = dataObjURL;
        link.download = `${filename}-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.json`;
        link.dispatchEvent(new MouseEvent('click'));
    };

    return (
        <Button {...props} onClick={exportFilters}>{children}</Button>
    );
};

FiltersExportButton.propTypes = {
    'children': PropTypes.node,
};

export default FiltersExportButton;
