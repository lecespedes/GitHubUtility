// File: domComponents.js

export function initComponents(appSettings, DOM, cacheMan) {
    console.log('Initializing components');

    // Define component configurations
    const componentConfigs = {
        SelectOptions: [
            {
                element: 'selProfile',
                props: [
                    appSettings.profiles,
                    (s, index) => index,
                    s => `${s.OWNER}/${s.REPO}/${s.BRANCH}`,
                    appSettings.DEFAULT_PROFILE_INDEX
                ],
                method: populateSelectOptions  
            },
            {
                element: 'selFileType',
                props: [
                    appSettings.fileTypes,
                    type => type,
                    type => type,
                    appSettings.DEFAULT_FILE_TYPE
                ],
                method: populateSelectOptions              
            },
            {
                element: 'selFileList',
                props: [
                    cacheMan.getFileList(),
                    item => item.value,
                    item => item.text,
                    'All'
                ],
                method: populateSelectOptions
            }
        ],
        TabControls: [
            {
                props: ['tab-ctrl-main'],
                method: function(className) {
                    initTabControl(className);
                }
            }
        ]
    };

    // Initialize components
    Object.values(componentConfigs).forEach(group => {
        if (Array.isArray(group)) {
            group.forEach(({ element, props, method }) => {
                if (!method || typeof method !== 'function') {
                    console.warn(`Invalid method for component: ${element || JSON.stringify(props)}`);
                    return;
                }
                if (element) {
                    const selectElement = DOM[element];
                    if (!selectElement) {
                        console.warn(`DOM element not found: ${element}`);
                        return;
                    }
                    method(selectElement, ...props);
                } else {
                    method(...props);
                }
            });
        }
    });
    console.log('Components initialized');

    /**
     * Initializes tab controls for the application.
     * @param {string} className - Class name of tab controls.
     * @returns {void}
     */
    function initTabControl(className) {
        const tabs = document.querySelectorAll(`.${className}.tab-ctrl-btn`);
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => selectTab(className, index));
        });
    }

    /**
     * Selects a tab and updates the UI.
     * @param {string} tabClass - Class name of tab controls.
     * @param {number} index - Index of the tab to select.
     * @returns {void}
     */
    function selectTab(tabClass, index) {
        const tabs = document.querySelectorAll(`.${tabClass}.tab-ctrl-btn`);
        const panels = document.querySelectorAll(`.${tabClass}.tab-content`);
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tabs[index].classList.add('active');
        panels[index].classList.add('active');
    }
}
/**
 * Populates a select element with options.
 * @param {HTMLElement} selectElement - The select element to populate.
 * @param {Array} items - Array of items to create options from.
 * @param {Function|string} valueField - Function or field name to get option value.
 * @param {Function|string} label - Function or field name to get option text.
 * @param {string} selectedItem - Value of the selected option.
 * @returns {void}
 */
export function populateSelectOptions(selectElement, items, valueField, label, selectedItem) {
    console.log(`Populating select options for: ${selectElement.id}`);
    selectElement.innerHTML = '';
    items.forEach((item, index) => {
        const option = document.createElement('option');
        const value = typeof valueField === 'function' ? valueField(item, index) : item[valueField];
        const text = typeof label === 'function' ? label(item) : item[label];
        option.value = value;
        option.textContent = text;
        if (value === selectedItem) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}