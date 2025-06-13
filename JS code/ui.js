export function setupUI() {
}

// Shows the intro overlay and disables input until a source is chosen
export function showIntroOverlay() {
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('introOverlay').style.display = 'block';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('quoteInput').disabled = true;

    // Remove selection from quote source buttons
    document.getElementById('randomTextBtn').classList.remove('selected');
    document.getElementById('jsonFileBtn').classList.remove('selected');
    window.quoteSource = null;
}

// Hides the intro overlay and enables the typing input
export function hideIntroOverlay() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('introOverlay').style.display = 'none';
    document.getElementById('quoteInput').disabled = false;
}