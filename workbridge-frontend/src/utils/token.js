export const getToken    = () => localStorage.getItem("wb_token");
export const setToken    = (t) => localStorage.setItem("wb_token", t);
export const removeToken = () => localStorage.removeItem("wb_token");
