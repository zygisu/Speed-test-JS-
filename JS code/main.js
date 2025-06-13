// Import and setup all modules on DOMContentLoaded
import { setupUI } from './ui.js';
import { setupTyping } from './typing.js';
import { setupFileInput } from './fileinput.js';

document.addEventListener('DOMContentLoaded', () => {
    setupUI();    
    setupTyping();     
    setupFileInput();  
});