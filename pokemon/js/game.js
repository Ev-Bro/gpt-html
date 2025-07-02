import { Entity } from './entity.js';
import * as ui from './ui.js';
import * as config from './config.js';

let entities = [];
let gameLoopId = null;
let conversions = 0;
let startTime = 0;
let populationChart = null;
let lastGraphUpdate = 0;
let speedMultiplier = 1.0;
let winnerHistory = [];
let roundCounter = 0;
let lastTypeCount = 0;
let timeTypeCountLastChanged = 0;
let stalemateModeActive = false;

let currentEmojiSizeIndex = 1;
let currentMapSizeIndex = 1;
let currentMovementModeIndex = 0;

const TYPE_CHART = {};

function setupTypeChart() {
    config.TYPE_KEYS.forEach(attacker => {
        TYPE_CHART[attacker] = {};
        config.TYPE_KEYS.forEach(defender => {
            TYPE_CHART[attacker][defender] = 1;
        });
    });

    const setEffectiveness = (attacker, effectiveness, defenders) => {
        if (!defenders || defenders.length === 0) return;
        defenders.forEach(defender => {
            if (TYPE_CHART[attacker] && config.TYPE_KEYS.includes(defender)) {
                TYPE_CHART[attacker][defender] = effectiveness;
            }
        });
    };
    const clockOrder = [
        config.TYPES.NORMAL, config.TYPES.FIRE, config.TYPES.WATER, config.TYPES.ELECTRIC, config.TYPES.GRASS, config.TYPES.ICE,
        config.TYPES.FIGHTING, config.TYPES.POISON, config.TYPES.GROUND, config.TYPES.FLYING, config.TYPES.PSYCHIC,
        config.TYPES.BUG, config.TYPES.ROCK, config.TYPES.GHOST, config.TYPES.DRAGON, config.TYPES.DARK, config.TYPES.STEEL, config.TYPES.FAIRY
    ];
    const numTypes = clockOrder.length;

    for (let i = 0; i < numTypes; i++) {
        const attacker = clockOrder[i];
        const strongTargets = [
            clockOrder[(i + 1) % numTypes],
            clockOrder[(i + 2) % numTypes],
            clockOrder[(i + 3) % numTypes],
            clockOrder[(i + 4) % numTypes]
        ];
        setEffectiveness(attacker, 2, strongTargets);
        const resistantTargets = [
            clockOrder[(i + 5) % numTypes],
            clockOrder[(i + 6) % numTypes],
            clockOrder[(i + 7) % numTypes],
            clockOrder[(i + 8) % numTypes],
            clockOrder[(i + 9) % numTypes]
        ];
        setEffectiveness(attacker, 0.5, resistantTargets);
        const immuneTargets = [
            clockOrder[(i + 10) % numTypes],
            clockOrder[(i + 11) % numTypes],
            clockOrder[(i + 12) % numTypes],
            clockOrder[(i + 13) % numTypes]
        ];
        setEffectiveness(attacker, 0, immuneTargets);
    }
}

function updateTypeChartTable() {
    ui.typeChartBody.innerHTML = '';
    config.TYPE_KEYS.forEach(attacker => {
        const strong = [];
        const weak = [];
        const resistant = [];
        const immune = [];

        config.TYPE_KEYS.forEach(defender => {
            const effectiveness = TYPE_CHART[attacker][defender];
            if (effectiveness === 2) strong.push(defender);
            if (effectiveness === 0.5) resistant.push(defender);
            if (effectiveness === 0) immune.push(defender);

            const weakness = TYPE_CHART[defender][attacker];
            if (weakness === 2) weak.push(defender);
        });

        const row = document.createElement('tr');
        row.className = 'bg-gray-800 hover:bg-gray-700';
        row.innerHTML = `
            <td class="p-2 border-r border-gray-600 font-semibold">${attacker}</td>
            <td class="p-2 border-r border-gray-600">${strong.join(', ')}</td>
            <td class="p-2 border-r border-gray-600">${weak.join(', ')}</td>
            <td class="p-2 border-r border-gray-600">${resistant.join(', ')}</td>
            <td class="p-2 border-r border-gray-600">${immune.join(', ')}</td>
        `;
        ui.typeChartBody.appendChild(row);
    });
}

