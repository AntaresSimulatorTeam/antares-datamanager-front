export const noop = () => {};

export const generateId = () => Number(String(Date.now()).slice(-6));
