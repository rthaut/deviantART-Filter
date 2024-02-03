import { FETCH_METADATA } from "../constants/messages";
import { SUBMISSION_URL_REGEX } from "../constants/url";

/**
 * Retrieves and sets the metadata on a DOM node
 * @param {HTMLElement} node the DOM node
 */
export const SetMetadataOnNode = async (node) => {
  const metadataAttributes = ["data-username", "data-title", "data-tags"];
  const hasMetadata = node
    .getAttributeNames()
    .some((a) => metadataAttributes.includes(a));

  if (hasMetadata) {
    return;
  }

  const url = node.getAttribute("href");
  if (!url) {
    console.warn("Failed to get Deviation URL for DOM node", node);
    return;
  }

  let metadata;

  if (url.includes("/status-update/")) {
    // oEmbed API does not support status updates,
    // but we can parse and set the username from the URL
    const { username: author_name } = SUBMISSION_URL_REGEX.exec(url).groups;
    metadata = { author_name };
    console.info("Manually setting metadata for status update", url, metadata);
  } else {
    if (!url.toLowerCase().startsWith("http")) {
      console.warn("Deviation URL is not valid for oEmbed API", url);
      return;
    }

    metadata = await browser.runtime.sendMessage({
      action: FETCH_METADATA,
      data: {
        url,
      },
    });
  }

  if (metadata) {
    SetMetadataAttributesOnNode(node, metadata);
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
        .join(" "),
    );
  }
};
