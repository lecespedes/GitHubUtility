let appState = null;
let appSettings = null;
let DOM = null;

export function getAppFunctions(settings, state, dom) {
    appSettings = settings;
    appState = state;
    DOM = dom;
    return {
        DisplayPathsAndDirectory,
        DisplayFileContent,
        clearCache,
        createJsonBlobUrl,
        copyPathsToClipboard,
        savePathsAsJson,
        updateDirectoryFromCache,
        handleProfileChange,
        updateCodeOutput,
        updateUI,
        migrateCache
    };
}
//export function setUIFuncDOM(dom) {
//    DOM = dom;
//}
async function fetchFileContent(path) {
    console.log(`Entering fetchFileContent: ${path}`);
    const profileKey = appState.activeProfileIndex;
    const cacheKey = `GitFiles:${path}`;
    const cached = getCache(cacheKey);
    if (cached) {
        console.log(`Returning cached content for: ${cacheKey}_${profileKey}`);
        return cached.content;
    }
    try {
        console.log(`Fetching content for: ${path}, profile: ${appState.activeSettings.OWNER}/${appState.activeSettings.REPO}/${appState.activeSettings.BRANCH}`);
        const contentUrl = `${appSettings.API_BASE}/repos/${appState.activeSettings.OWNER}/${appState.activeSettings.REPO}/contents/${path}?ref=${appState.activeSettings.BRANCH}`;
        const response = await fetch(contentUrl, { headers: appSettings.HEADERS });
        appState.rateLimitRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '60');
        appState.rateLimitResetDate = parseInt(response.headers.get('X-RateLimit-Reset') || '0') ? 
            new Date(parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000).toLocaleString() : 'unknown';
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.message || 'Unknown';
            console.log(`Fetch error for ${path}: ${response.status} ${response.statusText}, Message: ${message}`);
            if (response.status === 404) {
                return `Error in Function fetchFileContent: File not found: ${path}`;
            } else if (response.status === 403 && message.includes('rate limit exceeded')) {
                const ip = message.match(/for (\d+\.\d+\.\d+\.\d+)/)?.[1] || 'unknown';
                return `Error in Function fetchFileContent: Rate limit exceeded for IP ${ip}. Reset at ${appState.rateLimitResetDate}. Try disabling VPN/proxy.`;
            }
            return `Error in Function fetchFileContent: Failed to fetch file: ${response.status} ${response.statusText}. Message: ${message}`;
        }
        const data = await response.json();
        const content = atob(data.content);
        console.log(`Successfully fetched and caching: ${cacheKey}_${profileKey}`);
        setCache(cacheKey, { content, timestamp: Date.now() });
        return content;
    } catch (error) {
        console.error(`Fetch error for ${path}: ${error.message}`);
        return `Error in Function fetchFileContent: ${error.message}`;
    }
}

