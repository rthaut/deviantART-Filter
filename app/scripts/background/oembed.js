export const OEMBED_ENDPOINT = "https://backend.deviantart.com/oembed";

/**
 * Builds the DeviantArt oEmbed API URL for a deviation
 * @param {string} deviationURL the deviation URL
 * @returns {URL} the oEmbed API URL, with the deviation URL encoded in the `url` query parameter
 */
export const GetOEmbedURL = (deviationURL) => {
  const url = new URL(OEMBED_ENDPOINT);
  url.searchParams.set("url", deviationURL);
  return url;
};
