//export default { //** works as default anannonomous import you can name it anything you want as a mutable object; use  import <name> from 'settings';
export const appSettings = { //** works as a named export as a mutable object; use import {settings} from 'settings';
    //const settings = {
    API_BASE: 'https://api.github.com',
    HEADERS: {
        'Accept': 'application/vnd.github.v3+json'
    },
    DEFAULT_FULL_PATHS: false,
    DEFAULT_FILTER_EXTENSIONS: true,
    DEFAULT_PROFILE_INDEX: 0,
    DEFAULT_FILE_TYPE: '.html',
    fileTypes: ['.html', '.js', '.css', '.json'],
    profiles: [
        {
            OWNER: 'lecespedes',
            REPO: 'VueDemoProject',
            BRANCH: 'main',
            root: 'VueProject',
            EXCLUDE: [
                '.git/',
                'BootstrapVueNext/',
                'DashboardTemplates/',
                'Filepaths.php',
                '.gitignore',
                'favicon.ico',
                'GitHubFileUtility.html'
            ],
            extensionsToFilter: ['.md', '.jpg', '.jpeg', '.png', '.svg', '.eot', '.ttf', '.woff', '.woff2']
        },
        {
            OWNER: 'lecespedes',
            REPO: 'staradmin-2-free',
            BRANCH: 'main',
            root: null,
            EXCLUDE: [
                '.git/',
                'BootstrapVueNext/',
                'DashboardTemplates/',
                'Filepaths.php',
                '.gitignore',
                'favicon.ico',
                'GitHubFileUtility.html'
            ],
            extensionsToFilter: ['.md', '.jpg', '.jpeg', '.png', '.svg', '.eot', '.ttf', '.woff', '.woff2']
        },
        {
            OWNER: 'lecespedes',
            REPO: 'StarAdminVue',
            BRANCH: 'main',
            root: null,
            EXCLUDE: [
                '.git/',
                '.gitignore',
                'favicon.ico'
            ],
            extensionsToFilter: ['.md', '.jpg', '.jpeg', '.png', '.svg', '.eot', '.ttf', '.woff', '.woff2']
        },
        {
            OWNER: 'lecespedes',
            REPO: 'GITHUBUTILITY',
            BRANCH: 'main',
            root: null,
            EXCLUDE: [
                '.git/',
                '.gitignore',
                'favicon.ico',
                'Versions/'
            ],
            extensionsToFilter: ['.md', '.jpg', '.jpeg', '.png', '.svg', '.eot', '.ttf', '.woff', '.woff2']
        }
    ]
};
//export default settings; //** works as a default named export as a mutable object can have any name must be after object declaration; use import <name> from 'settings';