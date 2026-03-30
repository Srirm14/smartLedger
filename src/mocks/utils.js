/** @param {number} ms */
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET-style reads: 300–600 ms */
export const delayGet = () => delay(300 + Math.floor(Math.random() * 301));

/** Mutations (POST/PUT/PATCH/DELETE): 200–400 ms */
export const delayWrite = () => delay(200 + Math.floor(Math.random() * 201));
