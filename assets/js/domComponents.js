

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

    function populateSelectOptions(selectElement, items, valueField, label, selectedItem) {
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
}