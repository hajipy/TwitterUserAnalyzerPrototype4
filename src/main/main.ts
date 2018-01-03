import * as path from "path";
import * as url from "url";

import { app, BrowserWindow } from "electron";

let window: BrowserWindow | null;

function createWindow() {
    window = new BrowserWindow({ width: 800, height: 600 });

    const loadUrl = url.format({
        pathname: path.join(__dirname, "../../static/index.html"),
        protocol: "file:",
        slashes: true
    });

    console.log(loadUrl);

    window.loadURL(loadUrl);

    window.webContents.openDevTools();

    window.on("closed", () => {
       window = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (window === null) {
        createWindow();
    }
});
