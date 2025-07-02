import * as game from './game.js';
import * as ui from './ui.js';
import * as config from './config.js';

// Event Listeners
ui.restartBtn.addEventListener('click', game.init);

ui.movementToggleBtn.addEventListener('click', () => {
    let newIndex = (game.currentMovementModeIndex + 1) % config.MOVEMENT_MODES.length;
    game.setCurrentMovementModeIndex(newIndex);
    const modeName = config.MOVEMENT_MODES[newIndex];
    ui.movementToggleBtn.textContent = `Mode: ${ui.capitalize(modeName)}`;
});

ui.emojiSizeBtn.addEventListener('click', () => {
    let newIndex = (game.currentEmojiSizeIndex + 1) % config.EMOJI_SIZE_KEYS.length;
    game.setCurrentEmojiSizeIndex(newIndex);
    const sizeKey = config.EMOJI_SIZE_KEYS[newIndex];
    ui.emojiSizeBtn.textContent = `Sprite Size: ${ui.capitalize(sizeKey)}`;
    game.init();
});

ui.mapSizeBtn.addEventListener('click', () => {
    let newIndex = (game.currentMapSizeIndex + 1) % config.MAP_SIZE_KEYS.length;
    game.setCurrentMapSizeIndex(newIndex);
    const sizeKey = config.MAP_SIZE_KEYS[newIndex];
    ui.mapSizeBtn.textContent = `Map: ${ui.capitalize(sizeKey)}`;
    game.init();
});

ui.increaseSpeedBtn.addEventListener('click', () => {
    if (game.speedMultiplier < 4.0) {
        let newSpeed = parseFloat((game.speedMultiplier + 0.2).toFixed(1));
        game.setSpeedMultiplier(newSpeed);
        ui.updateSpeedDisplay(newSpeed);
    }
});

ui.decreaseSpeedBtn.addEventListener('click', () => {
    if (game.speedMultiplier > 0.2) {
        let newSpeed = parseFloat((game.speedMultiplier - 0.2).toFixed(1));
        game.setSpeedMultiplier(newSpeed);
        ui.updateSpeedDisplay(newSpeed);
    }
});

ui.minSpeedBtn.addEventListener('click', () => {
    game.setSpeedMultiplier(0.2);
    ui.updateSpeedDisplay(0.2);
});

ui.defaultSpeedBtn.addEventListener('click', () => {
    game.setSpeedMultiplier(1.0);
    ui.updateSpeedDisplay(1.0);
});

ui.maxSpeedBtn.addEventListener('click', () => {
    game.setSpeedMultiplier(4.0);
    ui.updateSpeedDisplay(4.0);
});

window.addEventListener('resize', game.init);
window.onload = game.init;