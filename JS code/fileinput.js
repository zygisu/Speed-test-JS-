import { ELEMENT_IDS, getElementByConstant } from './constants.js';
import { processJsonFile, QUOTE_SOURCES } from './dataService.js';

// Utility function to safely add event listeners without duplicates
function addEventListenerOnce(element, event, handler, listenerKey) {
    const key = listenerKey || `${event}_listener_added`;
    if (!element.dataset[key]) {
        element.addEventListener(event, handler);
        element.dataset[key] = "true";
    }
}

// File input logic for loading custom quotes from a JSON file
export function setupFileInput() {
    const jsonFileInput = getElementByConstant(ELEMENT_IDS.JSON_FILE_INPUT);
    const jsonFileBtn = getElementByConstant(ELEMENT_IDS.JSON_FILE_BTN);
    const fileError = getElementByConstant(ELEMENT_IDS.FILE_ERROR);
    const startTypingBtn = getElementByConstant(ELEMENT_IDS.START_TYPING_BTN);
    const randomTextBtn = getElementByConstant(ELEMENT_IDS.RANDOM_TEXT_BTN);

    addEventListenerOnce(jsonFileBtn, 'click', () => {
        jsonFileInput.click();
    });    addEventListenerOnce(jsonFileInput, 'change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const result = await processJsonFile(file);
            
            if (result.success) {
                window.jsonQuotes = result.quotes;
                window.quoteSource = QUOTE_SOURCES.JSON;
                jsonFileBtn.classList.add('selected');
                randomTextBtn.classList.remove('selected');
                startTypingBtn.disabled = false;
                fileError.textContent = '';
            } else {
                fileError.textContent = result.error;
                startTypingBtn.disabled = true;
                window.quoteSource = null;
                jsonFileBtn.classList.remove('selected');
                jsonFileInput.value = '';
            }
        } catch (error) {
            console.error('Unexpected error processing file:', error);
            fileError.textContent = 'An unexpected error occurred. Please try again.';
            startTypingBtn.disabled = true;
            window.quoteSource = null;
            jsonFileBtn.classList.remove('selected');
            jsonFileInput.value = '';
        }
    });
}