import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import * as Commander from "commander";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import "reflect-metadata";

import ipcMessage from "../ipcMessage";
import BackgroundJob from "./backgroundJob";
import TwitterGateway from "./twitterGateway";

import initContainer from "./inversify.config";
import TYPES from "./types";

Commander
    .option("--create-stub")
    .option("--use-stub")
    .parse(process.argv);

let window: BrowserWindow | null;

function createWindow() {
    window = new BrowserWindow({ width: 800, height: 600 });

    window.webContents.on("new-window", (event, openUrl) => {
        event.preventDefault();
        shell.openExternal(openUrl);
    });

    window.loadURL(url.format({
        pathname: path.join(__dirname, "../../static/index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.webContents.openDevTools();

    window.on("closed", () => {
        window = null;
    });
}

app.on("ready", async () => {
    const container = await initContainer(Commander.useStub);

    ipcMain.on(ipcMessage.analyze, (event, screenName) => {
        const backgroundJob = container.get<BackgroundJob>(TYPES.BackgroundJob);

        backgroundJob.on("start", () => {
            event.sender.send(ipcMessage.analyzeStart);
        });

        backgroundJob.on("updateProgress", (newProgress) => {
            event.sender.send(ipcMessage.analyzeProgress, newProgress);
        });

        backgroundJob.on("complete", (result) => {
            event.sender.send(ipcMessage.analyzeFinish, result);
        });

        backgroundJob.analyze(screenName).catch((error: Error) => {
            event.sender.send(ipcMessage.anylyzeError, error.message);
        });
    });

    if (Commander.createStub) {
        const twitterGateway = container.get<TwitterGateway>(TYPES.TwitterGateway);
        twitterGateway.on("onComplete", (endpoint, options, responses) => {
            if (endpoint === "followers/list") {
                fs.writeFileSync("./stubData/stubTwitterClientDataFollowers.json", JSON.stringify(responses, null, 4));
            }
            else if (endpoint === "friends/list") {
                fs.writeFileSync("./stubData/stubTwitterClientDataFriends.json", JSON.stringify(responses, null, 4));
            }
        });
    }

    createWindow();
});

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