function init() {
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    
    roundCounter++;

    const currentMapSizeKey = config.MAP_SIZE_KEYS[currentMapSizeIndex];
    if (currentMapSizeKey === 'fit') {
        const padding = 32;
        const gap = 32;
        const controlsPanel = document.getElementById('controls-panel');
        const controlsHeight = controlsPanel.offsetHeight;
        const controlsWidth = 384; 

        let availableWidth, availableHeight;
        if (window.innerWidth >= 1024) {
            availableWidth = window.innerWidth - controlsWidth - gap - padding;
            availableHeight = window.innerHeight - padding;
        } else {
            availableWidth = window.innerWidth - padding;
            availableHeight = window.innerHeight - controlsHeight - gap - padding;
        }
        const fitSize = Math.floor(Math.min(availableWidth, availableHeight));
        ui.gameArea.style.maxWidth = `${fitSize}px`;
        ui.gameArea.style.maxHeight = `${fitSize}px`;
    } else {
        ui.gameArea.style.maxWidth = config.MAP_SIZES[currentMapSizeKey];
        ui.gameArea.style.maxHeight = config.MAP_SIZES[currentMapSizeIndex];
    }
    
    ui.gameArea.innerHTML = '';
    ui.winnerBanner.style.display = 'none';
    ui.gameArea.appendChild(ui.winnerBanner);
    
    ui.suddenDeathMessageEl.classList.add('hidden');
    ui.remainingTypesIconsEl.classList.add('hidden');

    entities = [];
    conversions = 0;
    startTime = performance.now();
    lastGraphUpdate = 0;
    lastTypeCount = 0;
    timeTypeCountLastChanged = performance.now();
    stalemateModeActive = false;
    
    ui.setupPopulationDisplay();
    setupTypeChart();
    updateTypeChartTable();

    setTimeout(() => {
        const gameBounds = ui.gameArea.getBoundingClientRect();
        const currentSize = config.EMOJI_SIZES[config.EMOJI_SIZE_KEYS[currentEmojiSizeIndex]].size;
        const numTypes = config.TYPE_KEYS.length;
        const entitiesPerType = Math.floor(config.ENTITY_COUNT / numTypes);

        for (let i = 0; i < numTypes; i++) {
            const type = config.TYPE_KEYS[i];
            for (let j = 0; j < entitiesPerType; j++) {
                const x = Math.random() * (gameBounds.width - currentSize);
                const y = Math.random() * (gameBounds.height - currentSize);
                entities.push(new Entity(type, x, y, currentEmojiSizeIndex, conversions));
            }
        }
        const remainder = config.ENTITY_COUNT % numTypes;
        for(let i = 0; i < remainder; i++){
                const type = config.TYPE_KEYS[i];
                const x = Math.random() * (gameBounds.width - currentSize);
                const y = Math.random() * (gameBounds.height - currentSize);
            entities.push(new Entity(type, x, y, currentEmojiSizeIndex, conversions));
        }

        setupChart();
        gameLoopId = requestAnimationFrame(gameLoop);
    }, 50);
}