async function fetchFilePaths(useFilterExtensions) {
    console.log(`Entering fetchFilePaths, useFilterExtensions: ${useFilterExtensions}`);
    const profileKey = appState.activeProfileIndex;
    const cacheKey = `GitPath_${profileKey}`;
    const cached = getCache('GitPathh');
    let treeData;
    if (cached) {
        treeData = { tree: cached.map(path => ({ type: 'blob', path })) };
    } else {
        try {
            const treeUrl = `${appSettings.API_BASE}/repos/${appState.activeSettings.OWNER}/${appState.activeSettings.REPO}/git/trees/${appState.activeSettings.BRANCH}?recursive=1`;
            const response = await fetch(treeUrl, { headers: appSettings.HEADERS });
            appState.rateLimitRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '60');
            appState.rateLimitResetDate = parseInt(response.headers.get('X-RateLimit-Reset') || '0') ? 
                new Date(parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000).toLocaleString() : 'unknown';
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || 'Unknown';
                console.error(`Fetch error: ${response.status} ${response.statusText}, Message: ${message}`);
                if (response.status === 403 && message.includes('rate limit exceeded')) {
                    const ip = message.match(/for (\d+\.\d+\.\d+\.\d+)/)?.[1] || 'unknown';
                    return [`Error in Function FileFetchPaths: Rate limit exceeded for IP ${ip}. Reset at ${appState.rateLimitResetDate}. Try disabling VPN/proxy.`];
                }
                return [`Error in Function FileFetchPaths: Tree fetch error: ${response.status} ${response.statusText}. Message: ${message}`];
            }
            treeData = await response.json();
            const rawPaths = treeData.tree
                .filter(item => item.type == 'blob')
                .map(item => item.path);
            setCache('GitPath', rawPaths);
        } catch (error) {
            console.error(`Fetch error: ${error.message}`);
            return [`Error in Function FileFetchPaths: ${error.message}`];
        }
    }
    let paths = treeData.tree
        .filter(item => item.type === 'blob')
        .map(item => item.path)
        .filter(path => !appState.activeSettings.EXCLUDE.some(exclude => path === exclude || path.startsWith(exclude)))
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const unfilteredCount = paths.length;
    if (useFilterExtensions) {
        paths = paths.filter(path => !appState.activeSettings.extensionsToFilter.some(ext => path.toLowerCase().endsWith(ext)));
    }
    console.log(`Returning paths: ${paths.length}, unfiltered: ${unfilteredCount}`);
    return { paths, unfilteredCount };
}

async function DisplayFilePaths(paths) {
    console.log('Entering DisplayFilePaths');
    try {
        DOM.divFileListOutput.textContent = '';
        DOM.divError.textContent = '';
        DOM.divFileListOutput.style.whiteSpace = 'pre';
        DOM.divFileListOutput.textContent = JSON.stringify(paths, null, 2);
    } catch (error) {
        const errorMessage = `Error in Function DisplayFilePaths: ${error.message}`;
        console.error(errorMessage);
        DOM.divFileListOutput.textContent = errorMessage;
        DOM.divFileListOutput.style.whiteSpace = '';
        DOM.divError.textContent = errorMessage;
    }
    console.log('Exiting DisplayFilePaths');
}

async function DisplayDirectory(paths) {
    console.log('Entering DisplayDirectory');
    try {
        DOM.divDirectoryOutput.textContent = '';
        DOM.divError.textContent = '';
        const structure = buildJsonStructure(paths, appState.activeSettings.root, DOM.ckbFullPaths.checked);
        const jsonString = JSON.stringify(structure, null, 2);
        DOM.divDirectoryOutput.style.whiteSpace = 'pre';
        DOM.divDirectoryOutput.textContent = jsonString;
    } catch (error) {
        const errorMessage = `Error in Function DisplayDirectory: ${error.message}`;
        console.error(errorMessage);
        DOM.divDirectoryOutput.textContent = errorMessage;
        DOM.divDirectoryOutput.style.whiteSpace = '';
        DOM.divError.textContent = errorMessage;
    }
    console.log('Exiting DisplayDirectory');
}

function buildJsonStructure(paths, customRoot, useFullPaths) {
    console.log('Building JSON structure');
    const root = [];
    paths.forEach(path => {
        const segments = path.split('/');
        let current = root;
        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i];
            let dirObj = current.find(item => typeof item === 'object' && Object.keys(item)[0] === segment);
            if (!dirObj) {
                dirObj = { [segment]: [] };
                current.push(dirObj);
            }
            current = dirObj[segment];
        }
        const fileName = segments[segments.length - 1];
        const effectiveRoot = DOM.inpCustomRoot.value.trim() || customRoot || appSettings.REPO;
        const filePath = useFullPaths ? `${effectiveRoot}/${path}` : fileName;
        current.push(filePath);
    });
    function sortStructure(node) {
        if (!Array.isArray(node)) return node;
        const dirs = node.filter(item => typeof item === 'object');
        const files = node.filter(item => typeof item === 'string');
        dirs.sort((a, b) => Object.keys(a)[0].localeCompare(Object.keys(b)[0]));
        files.sort();
        for (const dir of dirs) {
            const key = Object.keys(dir)[0];
            dir[key] = sortStructure(dir[key]);
        }
        return [...dirs, ...files];
    }
    const sorted = sortStructure(root);
    const effectiveRoot = DOM.inpCustomRoot.value.trim() || customRoot || appSettings.REPO;
    return { [effectiveRoot]: sorted };
}

