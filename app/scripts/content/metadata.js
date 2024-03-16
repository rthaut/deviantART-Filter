import { FETCH_METADATA } from "../constants/messages";
import { SUBMISSION_URL_REGEX } from "../constants/url";

/**
 * Retrieves and sets the metadata on a DOM node
 * @param {HTMLElement} node the DOM node
 * @returns {Promise<boolean>} `true` if the metadata was set, `false` otherwise
 */
export const SetMetadataOnNode = async (node) => {
  const metadataAttributes = ["data-title", "data-tags"];
  const hasMetadata = node
    .getAttributeNames()
    .some((a) => metadataAttributes.includes(a));

  if (hasMetadata) {
    return true;
  }

  const url = node.getAttribute("href");
  if (!url) {
    console.warn("Failed to get Deviation URL for DOM node", node);
    return false;
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
      return false;
    }

    try {
      metadata = await browser.runtime.sendMessage({
        action: FETCH_METADATA,
        data: {
          url,
        },
      });
    } catch (error) {
      console.error("Failed to get metadata for Deviation URL", url, error);
      return false;
    }
  }

  if (!metadata) {
    return false;
  }

  SetMetadataAttributesOnNode(node, metadata);
  return true;
};

/**
 * Sets the metadata attributes on a DOM node
 * @param {HTMLElement} node the DOM node
 * @param {object} metadata the metadata
 */
export const SetMetadataAttributesOnNode = (node, metadata) => {
  const { author_name, category, tags, title, type } = metadata;

  if (author_name) {
    // TODO: put the author_name metadata value into a different (or additional) attribute?
    // currently it overwrites the lowercase username that is parsed from the URL
    // via the `GetUsernameForNode()` function when applying user filters
    // (typically prior to the metadata retrieval/injection finishing)
    node.setAttribute("data-username", author_name);
  }

  if (category) {
    node.setAttribute("data-category", category);
  }

  if (tags) {
    node.setAttribute(
      "data-tags",
      tags
        .split(",")
        .map((tag) => tag.trim())
        .join(" "),
    );
  } else {
    // explicitly set data-tags attribute to empty string for untagged submission filtering
    node.setAttribute("data-tags", "");
  }

  if (title) {
    node.setAttribute("data-title", title);
  }

  if (type) {
    node.setAttribute("data-type", type);
  }
};
