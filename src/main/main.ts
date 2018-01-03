import * as path from "path";
import * as url from "url";

import { app, BrowserWindow, ipcMain, screen } from "electron";
import { Container } from "inversify";

import ipcMessage from "../ipcMessage";
import ITwitterClient from "./ITwitterClient";
import StubTwitterClient from "./stub/stubTwitterClient";
import StubTwitterClient2 from "./stub/stubTwitterClient2";
import TYPES from "./types";

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

ipcMain.on(ipcMessage.analyze, (event, screenName) => {
    event.sender.send(ipcMessage.analyzeStart);

    setTimeout(() => {
        event.sender.send(ipcMessage.analyzeProgress, `Analyzing (1/3) ...`);
    }, 1000);

    setTimeout(() => {
        event.sender.send(ipcMessage.analyzeProgress, `Analyzing (2/3) ...`);
    }, 2000);

    setTimeout(() => {
        event.sender.send(ipcMessage.analyzeProgress, `Analyzing (3/3) ...`);
    }, 3000);

    setTimeout(() => {
        event.sender.send(ipcMessage.analyzeProgress, `Analyzing finish!!`);
    }, 4000);

    setTimeout(() => {
        /* tslint:disable:object-literal-sort-keys */
        const dummyData = {
            screenName: "hajimepg",
            profileImageUrl: "./hajimepg.jpg",
            twitterHomeUrl: "https://twitter.com/hajimepg",
        };

        const result = {
            followEachOther: [dummyData],
            followedOnly: [dummyData, dummyData],
            followOnly: [dummyData, dummyData, dummyData]
        };
        /* tslint:enable:object-literal-sort-keys */

        event.sender.send(ipcMessage.analyzeFinish, result);
    }, 4500);
});

const container = new Container();
container.bind<ITwitterClient>(TYPES.TwitterClient).to(StubTwitterClient2);

const twitterClient = container.get<ITwitterClient>(TYPES.TwitterClient);
twitterClient.hello();
