// naive: take first ~3 sentences as long, and short teaser
function toSentences(text) {
    if (!text) return [];
    return (text || '').replace(/\s+/g, ' ').split(/(?<=[.?!])\s+/).filter(Boolean);
}
function makeShort(text) {
    const s = (text || '').trim();
    if (s.length <= 150) return s;
    return s.slice(0, 147).trim() + '...';
}

exports.extractiveSummary = (text) => {
    const sents = toSentences(text);
    const long = sents.slice(0, 3).join(' ');
    const short = makeShort(long || sents[0] || '');
    return { short, long, model: 'extractive-v0' };
}
