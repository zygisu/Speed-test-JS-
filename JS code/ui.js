import { ELEMENT_IDS, getElementByConstant } from './constants.js';

// Shows the intro overlay and disables input until a source is chosen
export function showIntroOverlay() {
    getElementByConstant(ELEMENT_IDS.OVERLAY).style.display = 'flex';
    getElementByConstant(ELEMENT_IDS.INTRO_OVERLAY).style.display = 'block';
    getElementByConstant(ELEMENT_IDS.STATS).style.display = 'none';
    getElementByConstant(ELEMENT_IDS.QUOTE_INPUT).disabled = true;

    // Remove selection from quote source buttons
    getElementByConstant(ELEMENT_IDS.RANDOM_TEXT_BTN).classList.remove('selected');
    getElementByConstant(ELEMENT_IDS.JSON_FILE_BTN).classList.remove('selected');
    window.quoteSource = null;
}

// Hides the intro overlay and enables the typing input
export function hideIntroOverlay() {
    getElementByConstant(ELEMENT_IDS.OVERLAY).style.display = 'none';
    getElementByConstant(ELEMENT_IDS.INTRO_OVERLAY).style.display = 'none';
    getElementByConstant(ELEMENT_IDS.QUOTE_INPUT).disabled = false;
}