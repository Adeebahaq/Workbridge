export const getToken    = () => sessionStorage.getItem("wb_token") || localStorage.getItem("wb_token");
export const setToken    = (t) => { sessionStorage.setItem("wb_token", t); localStorage.setItem("wb_token", t); };
export const removeToken = () => { sessionStorage.removeItem("wb_token"); localStorage.removeItem("wb_token"); };