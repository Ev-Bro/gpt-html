// Game Configuration
export const ENTITY_COUNT = 180;
export const BASE_ENTITY_SPEED = 100;
export const GRAPH_UPDATE_INTERVAL = 200; // ms
export const MAX_GRAPH_POINTS = 120;
export const TARGET_LOCK_DURATION = 4000; // ms
export const INITIAL_HP = 3;
export const INVINCIBILITY_DURATION = 250;
export const BASE_STALEMATE_SECONDS = 60; // Base time at 1x speed

export const EMOJI_SIZES = {
    small: { size: 14, font: 12 },
    medium: { size: 22, font: 18 },
    large: { size: 30, font: 24 }
};
export const MAP_SIZES = {
    small: '400px',
    medium: '600px',
    large: '800px',
    fit: 'fit'
};
export const MOVEMENT_MODES = ['paths', 'dvd', 'targeted'];

// Pokémon Type System
export const TYPES = {
    NORMAL: 'Normal', FIRE: 'Fire', WATER: 'Water', ELECTRIC: 'Electric', GRASS: 'Grass',
    ICE: 'Ice', FIGHTING: 'Fighting', POISON: 'Poison', GROUND: 'Ground', FLYING: 'Flying',
    PSYCHIC: 'Psychic', BUG: 'Bug', ROCK: 'Rock', GHOST: 'Ghost', DRAGON: 'Dragon',
    DARK: 'Dark', STEEL: 'Steel', FAIRY: 'Fairy'
};

export const TYPE_KEYS = Object.values(TYPES);

export const EMOJIS = {
    [TYPES.NORMAL]: '⭐', [TYPES.FIRE]: '🔥', [TYPES.WATER]: '💧', [TYPES.GRASS]: '🌿',
    [TYPES.ELECTRIC]: '⚡', [TYPES.ICE]: '❄️', [TYPES.FIGHTING]: '🥊', [TYPES.POISON]: '☠️',
    [TYPES.GROUND]: '⛰️', [TYPES.FLYING]: '🕊️', [TYPES.PSYCHIC]: '🔮', [TYPES.BUG]: '🐛',
    [TYPES.ROCK]: '🗿', [TYPES.GHOST]: '👻', [TYPES.DRAGON]: '🐲', [TYPES.DARK]: '🌙',
    [TYPES.STEEL]: '🔩', [TYPES.FAIRY]: '✨'
};

export const TYPE_COLORS = {
    [TYPES.NORMAL]: '#A8A77A', [TYPES.FIRE]: '#EE8130', [TYPES.WATER]: '#6390F0', [TYPES.GRASS]: '#7AC74C',
    [TYPES.ELECTRIC]: '#F7D02C', [TYPES.ICE]: '#96D9D6', [TYPES.FIGHTING]: '#C22E28', [TYPES.POISON]: '#A33EA1',
    [TYPES.GROUND]: '#E2BF65', [TYPES.FLYING]: '#A98FF3', [TYPES.PSYCHIC]: '#F95587', [TYPES.BUG]: '#A6B91A',
    [TYPES.ROCK]: '#B6A136', [TYPES.GHOST]: '#735797', [TYPES.DRAGON]: '#6F35FC', [TYPES.DARK]: '#705746',
    [TYPES.STEEL]: '#B7B7CE', [TYPES.FAIRY]: '#D685AD'
};