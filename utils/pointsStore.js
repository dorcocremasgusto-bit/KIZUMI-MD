/**
 * utils/pointsStore.js
 * Petit magasin de points persistant (fichier JSON), partagé par
 * .daily, .quiz, .game, .guess, .tictactoe et .leaderboard.
 */
const fs = require('fs-extra');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../env/points.json');

function load() {
    if (!fs.existsSync(STORE_PATH)) return {};
    try {
        return fs.readJsonSync(STORE_PATH);
    } catch (e) {
        return {};
    }
}

function save(data) {
    fs.writeJsonSync(STORE_PATH, data, { spaces: 2 });
}

function addPoints(userId, amount) {
    const data = load();
    if (!data[userId]) data[userId] = { points: 0, lastDaily: 0, streak: 0 };
    data[userId].points += amount;
    save(data);
    return data[userId].points;
}

function getUser(userId) {
    const data = load();
    return data[userId] || { points: 0, lastDaily: 0, streak: 0 };
}

function setUser(userId, patch) {
    const data = load();
    data[userId] = { ...(data[userId] || { points: 0, lastDaily: 0, streak: 0 }), ...patch };
    save(data);
    return data[userId];
}

function top(n = 10) {
    const data = load();
    return Object.entries(data)
        .map(([userId, v]) => ({ userId, points: v.points || 0 }))
        .sort((a, b) => b.points - a.points)
        .slice(0, n);
}

module.exports = { addPoints, getUser, setUser, top };
