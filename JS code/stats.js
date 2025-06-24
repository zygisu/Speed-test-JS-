import { ELEMENT_IDS, getElementByConstant } from './constants.js';

function getTypingJudgement(currentStats, previousStats) {
    const { wpm: currentWpm, accuracy: currentAccuracy } = currentStats;
    const { wpm: prevWpm, accuracy: prevAccuracy } = previousStats;
    
    // WPM weight: 70%, Accuracy weight: 30% (common in typing tests)
    const currentScore = (currentWpm * 0.7) + (currentAccuracy * 0.3);
    const prevScore = (prevWpm * 0.7) + (prevAccuracy * 0.3);
    
    // Define improvement thresholds
    const wpmImprovement = currentWpm - prevWpm;
    const accuracyDrop = prevAccuracy - currentAccuracy;
    
    // Typing test judgement logic:
    // 1. Significant accuracy drop (>5%) = Worse (even if WPM improved)
    // 2. WPM improved by 3+ with accuracy maintained = Better
    // 3. Overall weighted score improvement = Better
    // 4. Similar performance (within 2% overall score) = Same
    // 5. Performance decline = Worse
    
    if (accuracyDrop > 5) {
        return '<span class="worse">Focus on Accuracy</span>';
    } else if (wpmImprovement >= 3 && accuracyDrop <= 2) {
        return '<span class="better">Great Improvement!</span>';
    } else if (currentScore > prevScore * 1.02) {
        return '<span class="better">Better</span>';
    } else if (currentScore >= prevScore * 0.98) {
        return '<span class="same">Keep Practicing</span>';
    } else {
        return '<span class="worse">Try Again</span>';
    }
}

// Show stats overlay and optionally the stats table/history
export function showStats(showTable = true) {
    const TIME_LIMIT = window.TIME_LIMIT || 60;
    const totalCorrectChars = window.totalCorrectChars || 0;
    const totalTypedChars = window.totalTypedChars || 0;
    const totalMistakes = window.totalMistakes || 0;

    // Calculate WPM and accuracy
    const minutes = TIME_LIMIT / 60;
    const wpm = Math.round((totalTypedChars / 5) / minutes || 0);
    const accuracy = totalTypedChars > 0
        ? Math.round(100 * totalCorrectChars / totalTypedChars)
        : 100;    getElementByConstant(ELEMENT_IDS.WPM_STAT).textContent = wpm;
    getElementByConstant(ELEMENT_IDS.MISTAKES_STAT).textContent = totalMistakes;
    getElementByConstant(ELEMENT_IDS.ACCURACY_STAT).textContent = accuracy;

    // Load stats history from localStorage
    let statsHistory = JSON.parse(localStorage.getItem('typingStatsHistory')) || [];
    window.statsHistory = statsHistory;

    if (!showTable) {
        statsHistory.push({
            wpm: Number(wpm),
            accuracy: Number(accuracy),
            mistakes: totalMistakes,
            date: new Date().toLocaleString()
        });
        if (statsHistory.length > 10) {
            statsHistory = statsHistory.slice(statsHistory.length - 10);
        }
        localStorage.setItem('typingStatsHistory', JSON.stringify(statsHistory));
        window.statsHistory = statsHistory;
    }    if (!showTable && statsHistory.length > 0) {
        const last = statsHistory[statsHistory.length - 1];
        let judgement = '-';
        if (statsHistory.length > 1) {
            const prev = statsHistory[statsHistory.length - 2];
            judgement = getTypingJudgement(last, prev);
        }
        getElementByConstant(ELEMENT_IDS.STATS_TABLE).innerHTML = `
            <table class="stats-table">
                <tr><th>WPM</th><td>${last.wpm}</td></tr>
                <tr><th>Mistakes</th><td>${last.mistakes}</td></tr>
                <tr><th>Accuracy (%)</th><td>${last.accuracy}</td></tr>
                <tr><th>Judgement</th><td>${judgement}</td></tr>
            </table>
        `;
        return;
    }

    if (showTable) {
        showStatsTable(statsHistory);
    }
}

// Resets all global stats variables for a new test
export function resetStats() {
    window.totalTypedChars = 0;
    window.totalTypedWords = 0;
    window.totalCorrectWords = 0;
    window.totalCorrectChars = 0;
    window.totalMistakes = 0;
    window.currentJsonQuoteIndex = 0;
}

function showStatsTable(statsHistory) {
    const statsTableDiv = getElementByConstant(ELEMENT_IDS.STATS_TABLE);
    if (!statsTableDiv) return;

    if (statsHistory.length < 2) {
        statsTableDiv.innerHTML = '';
        return;
    }

    let tableHtml = `
        <table class="stats-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>WPM</th>
                    <th>Accuracy (%)</th>
                    <th>Judgement</th>
                </tr>
            </thead>
            <tbody>
    `;    // For each entry, show stats and compare performance to previous entry
    for (let i = 0; i < statsHistory.length; i++) {
        const s = statsHistory[i];
        let judgement = '-';
        if (i > 0) {
            const prev = statsHistory[i - 1];
            judgement = getTypingJudgement(s, prev);
        }
        tableHtml += `
            <tr>
                <td>${s.date}</td>
                <td>${s.wpm}</td>
                <td>${s.accuracy}</td>
                <td>${judgement}</td>
            </tr>
        `;
    }    tableHtml += '</tbody></table>';
    statsTableDiv.innerHTML = tableHtml;
}