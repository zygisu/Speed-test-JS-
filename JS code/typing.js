import { hideIntroOverlay, showIntroOverlay } from './ui.js';
import { showStats, resetStats } from './stats.js';

const RANDOM_QUOTE_API_URL = 'https://api.quotable.io/random';

window.sessionStats = {
    correctChars: 0,
    typedChars: 0,
    mistakes: 0,
    correctWords: 0,
    typedWords: 0
};

export function setupTyping() {
    // Get references to all relevant DOM elements
    const quoteDisplayElement = document.getElementById('quoteDisplay');
    const quoteInputElement = document.getElementById('quoteInput');
    const timerElement = document.getElementById('timer');
    const overlay = document.getElementById('overlay');
    const introOverlay = document.getElementById('introOverlay');
    const statsElement = document.getElementById('stats');
    const restartBtn = document.getElementById('restartBtn');
    const randomTextBtn = document.getElementById('randomTextBtn');
    const startTypingBtn = document.getElementById('startTypingBtn');
    const showStatsBtn = document.getElementById('showStatsBtn');
    const returnBtn = document.getElementById('returnBtn');
    const fileError = document.getElementById('fileError');
    const jsonFileBtn = document.getElementById('jsonFileBtn');

    window.timerStarted = false;
    window.timerInterval = null;
    window.startTime = null;
    window.TIME_LIMIT = 60; // Typing test duration in seconds
    window.totalTypedChars = 0;
    window.totalTypedWords = 0;
    window.totalCorrectWords = 0;
    window.totalCorrectChars = 0;
    window.totalMistakes = 0;
    window.prevInputLength = 0;
    window.quoteSource = null;
    window.jsonQuotes = [];
    window.currentJsonQuoteIndex = 0;
    window.quoteCompleted = false;
    window.testFinished = false;
    window.statsHistory = window.statsHistory || [];

    randomTextBtn.addEventListener('click', () => {
        window.quoteSource = 'api';
        randomTextBtn.classList.add('selected');
        jsonFileBtn.classList.remove('selected');
        startTypingBtn.disabled = false;
        fileError.textContent = '';
    });

    startTypingBtn.addEventListener('click', () => {
        if (!window.quoteSource) return;
        hideIntroOverlay();
        resetStats();
        // Reset session stats at the start of the test
        window.sessionStats = {
            correctChars: 0,
            typedChars: 0,
            mistakes: 0,
            correctWords: 0,
            typedWords: 0
        };
        window.testFinished = false;
        window.currentJsonQuoteIndex = 0;
        renderNewQuote();
        timerElement.innerText = 0;
        window.timerStarted = false;
        quoteInputElement.value = '';
        quoteInputElement.disabled = false;
        quoteInputElement.focus();
    });

    quoteInputElement.addEventListener('input', (e) => {
        handleTyping(e, quoteDisplayElement, quoteInputElement, timerElement);
    });

    restartBtn.addEventListener('click', () => {
        statsElement.style.display = 'none';
        showIntroOverlay();
        window.timerStarted = false;
        timerElement.innerText = 0;
        if (window.timerInterval) clearInterval(window.timerInterval);
        resetStats();
        quoteInputElement.value = '';
        quoteInputElement.disabled = true;
    });

    // Handle keyboard shortcuts for restarting or returning to menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (overlay.style.display !== 'flex' || statsElement.style.display === 'block')) {
            statsElement.style.display = 'none';
            overlay.style.display = 'none';
            window.timerStarted = false;
            timerElement.innerText = 0;
            if (window.timerInterval) clearInterval(window.timerInterval);
            resetStats();
            renderNewQuote();
            quoteInputElement.value = '';
            quoteInputElement.disabled = false;
            quoteInputElement.focus();
        }
        if (e.key === 'Escape') {
            statsElement.style.display = 'none';
            showIntroOverlay();
            window.timerStarted = false;
            timerElement.innerText = 0;
            if (window.timerInterval) clearInterval(window.timerInterval);
            resetStats();
            quoteInputElement.value = '';
            quoteInputElement.disabled = true;
        }
    });

    showStatsBtn.addEventListener('click', () => {
        introOverlay.style.display = 'none';
        statsElement.style.display = 'block';
        overlay.style.display = 'flex';
        quoteInputElement.disabled = true;
        showStats();
    });

    // Return to intro overlay from stats
    returnBtn.addEventListener('click', () => {
        statsElement.style.display = 'none';
        introOverlay.style.display = 'block';
        overlay.style.display = 'flex';
        document.getElementById('statsTable').innerHTML = '';
    });

    // Handles typing logic, character coloring, and per-quote stats   
    function handleTyping(e, quoteDisplayElement, quoteInputElement, timerElement) {
        // Start timer on first input
        if (!window.timerStarted) {
            window.startTime = Date.now();
            window.timerStarted = true;
            window.timerInterval = setInterval(() => {
                timerElement.innerText = Math.floor((Date.now() - window.startTime) / 1000);
                if (parseInt(timerElement.innerText) >= window.TIME_LIMIT) {
                    finishTest();
                }
            }, 1000);
        }

        const input = quoteInputElement.value;
        const quote = quoteDisplayElement.textContent;

        let displayHTML = '';
        for (let i = 0; i < quote.length; i++) {
            let charClass = '';
            if (i < input.length) {
                charClass = input[i] === quote[i] ? 'correct' : 'incorrect';
            }
            displayHTML += `<span class="${charClass}">${quote[i]}</span>`;
        }
        quoteDisplayElement.innerHTML = displayHTML;

        let correctChars = 0;
        let mistakes = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === quote[i]) {
                correctChars++;
            } else {
                mistakes++;
            }
        }
        window.totalCorrectChars = correctChars;
        window.totalMistakes = mistakes;
        window.totalTypedChars = input.length;

        window.totalTypedWords = input.trim().split(/\s+/).filter(Boolean).length;

        let correctWords = 0;
        const inputWords = input.trim().split(/\s+/);
        const quoteWords = quote.trim().split(/\s+/);
        for (let i = 0; i < inputWords.length; i++) {
            if (inputWords[i] === quoteWords[i]) correctWords++;
        }
        window.totalCorrectWords = correctWords;

        // If quote is finished, accumulate stats and load next quote
        if (input.length === quote.length) {
            window.sessionStats.correctChars += correctChars;
            window.sessionStats.typedChars += input.length;
            window.sessionStats.mistakes += mistakes;
            window.sessionStats.correctWords += correctWords;
            window.sessionStats.typedWords += input.trim().split(/\s+/).filter(Boolean).length;

            if (!window.testFinished && getTimeLeft() > 0) {
                renderNewQuote();
            }
        }
    }

    // Loads a new quote from the selected source
    async function renderNewQuote() {
        quoteInputElement.value = '';
        if (window.quoteSource === 'api') {
            try {
                const response = await fetch(RANDOM_QUOTE_API_URL);
                const data = await response.json();
                quoteDisplayElement.textContent = data.content;
            } catch (e) {
                quoteDisplayElement.textContent = "The quick brown fox jumps over the lazy dog. Api is bronken now, so please test your typing speed with this one quote.";
            }
        } else if (window.quoteSource === 'json' && window.jsonQuotes.length > 0) {
            quoteDisplayElement.textContent = window.jsonQuotes[window.currentJsonQuoteIndex % window.jsonQuotes.length];
            window.currentJsonQuoteIndex++;
        }
    }

    function finishTest() {
        if (window.testFinished) return;
        window.testFinished = true;

        // Ensures unfinished quote is included in the stats
        const input = document.getElementById('quoteInput').value;
        const quote = document.getElementById('quoteDisplay').textContent;

        let correctChars = 0;
        let mistakes = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === quote[i]) {
                correctChars++;
            } else {
                mistakes++;
            }
        }
        let correctWords = 0;
        const inputWords = input.trim().split(/\s+/);
        const quoteWords = quote.trim().split(/\s+/);
        for (let i = 0; i < inputWords.length; i++) {
            if (inputWords[i] === quoteWords[i]) correctWords++;
        }
        window.sessionStats.correctChars += correctChars;
        window.sessionStats.typedChars += input.length;
        window.sessionStats.mistakes += mistakes;
        window.sessionStats.correctWords += correctWords;
        window.sessionStats.typedWords += input.trim().split(/\s+/).filter(Boolean).length;

        if (window.timerInterval) clearInterval(window.timerInterval);
        quoteInputElement.disabled = true;

        // Use accumulated session stats for the summary
        window.totalCorrectChars = window.sessionStats.correctChars;
        window.totalTypedChars = window.sessionStats.typedChars;
        window.totalMistakes = window.sessionStats.mistakes;
        window.totalCorrectWords = window.sessionStats.correctWords;
        window.totalTypedWords = window.sessionStats.typedWords;

        const TIME_LIMIT = window.TIME_LIMIT || 60;
        const minutes = TIME_LIMIT / 60;
        const wpm = Math.round((window.totalTypedChars / 5) / minutes || 0);
        const accuracy = window.totalTypedChars > 0
            ? Math.round(100 * window.totalCorrectChars / window.totalTypedChars)
            : 100;
        const statsHistory = JSON.parse(localStorage.getItem('typingStatsHistory')) || [];
        statsHistory.push({
            date: new Date().toLocaleString(),
            wpm,
            accuracy,
            mistakes: window.totalMistakes
        });
        localStorage.setItem('typingStatsHistory', JSON.stringify(statsHistory));
        window.statsHistory = statsHistory;

        showStats();

        statsElement.style.display = 'block';
        overlay.style.display = 'flex';
        introOverlay.style.display = 'none';
    }

    function getTimeLeft() {
        if (!window.startTime) return window.TIME_LIMIT;
        const elapsed = Math.floor((Date.now() - window.startTime) / 1000);
        return Math.max(0, window.TIME_LIMIT - elapsed);
    }
}