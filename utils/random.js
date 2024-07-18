export function randomNumberAsString(length) {
    const charset = '01234567890123456789';
    let res = '';
    while (length--) res += charset[(Math.random() * charset.length) | 0];
    return res;
}
export function randomStringNumber(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    while (length--) res += charset[(Math.random() * charset.length) | 0];
    return res;
}
export function randomString(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyz';
    let res = '';
    while (length--) res += charset[(Math.random() * charset.length) | 0];
    return res;
}
export function randomStringNumberCase(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    while (length--) res += charset[(Math.random() * charset.length) | 0];
    return res;
}

function _randBoolSeeded(seed) {
    return (((seed * 9301 + 49297) % 233280) % 2) == 0;
}

export function randExp(max) {
    var dt = Date.now();// + (Math.random() * 100000000);
    var seed = dt + Math.floor((Math.random() * 10000000000000));
    return seed % max;
}

export function randomBool(callbackTrue, callbackFalse, iter, den) {
    if (!den) { den = 2; }
    let randVal = randExp(4) % den == 0;
    if (iter && randVal && iter > 0) {
        while (--iter > 0 && randVal) randVal = randExp(4) % den == 0;
    }
    if (randVal) {
        if (callbackTrue) {
            callbackTrue();
        }
    } else {
        if (callbackFalse) {
            callbackFalse();
        }
    }
    return randVal;
}
/**
 * losowa liczba w zakresie 0 - max nie wliczając wartości max
 * @param max number (integer)
 * @returns number
 */
export function randomIntMax(max) {
    return randomInt(0, max);
}
export function randomIntMaxInclusive(max) {
    return randomIntInclusive(0, max);
}
export function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
/**
 * losowa liczba w zakresie min-max wliczając wartość min i max (włącznie)
 * @param min number (integer) 
 * @param max number (integer)
 * @returns number (integer)
 */
export function randomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function randomDate(start, end) {
    if (!start || !end) {
        return generateRandomDate();
    }
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
export function generateRandomDate() {
    return new Date(+(new Date()) - Math.floor(Math.random() * 10000000000));
}
export function randomFromArray(array) {
    if (!array) { return null; }
    let len = array.length;
    let index = randomIntMax(len);
    return array[index];
}