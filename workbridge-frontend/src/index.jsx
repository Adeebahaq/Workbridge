import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n"; // must be imported before App so i18n is initialized
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