function getCache(key) {
    console.log(`Getting cache: ${key}`);
    const profileKey = appState.activeProfileIndex;
    const item = localStorage.getItem(`${key}_${profileKey}`);
    return item ? JSON.parse(item) : null;
}

function setCache(key, value) {
    const profileKey = appState.activeProfileIndex;
    console.log(`Caching key: ${key}_${profileKey} for profile ${appState.activeSettings.OWNER}/${appState.activeSettings.REPO}/${appState.activeSettings.BRANCH}`);
    localStorage.setItem(`${key}_${profileKey}`, JSON.stringify(value));
}

function updateCacheStatus() {
    console.log('Updating cache status');
    const profileKey = appState.activeProfileIndex;
    const paths = getCache('GitPath');
    const fileKeys = Object.keys(localStorage).filter(key => key.startsWith(`GitFiles:`) && key.endsWith(`_${profileKey}`));
    console.log(`Updating cache status for profileKey: ${profileKey}`);
    console.log(`All localStorage keys:`, Object.keys(localStorage));
    console.log(`Filtered fileKeys before display:`, fileKeys);
    let totalSize = 0;
    if (paths) {
        totalSize += JSON.stringify(paths).length;
    }
    fileKeys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
            totalSize += item.length;
        }
    });
    DOM.divCacheOutput.style.whiteSpace = 'pre';
    DOM.divCacheOutput.textContent = [
        'Cached Paths:',
        paths ? JSON.stringify(paths, null, 2) : 'None',
        '',
        'Cached Files:',
        fileKeys.length > 0 ? fileKeys.map(key => key.replace(`GitFiles:`, '').replace(`_${profileKey}`, '')).join('\n') : 'None'
    ].join('\n');
    document.getElementById('cache-summary').textContent = `Cached: ${paths ? paths.length : 0} paths, ${fileKeys.length} files, ${totalSize} bytes`;
}

function updateUI() {
    console.log('Updating UI');
    DOM.spnFileFilter.textContent = appState.activeSettings.extensionsToFilter.join(', ');
    DOM.spnExcludeDirPaths.textContent = appState.activeSettings.EXCLUDE.join(', ');
    const githubLink = document.getElementById('github-link');
    githubLink.href = `https://github.com/${appState.activeSettings.OWNER}/${appState.activeSettings.REPO}/tree/${appState.activeSettings.BRANCH}`;
    updateCacheStatus();
    console.log('UI updated');
}

function migrateCache() {
    console.log('Migrating cache');
    Object.keys(localStorage).forEach(key => {
        if (key.match(/GitPath_.+_.+_.+/) || key.match(/GitFiles:.+_.+_.+_.+/)) {
            localStorage.removeItem(key);
        }
    });
    DOM.divResult.textContent = 'Cache updated, please reload data.';
    setTimeout(() => {
        DOM.divResult.textContent = '';
    }, 3000);
}

