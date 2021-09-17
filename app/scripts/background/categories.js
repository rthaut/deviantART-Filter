const paths = [];

const API_BASE = "https://www.deviantart.com";
const API_PATH = "api/v1";
const API_TYPE = "oauth2";

const CLIENT_ID = "3309";
const CLIENT_SECRET = "ea9f3e16a80ed47a5221a67b7d0715ff";

// TODO: make this configurable? also, if a way to force-refresh cache is implemented, this could possibly be increased significantly (weeks or maybe even months)
const DAYS_TO_CACHE = 1;

/**
 * Returns an access token for the DeviantArt API
 * @returns {string} the access token
 */
// TODO: should this (and related API configs) be moved to a separate library/file for re-use?
const GetToken = async () => {
  try {
    const response = await fetch(
      `${API_BASE}/${API_TYPE}/token?` +
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        })
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(response.statusText || response.status);
    }
    return data?.access_token;
  } catch (ex) {
    console.error("Failed to get API token", ex);
  }
};

/**
 * Returns category data for the given path
 * @param {string} path the category path, formatted for DeviantArt's category tree API
 * @param {string} token a valid DeviantArt API access token
 * @returns {object[]} the category data
 */
const GetCategoriesForPath = async (path, token) => {
  try {
    const response = await fetch(
      `${API_BASE}/${API_PATH}/${API_TYPE}/browse/categorytree?` +
        new URLSearchParams({
          catpath: encodeURI(path),
          access_token: token,
          mature_content: true,
        })
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(response.statusText || response.status);
    }
    return data?.categories;
  } catch (ex) {
    console.error(`Failed to get categories for path "${path}"`, ex);
  }
};

/**
 * Returns the full category title (with optional parent title's prepended)
 * @param {string} title the title of a category
 * @param {string} [parentTitle] (optional) the title of the parent category
 * @returns {string} the full formatted title
 */
const GetFullCategoryTitle = (title, parentTitle = null) => {
  if (parentTitle) {
    title = parentTitle + " > " + title;
  }
  return title;
};

/**
 * Recursively adds all child paths for a given category to the `paths` array
 * @param {string} path the category path
 * @param {string} token a valid DeviantArt API access token
 * @param {string} [parentTitle] (optional) the title of the parent category
 */
const PushPathsForCategory = async (path, token, parentTitle = null) => {
  const categories = await GetCategoriesForPath(path, token);
  if (Array.isArray(categories) && categories.length) {
    await Promise.all(
      categories.map(async (category) => {
        const title = GetFullCategoryTitle(category.title, parentTitle);
        paths.push(title);
        if (category.has_subcategory) {
          await PushPathsForCategory(category.catpath, token, title);
        }
      })
    );
  }
};

/**
 * Returns all DeviantArt Category paths; data is cached for `DAYS_TO_CACHE` days
 */
// TODO: instead of logging remaining time for cache time here, it would be much more useful to display it somewhere (perhaps on the dashboard?) and/or provide a way to force the cache to be refreshed
export const GetCategories = async () => {
  console.time("GetCategories()");

  try {
    const { category_cache: categories } = await browser.storage.local.get(
      "category_cache"
    );
    console.info("Cached category data", categories);
    if (categories?.date && categories?.paths?.length) {
      const remainingMilliseconds =
        categories?.date + DAYS_TO_CACHE * 86400 * 1000 - new Date().getTime();
      if (remainingMilliseconds > 0) {
        // formatting the remaining time this way only works
        // if/when the remaining time is less than 24 hours
        const date = new Date(0);
        date.setSeconds(remainingMilliseconds / 1000);
        console.info(
          "Cached category data expires in",
          date.toISOString().substr(11, 8)
        );

        console.timeEnd("GetCategories()");
        return categories.paths;
      } else {
        console.info("Cached category data is expired");
      }
    }
  } catch (ex) {
    console.error("Failed to retrieve categories from cache", ex);
  }

  const token = await GetToken();
  await PushPathsForCategory("/", token);

  if (!paths.length) {
    throw new Error("No categories returned by API");
  }

  paths.sort((a, b) => a.localeCompare(b));

  try {
    await browser.storage.local.set({
      category_cache: {
        paths,
        date: new Date().getTime(),
      },
    });
  } catch (ex) {
    console.error("Failed to store categories in cache", ex);
  }

  console.timeEnd("GetCategories()");
  return paths;
};