function resolveCollision(a, b, distSq) {
    const currentSize = config.EMOJI_SIZES[config.EMOJI_SIZE_KEYS[currentEmojiSizeIndex]].size;
    const dist = Math.sqrt(distSq);
    const overlap = currentSize - dist;
    if (dist === 0) { a.updatePosition((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1); return; }
    const nx = (a.x - b.x) / dist;
    const ny = (a.y - b.y) / dist;
    const moveX = nx * (overlap / 2);
    const moveY = ny * (overlap / 2);
    a.setPosition(a.x + moveX, a.y + moveY);
    b.setPosition(b.x - moveX, b.y - moveY);
}

let lastTimestamp = 0;
function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    
    const aliveEntities = entities.filter(e => e.hp > 0);
    
    const allTypes = new Set(entities.filter(e => e.hp > -1).map(e => e.type));
    if (allTypes.size <= 1) { 
        endGame(allTypes.values().next().value);
        return;
    }

    const counts = {};
    config.TYPE_KEYS.forEach(key => counts[key] = 0);
    for (const entity of entities) { 
        if (entity.hp > -1) counts[entity.type]++;
    }

    const currentTypeCount = Object.values(counts).filter(c => c > 0).length;
    if (currentTypeCount !== lastTypeCount) {
        lastTypeCount = currentTypeCount;
        timeTypeCountLastChanged = timestamp;
    }

    const currentEntitySpeed = config.BASE_ENTITY_SPEED * speedMultiplier;
    const movementMode = config.MOVEMENT_MODES[currentMovementModeIndex];
    const currentSize = config.EMOJI_SIZES[config.EMOJI_SIZE_KEYS[currentEmojiSizeIndex]].size;
    const gameBounds = ui.gameArea.getBoundingClientRect();

    for (const entity of aliveEntities) {
        let hasTarget = false;
        if (movementMode === 'targeted' && entity.targetId) {
            const target = aliveEntities.find(e => e.id === entity.targetId);
            if (target) {
                const dist = Math.sqrt(getDistanceSq(entity, target));
                if (dist > 1) {
                    entity.dx = (target.x - entity.x) / dist;
                    entity.dy = (target.y - entity.y) / dist;
                }
                hasTarget = true;
            }
        }

        if (!hasTarget) {
            if ((entity.x <= 0 && entity.dx < 0) || (entity.x >= gameBounds.width - currentSize && entity.dx > 0)) {
                entity.dx *= -1;
            }
            if ((entity.y <= 0 && entity.dy < 0) || (entity.y >= gameBounds.height - currentSize && entity.dy > 0)) {
                entity.dy *= -1;
            }
            if ((movementMode === 'paths' || (movementMode === 'targeted' && !hasTarget)) && timestamp > entity.pathChangeTimestamp) {
                const angle = Math.random() * 2 * Math.PI;
                entity.dx = Math.cos(angle);
                entity.dy = Math.sin(angle);
                entity.resetPathTimer(timestamp);
            }
        }
        
        entity.updatePosition(entity.dx * currentEntitySpeed * deltaTime, entity.dy * currentEntitySpeed * deltaTime);
    }
    const changesToApply = [];
    const processedInFrame = new Set();

    for (let j = 0; j < aliveEntities.length; j++) {
        for (let k = j + 1; k < aliveEntities.length; k++) {
            const entityA = aliveEntities[j];
            const entityB = aliveEntities[k];

            if (processedInFrame.has(entityA.id) || processedInFrame.has(entityB.id)) continue;

            const distanceSq = getDistanceSq(entityA, entityB);

            if (distanceSq < currentSize * currentSize) {
                
                if (entityA.type === entityB.type) {
                    continue;
                }
                const damageAdeals = TYPE_CHART[entityA.type][entityB.type];
                const damageBdeals = TYPE_CHART[entityB.type][entityA.type];
                entityA.takeDamage(damageBdeals, timestamp);
                entityB.takeDamage(damageAdeals, timestamp);
                const aFainted = entityA.hp <= 0;
                const bFainted = entityB.hp <= 0;

                if (aFainted && !bFainted) {
                    changesToApply.push({ loser: entityA, winnerType: entityB.type });
                } else if (bFainted && !aFainted) {
                    changesToApply.push({ loser: entityB, winnerType: entityA.type });
                } else if (aFainted && bFainted) {
                    if (Math.random() < 0.5) {
                        changesToApply.push({ loser: entityB, winnerType: entityA.type });
                        entityA.hp = entityA.maxHp;
                        entityA.updateHealthBar();
                    } else {
                        changesToApply.push({ loser: entityA, winnerType: entityB.type });
                        entityB.hp = entityB.maxHp;
                        entityB.updateHealthBar();
                    }
                } else {
                        resolveCollision(entityA, entityB, distanceSq);
                }
                
                processedInFrame.add(entityA.id);
                processedInFrame.add(entityB.id);
            }
        }
    }
    
    for (const change of changesToApply) {
        if (stalemateModeActive) {
            change.loser.disappear();
        } else {
            change.loser.changeType(change.winnerType);
        }
    }
    
    if(stalemateModeActive) {
        entities = entities.filter(e => e.hp !== -1);
    }


    ui.updateStats(counts, timestamp, startTime, conversions, roundCounter, lastTypeCount, timeTypeCountLastChanged, speedMultiplier, stalemateModeActive);
    const currentStalemateThreshold = config.BASE_STALEMATE_SECONDS / speedMultiplier;
    const timeWithSameTypeCount = (timestamp - timeTypeCountLastChanged) / 1000;
    if (timeWithSameTypeCount > currentStalemateThreshold) {
        activateStalemateMode();
    }

    if (timestamp - lastGraphUpdate > config.GRAPH_UPDATE_INTERVAL) {
        lastGraphUpdate = timestamp;
        updateChart(counts, ((performance.now() - startTime) / 1000));
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}
function getDistanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}
function endGame(winnerType) {
    if (!gameLoopId) return;
    cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
    lastTimestamp = 0;
    
    ui.remainingTypesIconsEl.classList.add('hidden');
    ui.suddenDeathMessageEl.classList.add('hidden');

    if(winnerType) {
        ui.winnerBanner.textContent = `${config.EMOJIS[winnerType]} ${winnerType} Wins!`;
        ui.winnerBanner.style.display = 'block';
        if (!winnerHistory.some(entry => entry.round === roundCounter)) {
             winnerHistory.push({ round: roundCounter, winner: winnerType });
             ui.updateWinnerHistoryDisplay(winnerHistory);
        }
    } else {
        ui.winnerBanner.textContent = `Mutual Annihilation!`;
        ui.winnerBanner.style.backgroundColor = '#ef4444';
        ui.winnerBanner.style.display = 'block';
    }
}
function activateStalemateMode() {
    if (stalemateModeActive) return;
    stalemateModeActive = true;
    ui.suddenDeathMessageEl.classList.remove('hidden');
    console.log("Stalemate mode activated: Fainted Pokémon will now be removed.");
}

