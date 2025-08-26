export const getTodayDate = () => {
    const date = new Date();
    const estDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);

    const y = estDate.find(p => p.type === 'year').value;
    const m = estDate.find(p => p.type === 'month').value;
    const d = estDate.find(p => p.type === 'day').value;

    return `${y}-${m}-${d}`;
};

export const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const estYestday = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(yesterday);

    const y = estYestday.find(p => p.type === 'year').value;
    const m = estYestday.find(p => p.type === 'month').value;
    const d = estYestday.find(p => p.type === 'day').value;

    return `${y}-${m}-${d}`;
}

export const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const estTmr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(tomorrow);

    const y = estTmr.find(p => p.type === 'year').value;
    const m = estTmr.find(p => p.type === 'month').value;
    const d = estTmr.find(p => p.type === 'day').value;

    return `${y}-${m}-${d}`;
}

export const getDateOffset = (dateString, n) => {
    const date = new Date(`${dateString}T00:00:00-04:00`);
    date.setDate(date.getDate() + n);
    return date.toISOString().split("T")[0];
}

export const parseDateString = (dateString) => {
    return new Date(dateString + "00:00:T00");
}

export const getFormattedDate = (baseDate, offset=0) => {
    const date = new Date(`${baseDate}T00:00:00-04:00`);
    date.setDate(date.getDate() + offset);
    const estDate = new Intl.DateTimeFormat("en-US", {
        timeZone: 'America/New_York',
        month: "numeric",
        day: "numeric",
        year: "2-digit"
    }).formatToParts(date);

    const m = estDate.find(p => p.type === 'month').value;
    const d = estDate.find(p => p.type === 'day').value;
    const y = estDate.find(p => p.type === 'year').value;

    return `${m}/${d}/${y}`;
}

export const toISODate = (dateObj) => {
    return dateObj.toISOString().split('T')[0];
}

export const getReadableDate = (baseDate, offset = 0) => {
    const date = new Date(`${baseDate}T00:00:00-04:00`);
    date.setDate(date.getDate() + offset);

    return new Intl.DateTimeFormat("en-US", {
        timeZone: 'America/New_York',
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    }).format(date).replace(',', '')
}

export const getWeekday = (dateStr) => {
    return new Intl.DateTimeFormat('en-US', {
        timeZone:'America/New_York',
        weekday: 'long',
    }).format(new Date(`${dateStr}T00:00:00-04:00`));
}

export const getMonthDay = (dateStr) => {
    return new Intl.DateTimeFormat('en-US', {
        timeZone:'America/New_York',
        month: 'short',
        day: 'numeric',
    }).format(new Date(`${dateStr}T00:00:00-04:00`));
}