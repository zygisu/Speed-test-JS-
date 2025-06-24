import { hideIntroOverlay, showIntroOverlay } from './ui.js';
import { showStats, resetStats } from './stats.js';
import { getQuote, QUOTE_SOURCES } from './dataService.js';

window.sessionStats = {
    correctChars: 0,
    typedChars: 0,
    mistakes: 0,
    correctWords: 0,
    typedWords: 0
};

export function setupTyping() { 
    const quoteDisplayElement = document.getElementById('quoteDisplay');
    const quoteInputElement = document.getElementById('quoteInput');
    const timerElement = document.getElementById('timer');
    const overlay = document.getElementById('overlay');
    const introOverlay = document.getElementById('introOverlay');
    const statsElement = document.getElementById('stats');
    const randomTextBtn = document.getElementById('randomTextBtn');
    const startTypingBtn = document.getElementById('startTypingBtn');
    const showStatsBtn = document.getElementById('showStatsBtn');
    const returnBtn = document.getElementById('returnBtn');
    const fileError = document.getElementById('fileError');
    const jsonFileBtn = document.getElementById('jsonFileBtn');

    // class or module parent better to use
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
        window.quoteSource = QUOTE_SOURCES.API;
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
        timerElement.innerText = window.TIME_LIMIT;
        window.timerStarted = false;
        quoteInputElement.value = '';
        quoteInputElement.disabled = false;
        quoteInputElement.focus();
    });    quoteInputElement.addEventListener('input', (e) => {
        handleTyping(e, quoteDisplayElement, quoteInputElement, timerElement);
    });

    // Prevent pasting into the quote input field
    quoteInputElement.addEventListener('paste', (e) => {
        e.preventDefault();
        return false;
    });    // Also prevent context menu (right-click) to disable paste option
    quoteInputElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // Prevent Enter key from creating new lines in the input field
    quoteInputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            return false;
        }    });

    // Handle keyboard shortcuts for restarting or returning to menu
    document.addEventListener('keydown', (e) => {
        // Enter key restarts the test when user is not on the intro screen
        const isNotOnIntroScreen = introOverlay.style.display !== 'block';
        
        if (e.key === 'Enter' && isNotOnIntroScreen) {
            e.preventDefault();
            overlay.style.display = 'none';
            window.timerStarted = false;
            timerElement.innerText = window.TIME_LIMIT;
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
            timerElement.innerText = window.TIME_LIMIT;
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

    function startTimer(timerElement) {
        if (!window.timerStarted) {
            window.startTime = Date.now();
            window.timerStarted = true;
            window.timerInterval = setInterval(() => {
                const elapsedSeconds = Math.floor((Date.now() - window.startTime) / 1000);
                const remainingSeconds = window.TIME_LIMIT - elapsedSeconds;
                timerElement.innerText = Math.max(0, remainingSeconds);
                if (remainingSeconds <= 0) {
                    finishTest();
                }
            }, 1000);
        }
    }    // Updates the visual display with correct/incorrect character highlighting
    function updateDisplay(input, quote, quoteDisplayElement) {
        // Find word boundaries and current word position
        const words = quote.split(/(\s+)/); // Split but keep whitespace
        let charIndex = 0;
        let currentWordIndex = -1;
        
        // Find which word currently typing
        for (let i = 0; i < words.length; i++) {
            const wordLength = words[i].length;
            if (input.length >= charIndex && input.length <= charIndex + wordLength) {
                currentWordIndex = i;
                break;
            }
            charIndex += wordLength;
        }
        
        let displayHTML = '';
        charIndex = 0;
        
        // Build display HTML with word-level and character-level highlighting
        for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
            const word = words[wordIndex];
            const isCurrentWord = wordIndex === currentWordIndex;
            const wordStartClass = isCurrentWord ? 'current-word' : '';
            
            if (wordStartClass) {
                displayHTML += `<span class="${wordStartClass}">`;
            }
            
            // Add character-level highlighting within the word
            for (let i = 0; i < word.length; i++) {
                let charClass = '';
                if (charIndex < input.length) {
                    charClass = input[charIndex] === word[i] ? 'correct' : 'incorrect';
                }
                displayHTML += `<span class="${charClass}">${word[i]}</span>`;
                charIndex++;
            }
            
            if (wordStartClass) {
                displayHTML += '</span>';
            }
        }
        
        quoteDisplayElement.innerHTML = displayHTML;
    }

    // Calculates and updates typing statistics
    function calculateStats(input, quote) {
        let correctChars = 0;
        let mistakes = 0;
        
        // Count character-level stats
        for (let i = 0; i < input.length; i++) {
            if (input[i] === quote[i]) {
                correctChars++;
            } else {
                mistakes++;
            }
        }
        
        // Update global stats
        window.totalCorrectChars = correctChars;
        window.totalMistakes = mistakes;
        window.totalTypedChars = input.length;
        window.totalTypedWords = input.trim().split(/\s+/).filter(Boolean).length;

        // Count word-level stats
        let correctWords = 0;
        const inputWords = input.trim().split(/\s+/);
        const quoteWords = quote.trim().split(/\s+/);
        for (let i = 0; i < inputWords.length; i++) {
            if (inputWords[i] === quoteWords[i]) correctWords++;
        }
        window.totalCorrectWords = correctWords;

        return { correctChars, mistakes, correctWords };
    }

    // Checks if the current quote is completed and handles progression
    function checkQuoteCompletion(input, quote, stats) {
        if (input.length === quote.length) {
            // Accumulate session stats
            window.sessionStats.correctChars += stats.correctChars;
            window.sessionStats.typedChars += input.length;
            window.sessionStats.mistakes += stats.mistakes;
            window.sessionStats.correctWords += stats.correctWords;
            window.sessionStats.typedWords += input.trim().split(/\s+/).filter(Boolean).length;

            // Load next quote if test is still running
            if (!window.testFinished && getTimeLeft() > 0) {
                renderNewQuote();
            }
        }
    }

    // Main typing handler - coordinates all typing-related updates
    function handleTyping(e, quoteDisplayElement, quoteInputElement, timerElement) {
        startTimer(timerElement);

        const input = quoteInputElement.value;
        const quote = quoteDisplayElement.textContent;

        updateDisplay(input, quote, quoteDisplayElement);
        const stats = calculateStats(input, quote);
        checkQuoteCompletion(input, quote, stats);
    }    // Loads a new quote from the selected source
    async function renderNewQuote() {
        quoteInputElement.value = '';
        
        try {
            const result = await getQuote(
                window.quoteSource,
                window.jsonQuotes,
                window.currentJsonQuoteIndex
            );
            
            quoteDisplayElement.textContent = result.quote;
            window.currentJsonQuoteIndex = result.nextIndex;
        } catch (error) {
            console.error('Error loading quote:', error);
            quoteDisplayElement.textContent = "Error loading quote. Please try again.";
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