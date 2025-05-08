// File: domComponents.js

export function initComponents(appSettings, DOM) {
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
                method: function(selectElement, ...props) {
                    populateSelectOptions(selectElement, ...props);
                }
            },
            {
                element: 'selFileType',
                props: [
                    appSettings.fileTypes,
                    type => type,
                    type => type,
                    appSettings.DEFAULT_FILE_TYPE
                ],
                method: function(selectElement, ...props) {
                    populateSelectOptions(selectElement, ...props);
                }
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
                    method.call(null, selectElement, ...props);
                } else {
                    method.call(null, ...props);
                }
            });
        }
    });

    console.log('Components initialized');

    // Helper functions
    function initTabControl(className) {
        console.log(`Initializing tab control: ${className}`);
        const tabs = document.querySelectorAll(`.${className}.tab-ctrl-btn`);
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => selectTab(className, index));
        });
    }

    function selectTab(tabClass, index) {
        console.log(`Selecting tab: ${tabClass}, index: ${index}`);
        const tabs = document.querySelectorAll(`.${tabClass}.tab-ctrl-btn`);
        const panels = document.querySelectorAll(`.${tabClass}.tab-content`);
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tabs[index].classList.add('active');
        panels[index].classList.add('active');
    }

    

}