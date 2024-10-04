// Author: Habib Mhamadi
// Email: habibmhamadi@gmail.com

function MultiSelectTag(el, customs = { shadow: false, rounded: true }) {
    // Initialize variables
    var element = null;
    var options = null;
    var customSelectContainer = null;
    var wrapper = null;
    var btnContainer = null;
    var body = null;
    var inputContainer = null;
    var inputBody = null;
    var input = null;
    var button = null;
    var drawer = null;
    var ul = null;
    var multiSelectPlaceholderHtml =
        '<div class="selectPlaceholder">Select One or More</div>';
    var singleSelectPlaceholderHtml =
        '<div class="selectPlaceholder">Select One</div>';

    // Customize tag colors
    var tagColor = customs.tagColor || {};
    tagColor.textColor = tagColor.textColor || '#FF5D29';
    tagColor.borderColor = tagColor.borderColor || '#FF5D29';
    tagColor.bgColor = tagColor.bgColor || '#FFE9E2';

    // Initialize DOM Parser
    var domParser = new DOMParser();

    // Initialize
    init();

    function init() {
        // DOM element initialization
        element = document.getElementById(el);

        createElements();
        initOptions();
        enableItemSelection();
        syncValues(false);

        // Event listeners
        // Show/hide the list options if button clicked
        button.addEventListener('click', () => {
            if (drawer.classList.contains('hidden')) {
                initOptions();
                enableItemSelection();
                showDrawer();
                input.focus();
            } else {
                hideDrawer();
            }
        });

        // Show/hide the list options if options box clicked
        inputContainer.addEventListener('click', () => {
            if (drawer.classList.contains('hidden')) {
                initOptions();
                enableItemSelection();
                drawer.classList.remove('hidden');
                input.focus();
            } else {
                drawer.classList.add('hidden');
            }
        });

        input.addEventListener('keyup', (e) => {
            initOptions(e.target.value);
            enableItemSelection();
        });

        input.addEventListener('keydown', (e) => {
            if (
                e.key === 'Backspace' &&
                !e.target.value &&
                inputContainer.childElementCount > 1
            ) {
                const child =
                    body.children[inputContainer.childElementCount - 2]
                        .firstChild;
                const option = options.find(
                    (op) => op.value == child.dataset.value,
                );
                option.selected = false;
                removeTag(child.dataset.value);
                syncValues();
            }
        });

        window.addEventListener('click', (e) => {
            if (!customSelectContainer.contains(e.target)) {
                if (
                    e.target.nodeName !== 'LI' &&
                    e.target.getAttribute('class') !== 'input_checkbox'
                ) {
                    // hide the list option only if we click outside of it
                    drawer.classList.add('hidden');
                } else {
                    // enable again the click on the list options
                    enableItemSelection();
                }
            }
        });
    }

    function createElements() {
        // Create custom elements
        options = getOptions();
        element.classList.add('hidden');

        // .multi-select-tag
        customSelectContainer = document.createElement('div');
        customSelectContainer.classList.add('mult-select-tag');

        // .container
        wrapper = document.createElement('div');
        wrapper.classList.add('wrapper');

        // body
        body = document.createElement('div');
        body.classList.add('body');
        if (customs.shadow) {
            body.classList.add('shadow');
        }
        if (customs.rounded) {
            body.classList.add('rounded');
        }

        // .input-container
        inputContainer = document.createElement('div');
        if (isMultiSelect()) {
            inputContainer.innerHTML = multiSelectPlaceholderHtml;
        } else {
            inputContainer.innerHTML = singleSelectPlaceholderHtml;
        }
        inputContainer.classList.add('input-container');

        // input
        input = document.createElement('input');
        input.classList.add('input');
        input.placeholder = `${customs.placeholder || 'Search...'}`;

        inputBody = document.createElement('inputBody');
        inputBody.classList.add('input-body');
        inputBody.append(input);

        body.append(inputContainer);

        // .btn-container
        btnContainer = document.createElement('div');
        btnContainer.classList.add('btn-container');

        // button
        button = document.createElement('button');
        button.type = 'button';
        btnContainer.append(button);

        const icon = domParser.parseFromString(
            `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 21 6 15"></polyline>
            </svg>`,
            'image/svg+xml',
        ).documentElement;

        button.append(icon);

        body.append(btnContainer);
        wrapper.append(body);

        drawer = document.createElement('div');
        drawer.classList.add(...['drawer', 'hidden']);
        if (customs.shadow) {
            drawer.classList.add('shadow');
        }
        if (customs.rounded) {
            drawer.classList.add('rounded');
        }
        drawer.append(inputBody);
        ul = document.createElement('ul');

        drawer.appendChild(ul);

        customSelectContainer.appendChild(wrapper);
        customSelectContainer.appendChild(drawer);

        // Place TailwindTagSelection after the element
        if (element.nextSibling) {
            element.parentNode.insertBefore(
                customSelectContainer,
                element.nextSibling,
            );
        } else {
            element.parentNode.appendChild(customSelectContainer);
        }
    }

    function createElementInSelectList(option, val, selected = false) {
        // Create a <li> elmt in the drop-down list,
        // selected parameters tells if the checkbox need to be selected and the bg color changed
        const li = document.createElement('li');
        li.innerHTML =
            "<input type='checkbox' style='margin:0 0.5em 0 0' class='input_checkbox'>"; // add the checkbox at the left of the <li>
        li.innerHTML += option.label;
        li.dataset.value = option.value;
        const checkbox = li.firstChild;
        checkbox.dataset.value = option.value;

        // For search
        if (val && option.label.toLowerCase().startsWith(val.toLowerCase())) {
            ul.appendChild(li);
        } else if (!val) {
            ul.appendChild(li);
        }

        // Change bg color (#579aec) and checking the checkbox
        if (selected) {
            li.style.backgroundColor = '#579aec';
            checkbox.checked = true;
        }
    }

    /**
     * Rebuild the options list
     * @param {String} val value to search
     */
    function initOptions(val = null) {
        ul.innerHTML = '';
        for (var option of options) {
            // if option already selected
            if (option.selected) {
                !isTagSelected(option.value) && createTag(option);

                // Create an option in the list, but with different color
                createElementInSelectList(option, val, true);
            } else {
                createElementInSelectList(option, val);
            }
        }
    }

    function createTag(option) {
        // Create and show selected item as tag
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item-container');
        itemDiv.style.color = tagColor.textColor || '#2c7a7b';
        itemDiv.style.borderColor = tagColor.borderColor || '#81e6d9';
        itemDiv.style.background = tagColor.bgColor || '#e6fffa';
        const itemLabel = document.createElement('div');
        itemLabel.classList.add('item-label');
        itemLabel.style.color = tagColor.textColor || '#2c7a7b';
        itemLabel.innerHTML = option.label;
        itemLabel.dataset.value = option.value;
        const itemClose = domParser.parseFromString(
            `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="item-close-svg">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>`,
            'image/svg+xml',
        ).documentElement;

        itemClose.addEventListener('click', (e) => {
            deselectOption(options.find((op) => op.value == option.value));
        });

        itemDiv.appendChild(itemLabel);
        itemDiv.appendChild(itemClose);

        removeIfNeededSelectPlaceholder();

        inputContainer.append(itemDiv);

        // hide drawer if single-select
        if (!isMultiSelect()) {
            hideDrawer();
        }
    }

    /**
     * 1. Removes a tag from the input container
     * 2. Deselects the option in the list
     * 3. Updates the final values
     * @param {Object} option option to be deselected. Default is null
     */
    function deselectOption(option = null) {
        if (option) {
            option.selected = false;
            removeTag(option.value);
            initOptions();
            syncValues();
        }
    }

    /**
     * Add click listener to each of the options
     */
    function enableItemSelection() {
        // Add click listener to the list items
        for (var li of ul.children) {
            li.addEventListener('click', (e) => {
                // If clicked option is not selected
                if (
                    options.find((o) => o.value == e.target.dataset.value)
                        .selected === false
                ) {
                    // If is a single-select control, deselect all other options
                    if (!isMultiSelect()) {
                        clearAllSelections();
                    }

                    // select the option
                    selectItem(true, e.target.dataset.value);
                } else {
                    // if clicked option is already selected, deselect it
                    selectItem(false, e.target.dataset.value);
                    removeTag(e.target.dataset.value);
                }
            });
        }
    }

    function selectItem(status, val) {
        options.find((o) => o.value == val).selected = status;
        clearSearchBox();
        initOptions();
        syncValues();
    }

    /**
     * 1. Deselects all options
     * 2. Removes all tags from the input container
     */
    function clearAllSelections() {
        const selectedOptions = options.filter((o) => o.selected);

        for (var option of selectedOptions) {
            option.selected = false;
            removeTag(option.value);
        }
        syncValues();
    }

    /**
     * Check all items in the tag box for the tag with the matching value to the one passed in
     * Skip the selectPlaceholder item if present
     * @param {String} val option value to check
     * @returns {Boolean} true if the tag is already selected, false otherwise
     */
    function isTagSelected(val) {
        // If the tag is already selected
        for (var child of inputContainer.children) {
            // Skip selectPlaceholder if present
            if (child.classList.contains('selectPlaceholder')) {
                continue;
            }
            if (
                !child.classList.contains('input-body') &&
                child.firstChild.dataset.value == val
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Remove a tag from the input container
     * @param {String} val option value to remove
     */
    function removeTag(val) {
        for (var child of inputContainer.children) {
            if (val) {
                // Remove only the selected item
                if (
                    !child.classList.contains('input-body') &&
                    child.firstChild.dataset.value == val
                ) {
                    inputContainer.removeChild(child);
                }
            } else {
                inputContainer.removeChild(child);
            }
        }
        addIfNeededSelectPlaceholder();
    }

    function removeIfNeededSelectPlaceholder() {
        // Remove the placeholder text
        if (inputContainer.firstChild.classList.contains('selectPlaceholder')) {
            inputContainer.removeChild(inputContainer.firstChild);
        }
    }

    function addIfNeededSelectPlaceholder() {
        // Add the placeholder text
        if (!inputContainer.hasChildNodes()) {
            inputContainer.innerHTML = setPlaceholder();
        }
    }

    function setPlaceholder() {
        // Set the placeholder text
        if (isMultiSelect()) {
            return multiSelectPlaceholderHtml;
        } else {
            return singleSelectPlaceholderHtml;
        }
    }

    /**
     * Synchronize the selections between the custom select and the underlying HTML select element
     * @param {Boolean} fireEvent if true, fire the onChange event
     */
    function syncValues(fireEvent = true) {
        // Update element final values
        selected_values = [];
        for (var i = 0; i < options.length; i++) {
            element.options[i].selected = options[i].selected;
            if (options[i].selected) {
                selected_values.push({
                    label: options[i].label,
                    value: options[i].value,
                });
            }
        }
        if (fireEvent && customs.hasOwnProperty('onChange')) {
            customs.onChange(selected_values);
        }
    }

    function getOptions() {
        // Map element options
        return [...element.options].map((op) => {
            return {
                value: op.value,
                label: op.label,
                selected: op.selected,
            };
        });
    }

    function isMultiSelect() {
        if (customs.max === 1) {
            return false;
        } else {
            return true;
        }
    }

    function hideDrawer() {
        drawer.classList.add('hidden');
    }

    function showDrawer() {
        drawer.classList.remove('hidden');
    }

    function clearSearchBox() {
        input.value = '';
    }
}
