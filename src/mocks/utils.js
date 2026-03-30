/** @param {number} ms */
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const delayGet = () => delay(300 + Math.floor(Math.random() * 300));
export const delayWrite = () => delay(200 + Math.floor(Math.random() * 200));
