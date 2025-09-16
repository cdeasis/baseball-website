import axios from 'axios';

export async function getStandings(groupBy = 'division') {
    const { data } = await axios.get(`/api/standings`, { params: { groupBy } });
    return data;
}

export async function getWildCardStandings() {
    const { data } = await axios.get(`/api/standings/wildcard`);
    return data;
}