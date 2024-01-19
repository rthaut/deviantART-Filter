import { FETCH_METADATA } from "../constants/messages";

/**
 * Retrieves and sets the metadata on a DOM node
 * @param {HTMLElement} node the DOM node
 */
export const SetMetadataOnNode = async (node) => {
  const url = node.getAttribute("href");

  if (url) {
    if (url.toLowerCase().startsWith("http")) {
      const metadata = await browser.runtime.sendMessage({
        action: FETCH_METADATA,
        data: {
          url,
        },
      });

      if (metadata) {
        SetMetadataAttributesOnNode(node, metadata);
      }
    } else {
      console.warn("Deviation URL is not valid for oEmbed API:", url);
    }
  } else {
    console.warn("Failed to get Deviation URL for DOM node", node);
  }
};

/**
 * Sets the metadata attributes on a DOM node
 * @param {HTMLElement} node the DOM node
 * @param {object} metadata the metadata
 */
export const SetMetadataAttributesOnNode = (node, metadata) => {
  const { author_name, title, tags } = metadata;

  if (author_name) {
    node.setAttribute("data-username", author_name);
  }

  if (title) {
    node.setAttribute("data-title", title);
  }

  if (tags) {
    node.setAttribute(
      "data-tags",
      tags
        .split(",")
        .map((tag) => tag.trim())
        .join(" ")
    );
  }
};