async function DisplayFileContent() {
    try {
        DOM.btnLoadCode.disabled = true;
        DOM.divCodeOutput.textContent = '';
        DOM.selFileList.innerHTML = '';
        appState.fileContents = [];
        DOM.divError.textContent = '';
        DOM.divLoading.style.display = 'block';
        const result = await fetchFilePaths(DOM.ckbFilterExtensions.checked);
        let paths;
        if (Array.isArray(result)) {
            paths = result;
        } else {
            paths = result.paths;
        }
        console.log(`Fetched paths: ${paths.length}`);
        const filteredPaths = paths.filter(path => path.toLowerCase().endsWith(appState.selectedFileType));
        const errors = [];
        for (let i = 0; i < filteredPaths.length; i++) {
            const path = filteredPaths[i];
            DOM.divLoading.textContent = `Fetching file ${i + 1} of ${filteredPaths.length}`;
            const content = await fetchFileContent(path);
            appState.fileContents.push({ path, content });
            if (content.startsWith('Error')) {
                errors.push(`Error fetching ${path}: ${content}`);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        const allOption = document.createElement('option');
        allOption.value = 'All';
        allOption.textContent = 'All';
        DOM.selFileList.appendChild(allOption);
        filteredPaths.forEach(path => {
            const option = document.createElement('option');
            option.value = path;
            option.textContent = path;
            DOM.selFileList.appendChild(option);
        });
        DOM.selFileList.value = 'All';
        updateCodeOutput();
        if (errors.length > 0) {
            DOM.divError.textContent = errors.join('\n');
        }
        DOM.divLoading.textContent = 'Loading...';
        updateCacheStatus();
        const rateLimitElement = document.getElementById('rate-limit-info');
        rateLimitElement.textContent = `Rate limit: ${appState.rateLimitRemaining} until ${appState.rateLimitResetDate}`;
        DOM.divResult.textContent = `${filteredPaths.length} items loaded. ${errors.length} items failed.`;
    } catch (error) {
        const errorMessage = `Error in Function DisplayFileContent: ${error.message}`;
        console.error(errorMessage);
        DOM.divCodeOutput.textContent = errorMessage;
        DOM.divCodeOutput.style.whiteSpace = '';
        DOM.divError.textContent = errorMessage;
        DOM.selFileList.innerHTML = '';
    } finally {
        DOM.divLoading.style.display = 'none';
        DOM.btnLoadCode.disabled = false;
        console.log('Exiting DisplayFileContent');
    }
}

async function DisplayPathsAndDirectory() {
    console.log('Entering DisplayPathsAndDirectory');
    try {
        DOM.btnLoadFiles.disabled = true;
        DOM.divLoading.style.display = 'block';
        DOM.divError.textContent = '';
        const result = await fetchFilePaths(DOM.ckbFilterExtensions.checked);
        let paths;
        if (Array.isArray(result)) {
            paths = result;
            await DisplayFilePaths(paths);
            await DisplayDirectory(paths);
        } else {
            paths = result.paths;
            await DisplayFilePaths(paths);
            await DisplayDirectory(paths);
            const rateLimitElement = document.getElementById('rate-limit-info');
            rateLimitElement.textContent = `Rate limit: ${appState.rateLimitRemaining} until ${appState.rateLimitResetDate}`;
            DOM.divResult.textContent = `${paths.length} items returned. ${result.unfilteredCount - paths.length} items filtered out.`;
        }
        updateCacheStatus();
    } catch (error) {
        const errorMessage = `Error in Function DisplayPathsAndDirectory: ${error.message}`;
        console.error(errorMessage);
        DOM.divError.textContent = errorMessage;
    } finally {
        DOM.divLoading.style.display = 'none';
        DOM.btnLoadFiles.disabled = false;
        console.log('Exiting DisplayPathsAndDirectory');
    }
}

function createJsonBlobUrl(json) {
    console.log('Creating JSON blob URL');
    let jsonContent;
    try {
        const parsed = JSON.parse(json);
        if (typeof parsed === 'object' && parsed !== null) {
            jsonContent = JSON.stringify(parsed, null, 2);
        } else {
            jsonContent = JSON.stringify({ content: json }, null, 2);
        }
    } catch {
        jsonContent = JSON.stringify({ content: json }, null, 2);
    }
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL(jsonUrl), 1000);
    return jsonUrl;
}

async function copyPathsToClipboard(elementId) {
    console.log(`Copying paths to clipboard: ${elementId}`);
    const outputElement = document.getElementById(elementId);
    try {
        await navigator.clipboard.writeText(outputElement.textContent);
        const message = elementId === 'code-output' ? 'Code copied to clipboard!' : 'Paths copied to clipboard!';
        DOM.divError.className = 'success';
        DOM.divError.textContent = message;
        setTimeout(() => {
            DOM.divError.textContent = '';
            DOM.divError.className = '';
        }, 3000);
    } catch (error) {
        console.error(`Error copying to clipboard: ${error.message}`);
        DOM.divError.className = 'error';
        DOM.divError.textContent = `Error copying to clipboard: ${error.message}`;
    }
}

async function savePathsAsJson(elementId) {
    console.log(`Saving paths as JSON: ${elementId}`);
    const outputElement = document.getElementById(elementId);
    const text = outputElement.textContent;
    if (!text || text === 'Click <Load Files & Directory> to load the data.') {
        DOM.divError.textContent = 'Error: No paths to save.';
        console.error('No paths to save');
        return;
    }
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${elementId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    DOM.divError.className = 'success';
    DOM.divError.textContent = 'Paths saved as JSON!';
    setTimeout(() => {
        DOM.divError.textContent = '';
        DOM.divError.className = '';
    }, 3000);
}

function clearCache() {
    console.log('Clearing cache');
    const profileKey = appState.activeProfileIndex;
    console.log(`Clearing cache for profileKey: ${profileKey}`);
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`GitPath_${profileKey}`) || (key.startsWith(`GitFiles:`) && key.endsWith(`_${profileKey}`))) {
            console.log(`Removing key: ${key}`);
            localStorage.removeItem(key);
        }
        if (key.startsWith(`GitFiles:`) && !key.endsWith(`_${profileKey}`)) {
            console.log(`Cleaning stale key: ${key}`);
            localStorage.removeItem(key);
        }
    });
    updateCacheStatus();
    const cacheMessageElement = document.getElementById('cache-message');
    cacheMessageElement.style.display = 'block';
    setTimeout(() => {
        cacheMessageElement.style.display = 'none';
    }, 3000);
}

