import { initDom } from './domManager.js';
import { getAppFunctions } from './appFunctions.js';

export function initApp({ appSettings, appState}) {
    let DOM={};
    const uiFunctions = getAppFunctions(appSettings, appState, DOM);
    
    const config = {
        buttons: [
            { var: 'btnLoadFiles', elmt: 'load-files-directory', props: {}, eventListeners: [{ event: 'click', handler: uiFunctions.DisplayPathsAndDirectory }] },
            { var: 'btnLoadCode', elmt: 'load-code', props: {}, eventListeners: [{ event: 'click', handler: uiFunctions.DisplayFileContent }] },
            { var: 'btnClearCache', elmt: 'clear-cache', props: {}, eventListeners: [{ event: 'click', handler: uiFunctions.clearCache }] },
            { var: 'btnJsonViewer', elmt: 'json-viewer-button', props: {}, eventListeners: [{ event: 'click', handler: () => {
                const jsonUrl = uiFunctions.createJsonBlobUrl(document.getElementById('directory-structure-output').textContent);
                window.open(jsonUrl, '_blank');
            }}] },
            { var: 'fileListCopy', elmt: 'file-list-copy', props: {}, eventListeners: [{ event: 'click', handler: () => uiFunctions.copyPathsToClipboard('file-list-output') }] },
            { var: 'fileListSave', elmt: 'file-list-save', props: {}, eventListeners: [{ event: 'click', handler: () => uiFunctions.savePathsAsJson('file-list-output') }] },
            { var: 'directoryCopy', elmt: 'directory-copy', props: {}, eventListeners: [{ event: 'click', handler: () => uiFunctions.copyPathsToClipboard('directory-structure-output') }] },
            { var: 'directorySave', elmt: 'directory-save', props: {}, eventListeners: [{ event: 'click', handler: () => uiFunctions.savePathsAsJson('directory-structure-output') }] },
            { var: 'codeCopy', elmt: 'code-copy', props: {}, eventListeners: [{ event: 'click', handler: () => uiFunctions.copyPathsToClipboard('code-output') }] }
        ],
        checkboxes: [
            { var: 'ckbFullPaths', elmt: 'full-paths', props: { checked: appSettings.DEFAULT_FULL_PATHS }, eventListeners: [{ event: 'change', handler: uiFunctions.updateDirectoryFromCache }] },
            { var: 'ckbFilterExtensions', elmt: 'filter-extensions', props: { checked: appSettings.DEFAULT_FILTER_EXTENSIONS } }
        ],
        inputs: [
            { var: 'inpCustomRoot', elmt: 'custom-root', props: { value: '' }, eventListeners: [{ event: 'input', handler: uiFunctions.updateDirectoryFromCache }] }
        ],
        divs: [
            { var: 'divLoading', elmt: 'loading', props: { style: { display: 'none' } } },
            { var: 'divError', elmt: 'error', props: { textContent: '' } },
            { var: 'divResult', elmt: 'result', props: { textContent: '' } },
            { var: 'divFileListOutput', elmt: 'file-list-output', props: { textContent: 'Click <Load Files & Directory> to load the data.' } },
            { var: 'divDirectoryOutput', elmt: 'directory-structure-output', props: { textContent: 'Click <Load Files & Directory> to load the data.' } },
            { var: 'divCodeOutput', elmt: 'code-output', props: { textContent: 'Click <Load Code> to load the data.' } },
            { var: 'divSettingsOutput', elmt: 'settings-output', props: { textContent: JSON.stringify(appSettings, null, 2), style: { whiteSpace: 'pre' } } },
            { var: 'divCacheOutput', elmt: 'cache-output', props: { textContent: '' } }
        ],
        spans: [
            { var: 'spnFileFilter', elmt: 'filter-types', props: {} },
            { var: 'spnExcludeDirPaths', elmt: 'excluded-paths', props: {} }
        ],
        selects: [
            { var: 'selProfile', elmt: 'profile', eventListeners: [{ event: 'change', handler: uiFunctions.handleProfileChange }] },
            { var: 'selFileType', elmt: 'file-type', eventListeners: [{ event: 'change', handler: () => {
                appState.selectedFileType = DOM.selFileType.value;
                uiFunctions.updateCodeOutput();
            }}] },
            { var: 'selFileList', elmt: 'file-list', eventListeners: [{ event: 'change', handler: uiFunctions.updateCodeOutput }] }
        ]
    };
    initDom(config,DOM,appSettings);
    uiFunctions.migrateCache();
    uiFunctions.updateUI();
}