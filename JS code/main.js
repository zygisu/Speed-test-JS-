// Import and setup all modules on DOMContentLoaded
import { setupTyping } from './typing.js';
import { setupFileInput } from './fileinput.js';

document.addEventListener('DOMContentLoaded', () => {
    setupTyping();     
    setupFileInput();  
});