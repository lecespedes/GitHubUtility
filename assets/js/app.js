import {appSettings} from './appSettings.js';
import {initApp} from './appController.js';

// Application state
const appState = {
apiLimit: 'N/A',
apiLimitResetDate: 'N/A',
selectedFileType: appSettings.DEFAULT_FILE_TYPE,
fileContents: [],
activeProfileIndex: appSettings.DEFAULT_PROFILE_INDEX,
activeSettings: appSettings.profiles[appSettings.DEFAULT_PROFILE_INDEX]
};

initApp({appSettings,appState});