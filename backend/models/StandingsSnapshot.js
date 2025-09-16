const mongoose = require('mongoose');

const TeamStandingSchema = new mongoose.Schema({
    teamId: { type: String, required: true },
    league: { type: String, enum: ['AL', 'NL'], required: true },
    division: { type: String, enum: ['East', 'Central', 'West'], required:true },

    // core
    W: Number,
    L: Number,
    PCT: Number,
    GB: Number,
    WCGB: Number,

    // shared/standard

    RS: Number,
    RA: Number,
    DIFF: Number,
    EXWL: { wins: Number, losses: Number },
    STRK: String,
    L10: String,
    HOME: String,
    AWAY: String,

    // expanded
    EXTRA_INN: String,
    ONE_RUN: String,
    DAY: String,
    NIGHT: String,
    GRASS: String,
    TURF: String,
    EAST: String,
    CENT: String,
    WEST: String,
    INTR: String,
    VS_R: String,
    VS_L: String,

    NEXT_GAME: {
        opponentId: String,
        date: Date,
        homeAway: String,
    },
}, { _id: false });

const StandingsSnapshotSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now, index: true },
    season: Number,
    source: { type: String, default: 'mlb-statsapi' },
    teams: [TeamStandingSchema],
});

module.exports = mongoose.model('StandingsSnapshot', StandingsSnapshotSchema);