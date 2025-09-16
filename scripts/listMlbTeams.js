const axios = require('axios');

(async () => {
    const { data } = await axios.get('https://statsapi.mlb.com/api/v1/teams?sportId=1&activeOnly=true');
    data.teams
        .sort((a,b) => a.name.localeCompare(b.name))
        .forEach(t => {
            console.log(`${t.id}\t${t.name}\t(${t.abbreviation})`);
        });
})();