function setupChart() {
    if (populationChart) populationChart.destroy();
    const ctx = ui.chartCanvas.getContext('2d');
    
    const datasets = config.TYPE_KEYS.map(type => ({
        label: type,
        data: [],
        borderColor: config.TYPE_COLORS[type],
        tension: 0.4,
        borderWidth: 2
    }));

    populationChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 0 },
            plugins: { legend: { display: false } },
            elements: { point: { radius: 0 } },
            scales: {
                x: { display: false },
                y: { display: false, min: 0, max: config.ENTITY_COUNT }
            }
        }
    });
}
function updateChart(counts, elapsedTime) {
    const data = populationChart.data;
    data.labels.push(elapsedTime.toFixed(1));
    
    data.datasets.forEach((dataset, index) => {
        const type = config.TYPE_KEYS[index];
        dataset.data.push(counts[type] || 0);
    });

    if (data.labels.length > config.MAX_GRAPH_POINTS) {
        data.labels.shift();
        data.datasets.forEach(dataset => dataset.data.shift());
    }
    populationChart.update('none');
}

export {
    init,
    speedMultiplier,
    currentMovementModeIndex,
    currentEmojiSizeIndex,
    currentMapSizeIndex,
    setSpeedMultiplier,
    setCurrentMovementModeIndex,
    setCurrentEmojiSizeIndex,
    setCurrentMapSizeIndex
};

function setSpeedMultiplier(value) {
    speedMultiplier = value;
}

function setCurrentMovementModeIndex(value) {
    currentMovementModeIndex = value;
}

function setCurrentEmojiSizeIndex(value) {
    currentEmojiSizeIndex = value;
}

function setCurrentMapSizeIndex(value) {
    currentMapSizeIndex = value;
}