// File input logic for loading custom quotes from a JSON file
export function setupFileInput() {
    // Get references to relevant DOM elements
    const jsonFileInput = document.getElementById('jsonFileInput');
    const jsonFileBtn = document.getElementById('jsonFileBtn');
    const fileError = document.getElementById('fileError');
    const startTypingBtn = document.getElementById('startTypingBtn');
    const randomTextBtn = document.getElementById('randomTextBtn');

    // Ensure the file button only gets one click listener
    if (!jsonFileBtn.dataset.listenerAdded) {
        // When the file button is clicked, trigger the file input
        jsonFileBtn.addEventListener('click', () => {
            jsonFileInput.click();
        });
        jsonFileBtn.dataset.listenerAdded = "true";
    }

    jsonFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const data = JSON.parse(evt.target.result);
                if (!Array.isArray(data) || !data.every(q => typeof q === 'string' && q.trim().length > 0)) {
                    throw new Error('Invalid JSON format.');
                }
                window.jsonQuotes = data;
                window.quoteSource = 'json';
                jsonFileBtn.classList.add('selected');
                randomTextBtn.classList.remove('selected');
                startTypingBtn.disabled = false;
                fileError.textContent = '';
            } catch (err) {
                fileError.textContent = 'Invalid JSON file. Must be an array of non-empty strings.';
                startTypingBtn.disabled = true;
                window.quoteSource = null;
            }
        };
        reader.readAsText(file);
    });
}