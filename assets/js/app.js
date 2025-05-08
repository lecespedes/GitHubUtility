// File: app.js
import {appSettings} from './appSettings.js';
import { getAppFunctions } from './appFunctions.js';
import { createAppManager } from './appManager.js';

// Application state
const appState = {
apiLimit: 'N/A',
apiLimitResetDate: 'N/A',
selectedFileType: appSettings.DEFAULT_FILE_TYPE,
fileContents: [],
activeProfileIndex: appSettings.DEFAULT_PROFILE_INDEX,
activeProfile: appSettings.profiles[appSettings.DEFAULT_PROFILE_INDEX]
};
Object.seal(appState);
Object.seal(appState.activeProfile);

let DOM = {};
const uiFunctions = getAppFunctions(appSettings, appState, DOM);
createAppManager(appSettings, appState, uiFunctions, DOM);
console.log(document);