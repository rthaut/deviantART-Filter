const axios = require('axios');

import { GetDeviationURLForThumbnail } from './utils';

// TODO: re-implement localStorage cache?

// TODO: refactor this to be version-agnostic, only pulling in util methods from Eclipse or Classic libs?

/**
 * Retrieves and sets the metadata on a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 */
export const SetMetadataOnThumbnail = async (thumbnail) => {
    const url = GetDeviationURLForThumbnail(thumbnail);
    if (!url) {
        throw Error('Failed to Determine URL for Thumbnail');
    }

    // TODO: should this request be done in the background script (using browser messages)?
    const result = await axios.get('https://backend.deviantart.com/oembed', {
        'params': {
            url
        }
    });

    if (result && result.data) {
        SetMetadataAttributesOnThumbnail(thumbnail, result.data);
    }
};

/**
 * Sets the metadata attributes on a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @param {object} metadata the metadata
 */
export const SetMetadataAttributesOnThumbnail = (thumbnail, metadata) => {
    const { author_name, title, category, tags } = metadata;

    if (author_name) {
        thumbnail.setAttribute('data-username', author_name);
    }

    if (title) {
        thumbnail.setAttribute('data-title', title);
    }

    if (category) {
        thumbnail.setAttribute('data-category', category);
    }

    if (tags) {
        thumbnail.setAttribute('data-tags', tags.split(',').map(tag => tag.trim()).join(' '));
    }
};
