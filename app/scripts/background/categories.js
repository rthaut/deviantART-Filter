const paths = [];

const API_BASE = 'https://www.deviantart.com';
const API_PATH = 'api/v1';
const API_TYPE = 'oauth2';

const CLIENT_ID = '3309';
const CLIENT_SECRET = 'ea9f3e16a80ed47a5221a67b7d0715ff';

const GetToken = async () => {
    try {
        const response = await fetch(`${API_BASE}/${API_TYPE}/token?` + new URLSearchParams({
            'grant_type': 'client_credentials',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
        }));
        const data = await response.json();
        if (!response.ok) {
            throw new Error(response.statusText || response.status);
        }
        return data?.access_token;
    } catch (ex) {
        console.error('Failed to get API token', ex);
    }
};

const GetCategoriesForPath = async (path, token) => {
    try {
        const response = await fetch(`${API_BASE}/${API_PATH}/${API_TYPE}/browse/categorytree?` + new URLSearchParams({
            'catpath': encodeURI(path),
            'access_token': token,
            'mature_content': true,
        }));
        const data = await response.json();
        if (!response.ok) {
            throw new Error(response.statusText || response.status);
        }
        return data?.categories;
    } catch (ex) {
        console.error(`Failed to get categories for path "${path}"`, ex);
    }
};

const GetFullCategoryTitle = (title, parentTitle = null) => {
    if (parentTitle) {
        title = parentTitle + ' > ' + title;
    }
    return title;
};

const PushPathsForCategory = async (path, token, parentTitle = null) => {
    const categories = await GetCategoriesForPath(path, token);
    if (Array.isArray(categories) && categories.length) {
        await Promise.all(categories.map(async (category) => {
            const title = GetFullCategoryTitle(category.title, parentTitle);
            paths.push(title);
            if (category.has_subcategory) {
                await PushPathsForCategory(category.catpath, token, title);
            }
        }));
    }
};

export const GetCategories = async () => {
    console.time('GetCategories()');
    const { 'category_cache': categories } = await browser.storage.local.get('category_cache');
    if (categories && categories?.paths.length) {
        console.info('Cached Category Data', categories);
        if (categories?.date.getTime() + (7 * 24 * 60 * 60 * 1000) >= new Date().getTime()) {
            console.timeEnd('GetCategories()');
            return categories.paths;
        }
    }

    const token = await GetToken();
    await PushPathsForCategory('/', token);

    if (!paths.length) {
        throw new Error('No categories returned by API');
    }

    paths.sort((a, b) => a.localeCompare(b));

    await browser.storage.local.set({
        'category_cache': {
            paths,
            'date': new Date()
        }
    });

    console.timeEnd('GetCategories()');
    return paths;
};