function handleProfileChange() {
    console.log('Handling profile change');
    const newIndex = parseInt(DOM.selProfile.value);
    if (newIndex === appState.activeProfileIndex) return;
    const newProfile = appSettings.profiles[newIndex];
    if (confirm(`Switch to profile ${newProfile.OWNER}/${newProfile.REPO}/${newProfile.BRANCH}?`)) {
        appState.activeProfileIndex = newIndex;
        appState.activeSettings = newProfile;
        DOM.divFileListOutput.textContent = 'Click <Load Files & Directory> to load the data.';
        DOM.divFileListOutput.style.whiteSpace = '';
        DOM.divDirectoryOutput.textContent = 'Click <Load Files & Directory> to load the data.';
        DOM.divDirectoryOutput.style.whiteSpace = '';
        DOM.divCodeOutput.textContent = 'Click <Load Code> to load the data.';
        DOM.divCodeOutput.style.whiteSpace = '';
        DOM.selFileList.innerHTML = '';
        appState.fileContents = [];
        DOM.inpCustomRoot.value = '';
        DOM.divResult.textContent = '';
        DOM.divError.textContent = '';
        updateUI();
    } else {
        DOM.selProfile.value = appState.activeProfileIndex;
        updateUI();
    }
}

function updateDirectoryFromCache() {
    console.log('Updating directory from cache');
    const cachedPaths = getCache('GitPath');
    if (cachedPaths) {
        DisplayDirectory(cachedPaths);
    }
}

function updateCodeOutput() {
    console.log('Updating code output');
    const selectedFile = DOM.selFileList.value;
    if (!appState.fileContents.length) {
        DOM.divCodeOutput.textContent = 'Click <Load Code> to load the data.';
        DOM.divCodeOutput.style.whiteSpace = '';
        return;
    }
    DOM.divCodeOutput.style.whiteSpace = 'pre';
    if (selectedFile === 'All') {
        DOM.divCodeOutput.textContent = appState.fileContents.map(fc => `********** ${fc.path} **********\n${fc.content}\n---`).join('\n');
    } else {
        const file = appState.fileContents.find(fc => fc.path === selectedFile);
        DOM.divCodeOutput.textContent = file ? `********** ${file.path} **********\n${file.content}` : 'File not found.';
    }
}