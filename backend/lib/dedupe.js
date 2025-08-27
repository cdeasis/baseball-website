const crypto = require('crypto');

exports.canonicalize = (url = '') => 
    url.replace(/(\?.*)?$/, '') // strip query params
        .replace(/\/+$/, ''); // strip trailing slashes

exports.urlHash = (url) => crypto.createHash('sha1').update(url).digest('hex');