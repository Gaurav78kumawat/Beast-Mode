document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'mission2027_checklist';
    const boxes = document.querySelectorAll('#tracker input[type="checkbox"]');

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    boxes.forEach((box, i) => (box.checked = !!saved[i]));

    boxes.forEach(box =>
        box.addEventListener('change', () => {
            const state = [...boxes].map(b => b.checked);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            updateWins();
        })
    );

    boxes.forEach((box) => {
        const audio = document.createElement('audio');
        audio.src = `win.wav`;
        audio.preload = 'auto';
        box.addEventListener('change', () => {
            audio.play();
        });
    });

    const winsEl = document.createElement('p');
    winsEl.id = 'wins';
    winsEl.style.marginTop = '15px';
    winsEl.style.fontWeight = '600';
    winsEl.style.color = '#8defff';
    document.querySelector('#tracker').appendChild(winsEl);

    const streakEl = document.createElement('p');
    streakEl.id = 'streak';
    streakEl.style.fontWeight = '600';
    streakEl.style.color = '#ffd966';
    document.querySelector('#tracker').appendChild(streakEl);

    const STREAK_KEY = 'mission2027_streak';
    const LAST_DAY_KEY = 'mission2027_lastday';

    function updateStreak() {
        const today = new Date().toDateString();
        const lastDay = localStorage.getItem(LAST_DAY_KEY);
        const currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0');

        if (lastDay !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastDay === yesterday.toDateString()) {
                localStorage.setItem(STREAK_KEY, currentStreak + 1);
            } else {
                localStorage.setItem(STREAK_KEY, 1);
            }

            localStorage.setItem(LAST_DAY_KEY, today);
        }

        const newStreak = parseInt(localStorage.getItem(STREAK_KEY) || '1');
        const badge = newStreak >= 7 ? ' 🥇' : '';
        streakEl.textContent = `🔥 Current Streak: ${newStreak} day(s)${badge}`;
    }

    function updateWins() {
        const wins = [...boxes].filter(b => b.checked).length;
        winsEl.textContent = `Daily Wins: ${wins}/${boxes.length}`;

        if (wins === boxes.length && !localStorage.getItem('confettiPlayed')) {
            if (window.confetti) {
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                });
            }

            localStorage.setItem('confettiPlayed', 'true');
            updateStreak();
            markPerfectDayInCalendar();
            renderCalendar();
        }

        if (wins !== boxes.length) {
            localStorage.removeItem('confettiPlayed');
        }
    }

    updateWins();
    updateStreak();
    typeLine();
    renderCalendar();
});

// ----------------------------
// Calendar Section
// ----------------------------
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function getLocalDateString(date) {
    return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
}

function markPerfectDayInCalendar() {
    const today = new Date();
    const localDateStr = getLocalDateString(today);

    const calendarData = JSON.parse(localStorage.getItem('mission2027_calendar') || '[]');

    if (!calendarData.includes(localDateStr)) {
        calendarData.push(localDateStr);
        localStorage.setItem('mission2027_calendar', JSON.stringify(calendarData));
    }

    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const calendarData = JSON.parse(localStorage.getItem('mission2027_calendar') || '[]');
    grid.innerHTML = '';

    const todayStr = getLocalDateString(new Date());
    const firstDay = new Date(currentYear, currentMonth, 1);
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay.getDay(); i++) {
        grid.innerHTML += `<div class="calendar-cell empty"></div>`;
    }

    for (let d = 1; d <= totalDays; d++) {
        const date = new Date(currentYear, currentMonth, d);
        const dateStr = getLocalDateString(date);
        const isPerfect = calendarData.includes(dateStr);
        const isToday = dateStr === todayStr;

        grid.innerHTML += `
      <div class="calendar-cell 
        ${isPerfect ? 'perfect' : ''} 
        ${isToday ? 'today' : ''}">
        ${d}
      </div>`;
    }

    updateCalendarHeader();
}

function updateCalendarHeader() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    document.getElementById("monthYearLabel").innerText =
        `${monthNames[currentMonth]} ${currentYear}`;
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

// ----------------------------
// Typing Effect
// ----------------------------
function typeLine() {
    const typedText = document.getElementById("typed-text");
    const pledgeLines = [
        "I am the beast.",
        "I fight for my legacy.",
        "I earn 2027 daily."
    ];

    let lineIndex = 0;
    let charIndex = 0;

    function type() {
        if (lineIndex < pledgeLines.length) {
            const currentLine = pledgeLines[lineIndex];
            if (charIndex < currentLine.length) {
                typedText.textContent += currentLine.charAt(charIndex);
                charIndex++;
                setTimeout(type, 70);
            } else {
                setTimeout(() => {
                    typedText.textContent = "";
                    charIndex = 0;
                    lineIndex++;
                    if (lineIndex >= pledgeLines.length) lineIndex = 0;
                    type();
                }, 1500);
            }
        }
    }

    type();
}

function toggleMenu(toggleIcon) {
    toggleIcon.classList.toggle("active");
    document.getElementById("navLinks").classList.toggle("active");
}

