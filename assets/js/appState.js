// File: app.js
import {appSettings} from './appSettings.js';
// Application state
export const appState = {
    apiLimit: 'N/A',
    apiLimitResetDate: 'N/A',
    selectedFileType: appSettings.DEFAULT_FILE_TYPE,
    activeProfileIndex: appSettings.DEFAULT_PROFILE_INDEX,
    activeProfile: appSettings.profiles[appSettings.DEFAULT_PROFILE_INDEX],
    fullPathsChecked: appSettings.DEFAULT_FULL_PATHS, // Added for ckbFullPaths
    filterExtensionsChecked: appSettings.DEFAULT_FILTER_EXTENSIONS, // Added for ckbFilterExtensions
    popupTimeoutId: null // For DisplayPopup timeout management
};
Object.seal(appState);
Object.seal(appState.activeProfile);
