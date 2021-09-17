import { GetDeviationURLForThumbnail } from "./utils";
import { FETCH_METADATA } from "../constants/messages";

/**
 * Retrieves and sets the metadata on a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 */
export const SetMetadataOnThumbnail = async (thumbnail) => {
  const url = GetDeviationURLForThumbnail(thumbnail);
  if (!url) {
    throw Error("Failed to Determine URL for Thumbnail");
  }

  if (url.toLowerCase().startsWith("http")) {
    const metadata = await browser.runtime.sendMessage({
      action: FETCH_METADATA,
      data: {
        url,
      },
    });

    if (metadata) {
      SetMetadataAttributesOnThumbnail(thumbnail, metadata);
    }
  } else {
    console.warn("Thumbnail URL is not valid for oEmbed API:", url);
  }
};

/**
 * Sets the metadata attributes on a thumbnail
 * @param {HTMLElement} thumbnail the thumbnail DOM node
 * @param {object} metadata the metadata
 */
export const SetMetadataAttributesOnThumbnail = (thumbnail, metadata) => {
  const { author_name, title, tags } = metadata;

  if (author_name) {
    thumbnail.setAttribute("data-username", author_name);
  }

  if (title) {
    thumbnail.setAttribute("data-title", title);
  }

  if (tags) {
    thumbnail.setAttribute(
      "data-tags",
      tags
        .split(",")
        .map((tag) => tag.trim())
        .join(" ")
    );
  }
};
