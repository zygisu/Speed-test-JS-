// Show stats overlay and optionally the stats table/history
export function showStats(showTable = true) {
    // Get stats from global variables
    const TIME_LIMIT = window.TIME_LIMIT || 60;
    const totalCorrectChars = window.totalCorrectChars || 0;
    const totalTypedChars = window.totalTypedChars || 0;
    const totalMistakes = window.totalMistakes || 0;

    // Calculate WPM and accuracy
    const minutes = TIME_LIMIT / 60;
    const wpm = Math.round((totalTypedChars / 5) / minutes || 0);
    const accuracy = totalTypedChars > 0
        ? Math.round(100 * totalCorrectChars / totalTypedChars)
        : 100;

    document.getElementById('wpmStat').textContent = wpm;
    document.getElementById('mistakesStat').textContent = totalMistakes;
    document.getElementById('accuracyStat').textContent = accuracy;

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
    }

    if (!showTable && statsHistory.length > 0) {
        const last = statsHistory[statsHistory.length - 1];
        let judgement = '-';
        if (statsHistory.length > 1) {
            const prevAccuracy = statsHistory[statsHistory.length - 2].accuracy;
            if (last.accuracy > prevAccuracy) {
                judgement = '<span class="better">Better</span>';
            } else if (last.accuracy < prevAccuracy) {
                judgement = '<span class="worse">Worse</span>';
            } else {
                judgement = '<span class="same">Same</span>';
            }
        }
        document.getElementById('statsTable').innerHTML = `
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
    const statsTableDiv = document.getElementById('statsTable');
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
    `;

    // For each entry, show stats and compare accuracy to previous entry
    for (let i = 0; i < statsHistory.length; i++) {
        const s = statsHistory[i];
        let judgement = '-';
        if (i > 0) {
            const prevAccuracy = statsHistory[i - 1].accuracy;
            if (s.accuracy > prevAccuracy) {
                judgement = '<span class="better">Better</span>';
            } else if (s.accuracy < prevAccuracy) {
                judgement = '<span class="worse">Worse</span>';
            } else {
                judgement = '<span class="same">Same</span>';
            }
        }
        tableHtml += `
            <tr>
                <td>${s.date}</td>
                <td>${s.wpm}</td>
                <td>${s.accuracy}</td>
                <td>${judgement}</td>
            </tr>
        `;
    }

    tableHtml += '</tbody></table>';
    statsTableDiv.innerHTML = tableHtml;

    const statsButtons = document.querySelector('.stats-buttons');
    statsButtons.innerHTML = '';

    const returnBtn = document.createElement('button');
    returnBtn.id = 'returnBtn';
    returnBtn.textContent = 'Return';
    statsButtons.appendChild(returnBtn);

    returnBtn.addEventListener('click', () => {
        document.getElementById('stats').style.display = 'none';
        document.getElementById('overlay').style.display = 'flex';
        document.getElementById('introOverlay').style.display = 'block';
    });
}