/**
 * DOM Element ID Constants
 * Centralizes all element IDs used throughout the application
 * to improve maintainability and reduce duplication
 */

// Main interface elements
export const ELEMENT_IDS = {
    // Display elements
    QUOTE_DISPLAY: 'quoteDisplay',
    QUOTE_INPUT: 'quoteInput',
    TIMER: 'timer',
    
    // Overlay elements
    OVERLAY: 'overlay',
    INTRO_OVERLAY: 'introOverlay',
    STATS: 'stats',
    STATS_TABLE: 'statsTable',
    
    // Buttons
    RANDOM_TEXT_BTN: 'randomTextBtn',
    START_TYPING_BTN: 'startTypingBtn',
    SHOW_STATS_BTN: 'showStatsBtn',
    RETURN_BTN: 'returnBtn',
    JSON_FILE_BTN: 'jsonFileBtn',
    
    // File input elements
    JSON_FILE_INPUT: 'jsonFileInput',
    FILE_ERROR: 'fileError',
    
    // Stats display elements
    WPM_STAT: 'wpmStat',
    MISTAKES_STAT: 'mistakesStat',
    ACCURACY_STAT: 'accuracyStat',
    CURRENT_JUDGEMENT: 'currentJudgement'
};

// Helper function to get element by ID with error checking
export function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with ID '${id}' not found`);
    }
    return element;
}

// Helper function to get element by constant
export function getElementByConstant(constantId) {
    return getElement(constantId);
}
