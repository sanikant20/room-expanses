export const setupEnterAsTab = () => {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;

        if (e.shiftKey) return;

        let activeElement = document.activeElement;

        if (activeElement?.shadowRoot) {
            activeElement = activeElement.shadowRoot.activeElement || activeElement;
        }

        const shouldSkip = [
            'TEXTAREA',
            'BUTTON',
        ];

        if (activeElement && shouldSkip.includes(activeElement.tagName)) {
            return;
        }

        if (activeElement?.tagName === 'INPUT' && activeElement?.type === 'submit') {
            return;
        }

        if (activeElement?.closest('.MuiMenu-root, .MuiDialog-root, [role="menu"], [role="dialog"]')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const focusableSelectors = [
            'input:not([disabled]):not([type="hidden"])',
            'button:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]:not([disabled])',
            '[tabindex]:not([tabindex="-1"]):not([disabled])',
            '.MuiInputBase-root',
            '.MuiInput-root',
            '.MuiFilledInput-root',
            '.MuiOutlinedInput-root',
            '.MuiInputBase-input',
            'input.MuiInput-input',
            'input.MuiFilledInput-input',
            'input.MuiOutlinedInput-input',
            '.MuiButton-root',
            '.MuiIconButton-root',
            '.MuiButtonBase-root',
            '.MuiLoadingButton-root',
            '.MuiSelect-root',
            '.MuiSelect-select',
            '.MuiNativeSelect-root',
            '.MuiNativeSelect-select',
            '.MuiCheckbox-root',
            '.MuiRadio-root',
            '.MuiSwitch-root',
            '.MuiFormControlLabel-root input',
            'input[type="checkbox"]',
            'input[type="radio"]',
            '.MuiAutocomplete-root',
            '.MuiAutocomplete-input',
            '.MuiAutocomplete-endAdornment button',
            '.MuiDatePicker-root input',
            '.MuiTimePicker-root input',
            '.MuiDateTimePicker-root input',
            '.MuiMobileDateTimePicker-root input',
            '.MuiDesktopDatePicker-root input',
            '[role="textbox"]',
            '.MuiSlider-root',
            '.MuiSlider-thumb',
            'input[type="range"]',
            '.MuiTab-root',
            '.MuiTab-wrapper',
            '[role="tab"]',
            '.MuiTableCell-root button',
            '.MuiTableSortLabel-root',
            '.MuiTablePagination-root input',
            '.MuiTablePagination-root select',
            '.MuiRating-root',
            '.MuiRating-icon',
            '.MuiTransferList-root button',
            '.MuiList-root button',
            '.MuiTreeItem-root',
            '.MuiTreeItem-content',
            '.MuiAccordionSummary-root',
            '.MuiAccordionSummary-button',
            '.MuiStepButton-root',
            '.MuiStepIcon-root',
            '.MuiAlert-action button',
            '.MuiDialogActions-root button',
            '.MuiSnackbar-root button',
            '.MuiCardActions-root button',
            '.MuiPickersDay-root',
            '.MuiPickersYear-yearButton',
            '.MuiPickersMonth-monthButton',
            '.MuiClock-pin',
            '.MuiClockPointer-root',
            '[role="button"]',
            '[role="checkbox"]',
            '[role="radio"]',
            '[role="switch"]',
            '[role="slider"]',
            '[role="tab"]',
            '[role="menuitem"]',
            '[role="option"]',
            '[role="treeitem"]',
            '[role="combobox"]',
            '[role="spinbutton"]',
            '[contenteditable="true"]',
            'textarea',
            'select',
            'datalist',
            'output',
            '.MuiDataGrid-cell:focus',
            '.MuiDataGrid-columnHeader:focus',
            '.MuiDataGrid-filterInput',
            '.MuiDataGrid-toolbar button',
            '.MuiCalendarPicker-root button',
            '.MuiYearPicker-root button',
            '.MuiMonthPicker-root button',
            '.MuiSpeedDialAction-root',
            '.MuiFab-root',
            '.MuiPaginationItem-root',
            '.MuiToggleButton-root',
            '.MuiChip-root',
            '.MuiBadge-root button',
            '.MuiAvatar-root button',
            '.MuiListSubheader-root button'
        ].join(',');

        let focusableElements = Array.from(document.querySelectorAll(focusableSelectors));

        const tabindexElements = Array.from(document.querySelectorAll('[tabindex]:not([tabindex="-1"])'));
        focusableElements = [...focusableElements, ...tabindexElements];

        focusableElements = [...new Map(focusableElements.map(el => [el, el])).values()]
            .filter(el => {
                const isHidden = el.offsetWidth === 0 || el.offsetHeight === 0;
                const isDisabled = el.hasAttribute('disabled') ||
                    el.getAttribute('aria-disabled') === 'true' ||
                    el.classList?.contains('Mui-disabled');
                const isInvisible = getComputedStyle(el).visibility === 'hidden';
                const isHiddenParent = el.closest('[aria-hidden="true"]');

                return !isHidden && !isDisabled && !isInvisible && !isHiddenParent;
            })
            .sort((a, b) => {
                const tabA = parseInt(a.getAttribute('tabindex')) || 0;
                const tabB = parseInt(b.getAttribute('tabindex')) || 0;
                if (tabA !== tabB) return tabA - tabB;

                const positionA = Array.from(document.querySelectorAll('*')).indexOf(a);
                const positionB = Array.from(document.querySelectorAll('*')).indexOf(b);
                return positionA - positionB;
            });

        let currentIndex = focusableElements.findIndex(el => el === activeElement);

        if (currentIndex === -1 && activeElement) {
            currentIndex = focusableElements.findIndex(el =>
                el.contains(activeElement) || activeElement.closest?.('.MuiInputBase-root') === el
            );
        }

        if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % focusableElements.length;
            const nextElement = focusableElements[nextIndex];

            if (nextElement) {
                if (nextElement.classList?.contains('MuiInputBase-root')) {
                    const input = nextElement.querySelector('input, textarea, [role="combobox"]');
                    if (input) {
                        input.focus();
                        input.select?.();
                    } else {
                        nextElement.focus();
                    }
                } else if (nextElement.classList?.contains('MuiCheckbox-root') ||
                    nextElement.classList?.contains('MuiRadio-root')) {
                    nextElement.focus();
                } else if (nextElement.classList?.contains('MuiSelect-select')) {
                    nextElement.focus();
                } else {
                    nextElement.focus();
                }

                nextElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-main').trim() || '#1976d2';
                nextElement.style.outline = `0.5px solid ${primaryColor}`;
                setTimeout(() => {
                    nextElement.style.outline = '';
                }, 200);
            }
        } else if (focusableElements[0]) {
            focusableElements[0].focus();
        }
    }, true);
};
