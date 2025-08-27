const { text } = require('express');
const teams = require('./teamdefinitions');
const leagues = {
    AL: ["American League", "AL"],
    NL: ["National League", "NL"],
    MLB: ["Major League Baseball", "MLB"],
};

exports.tagEntities = (text = '') => {
    const t = text.toLowerCase();
    const matches = [];

    // match teams
    for (const key in teams) {
        const team = teams[key];
        for (const alias of team.nickname) {
            if (t.includes(alias.toLowerCase())) {
                matches.push(team.name);
                break;
            }
        }
    }

    // match leagues
    for (const code in leagues) {
        const league = leagues[code];
        for (const alias of league) {
            if (t.includes(alias.toLowerCase())) {
                matches.push(code);
                break;
            }
        }
    }

    return matches;
};