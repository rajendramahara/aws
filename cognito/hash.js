const crypto = require('crypto');

function getSecretHash(username, clientId, clientSecret) {
    return crypto.createHmac('SHA256', clientSecret)
        .update(username + clientId)
        .digest('base64');
}

const username = "rajendramahara088@gmail.com";
const clientId = "7m4mo2aqfprcrvlo0irll1shlr";
const clientSecret = "srhtladdp83mc1d5ueqjh87uab468ml0nsgt31cprif532g24vu";
let hashValue = getSecretHash(username, clientId, clientSecret);
console.log("Hash Value:", hashValue);