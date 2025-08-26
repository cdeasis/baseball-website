export const statsGlossary = {
    W: {
        name: "Win",
        description: "Number of games team has won."
    },
    L: {
        name: "Loss",
        description: "Number of games team has lost.",
    },
    PCT: {
        name: "Win Percentage",
        description: "Percent of games team has won.",
        formula: "\\frac{W}{W + L}"
    },
    GB: {
        name: "Games Back",
        description: "Number of games back.",
        formula: "\\frac{(W_1 - W_2) + (L_2 - L_1)}{2}"
    },
    RS: {
        name: "Runs Scored",
        description: "Number of runs a team has scored.",
    },
    RA: {
        name: "Runs Allowed",
        description: "Number of runs a team has allowed.",
    },
    DIFF: {
        name: "Run Differential",
        description: "Difference between runs scored and runs allowed.",
        formula: "(RS - RA)",
    },
    STRK: {
        name: "Streak",
        description: "Current streak a team is on.",
    },
    L10: {
        name: "Last 10",
        description: "Team record in last 10 games.",
    },
    HOME: {
        name: "Wins at Home",
        description: "Record for home games.",
    },
    AWAY: {
        name: "Wins Away",
        description: "Record for away games.",
    },
    DAY: {
        name: "Day Games",
        description: "Record for day games.",
    },
    NIGHT: {
        name: "Night Games",
        description: "Record for night games.",
    },
    RHP: {
        name: "vs. Right-Handed Starter",
        description: "Record versus a right handed starter.",
    },
    LHP: {

        name: "vs. Left-Handed Starter",
        description: "Record versus a left handed starter.",
    },
    "1-RUN": {
        name: "1-Run Games",
        description: "Record in 1-run games.",
    },
    XTRA: {
        name: "Extra Innings",
        description: "Record in extra inning games.",
    },
    EXWL: {
        name: "Expected Win Loss",
        description: "Expected win loss record, where x is an exponent equal to 1.83, GP is total games played, and losses are calculated by subracting result from GP",
        formula: "\\left(\\frac{RS^x}{RA^x + RS^x}\\right) \\cdot GP",
    },
    EAST: {
        name: "vs. East Divsion (League)",
        description: "Record versus teams in the eastern division of the same league."
    },
    CENT: {
        name: "vs. Central Divsion (League)",
        description: "Record versus teams in the central division of the same league."
    },
    WEST: {
        name: "vs. West Divsion (League)",
        description: "Record versus teams in the western division of the same league."
    },
    INTR: {
        name: "vs. Interleague",
        description: "Record versus interleague opponents.",
    },
    "*": {
        name: "Clinch Wildcard",
        description: "Clinched at least a wildcard spot."
    },
    X: {
        name: "Clinched Division",
        description: "Clinched best record in the division, automatic playoff spot.",
    },
    Y: {
        name: "Clinched League",
        description: "Clinched division and best record in league.",
    },
    Z: {
        name: "Clinched Overall",
        description: "Clinched best record in MLB."
    },
}