import { TYPE_KEYS, EMOJIS, TYPE_COLORS } from './config.js';

// DOM Elements
export const gameArea = document.getElementById('game-area');
export const populationStatsEl = document.getElementById('population-stats');
export const conversionsCountEl = document.getElementById('conversions-count');
export const timeElapsedEl = document.getElementById('time-elapsed');
export const restartBtn = document.getElementById('restart-btn');
export const movementToggleBtn = document.getElementById('movement-toggle-btn');
export const winnerBanner = document.getElementById('winner-banner');
export const chartCanvas = document.getElementById('population-chart');
export const decreaseSpeedBtn = document.getElementById('decrease-speed-btn');
export const increaseSpeedBtn = document.getElementById('increase-speed-btn');
export const speedDisplay = document.getElementById('speed-display');
export const emojiSizeBtn = document.getElementById('emoji-size-btn');
export const mapSizeBtn = document.getElementById('map-size-btn');
export const winnerHistoryEl = document.getElementById('winner-history');
export const roundNumberEl = document.getElementById('round-number');
export const minSpeedBtn = document.getElementById('min-speed-btn');
export const defaultSpeedBtn = document.getElementById('default-speed-btn');
export const maxSpeedBtn = document.getElementById('max-speed-btn');
export const typeChartBody = document.getElementById('type-chart-body');
export const stalemateTimerEl = document.getElementById('stalemate-timer');
export const remainingTypesEl = document.getElementById('remaining-types');
export const suddenDeathMessageEl = document.getElementById('sudden-death-message');
export const remainingTypesIconsEl = document.getElementById('remaining-types-icons');

export function setupPopulationDisplay() {
    populationStatsEl.innerHTML = '';
    TYPE_KEYS.forEach(type => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center font-mono';
        div.innerHTML = `
            <span class="flex-shrink-0">${EMOJIS[type]} ${type}</span>
            <span id="${type.toLowerCase()}-count" class="font-bold ml-2" style="color: ${TYPE_COLORS[type]}">0</span>
        `;
        populationStatsEl.appendChild(div);
    });
}

export function updateStats(counts, startTime, conversions, roundCounter, timeTypeCountLastChanged, timestamp) {
    TYPE_KEYS.forEach(type => {
        const el = document.getElementById(`${type.toLowerCase()}-count`);
        if (el) el.textContent = counts[type] || 0;
    });

    roundNumberEl.textContent = roundCounter;
    conversionsCountEl.textContent = conversions;
    const elapsedTime = ((performance.now() - startTime) / 1000);
    timeElapsedEl.textContent = `${elapsedTime.toFixed(1)}s`;

    const remainingTypes = Object.keys(counts).filter(type => counts[type] > 0);
    remainingTypesEl.textContent = remainingTypes.length;

    if (remainingTypes.length <= 4 && remainingTypes.length > 1) {
        remainingTypesIconsEl.innerHTML = remainingTypes.map(type => EMOJIS[type]).join(' vs. ');
        remainingTypesIconsEl.classList.remove('hidden');
    } else {
        remainingTypesIconsEl.classList.add('hidden');
    }

    const timeWithSameTypeCount = (timestamp - timeTypeCountLastChanged) / 1000;
    stalemateTimerEl.textContent = `${timeWithSameTypeCount.toFixed(1)}s`;
}

export function updateWinnerHistoryDisplay(winnerHistory) {
    winnerHistoryEl.innerHTML = '';
    [...winnerHistory].reverse().forEach(entry => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center font-mono';
        div.innerHTML = `
            <span>Round ${entry.round}</span>
            <span class="font-bold" style="color: ${TYPE_COLORS[entry.winner]}">${EMOJIS[entry.winner]} ${entry.winner}</span>
        `;
        winnerHistoryEl.appendChild(div);
    });
}

export function updateSpeedDisplay(newSpeedMultiplier) {
    speedDisplay.textContent = `${newSpeedMultiplier.toFixed(1)}x`;
}

export function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}