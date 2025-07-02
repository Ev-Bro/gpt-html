import { EMOJIS, EMOJI_SIZES, EMOJI_SIZE_KEYS } from './config.js';
import * as ui from './ui.js';

export class Entity {
    constructor(type, x, y, currentEmojiSizeIndex, conversions) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.x = x;
        this.y = y;
        this.hp = 3;
        this.maxHp = 3;
        this.lastDamageTimestamp = 0;
        this.currentEmojiSizeIndex = currentEmojiSizeIndex;
        this.conversions = conversions;

        this.element = document.createElement('div');
        this.element.className = 'entity';

        this.emojiEl = document.createElement('span');
        this.emojiEl.textContent = EMOJIS[this.type];
        this.element.appendChild(this.emojiEl);

        const healthBarContainer = document.createElement('div');
        healthBarContainer.className = 'health-bar-container';
        this.healthBar = document.createElement('div');
        this.healthBar.className = 'health-bar';
        healthBarContainer.appendChild(this.healthBar);
        this.element.appendChild(healthBarContainer);

        this.updateElementSize();
        ui.gameArea.appendChild(this.element);

        const angle = Math.random() * 2 * Math.PI;
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);

        this.pathDuration = 0;
        this.pathChangeTimestamp = 0;
        this.resetPathTimer(performance.now());

        this.targetId = null;
        this.targetAcquiredTimestamp = 0;
    }

    updateHealthBar() {
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        this.healthBar.style.width = `${hpPercent * 100}%`;
        if (hpPercent < 0.3) {
            this.healthBar.style.backgroundColor = '#ef4444'; // red-500
        } else if (hpPercent < 0.6) {
            this.healthBar.style.backgroundColor = '#f59e0b'; // amber-500
        } else {
            this.healthBar.style.backgroundColor = '#22c55e'; // green-500
        }
    }

    takeDamage(damage, currentTime) {
        if (this.hp <= 0) return; // Already fainted, do nothing
        if (currentTime - this.lastDamageTimestamp < 250) {
            return; // Still invincible
        }
        this.hp -= damage;
        this.updateHealthBar();
        if (damage > 0) {
            this.lastDamageTimestamp = currentTime;
        }
    }

    resetPathTimer(currentTime) {
        this.pathDuration = Math.random() * 4000 + 1000;
        this.pathChangeTimestamp = currentTime + this.pathDuration;
    }

    updateElementSize() {
        const sizeKey = EMOJI_SIZE_KEYS[this.currentEmojiSizeIndex];
        const sizeConfig = EMOJI_SIZES[sizeKey];
        this.element.style.width = `${sizeConfig.size}px`;
        this.element.style.height = `${sizeConfig.size}px`;
        this.emojiEl.style.fontSize = `${sizeConfig.font}px`;
    }

    setPosition(newX, newY) {
        const gameBounds = ui.gameArea.getBoundingClientRect();
        const currentSize = EMOJI_SIZES[EMOJI_SIZE_KEYS[this.currentEmojiSizeIndex]].size;
        this.x = Math.max(0, Math.min(gameBounds.width - currentSize, newX));
        this.y = Math.max(0, Math.min(gameBounds.height - currentSize, newY));
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    updatePosition(dx, dy) { this.setPosition(this.x + dx, this.y + dy); }

    changeType(newType) {
        this.type = newType;
        this.emojiEl.textContent = EMOJIS[newType];
        this.hp = this.maxHp; // Reset HP
        this.updateHealthBar();
        this.conversions++;
        this.targetId = null;
    }

    disappear() {
        this.element.remove();
        this.hp = -1; // Mark as permanently gone
    }
}