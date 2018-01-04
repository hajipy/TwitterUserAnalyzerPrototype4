import * as path from "path";
import * as url from "url";

import * as Commander from "commander";
import { app, BrowserWindow, ipcMain } from "electron";
import * as inversify from "inversify";
import "reflect-metadata";
import * as Twitter from "twitter";

import ipcMessage from "../ipcMessage";
import AxiosProfileImageDownloader from "./axiosProfileImageDownloader";
import BackgroundJob from "./backgroundJob";
import IProfileImageDownloader from "./interface/IProfileImageDownloader";
import IProfileImageRepository from "./interface/IProfileImageRepository";
import ITwitterClient from "./interface/ITwitterClient";
import NeDbProfileImageRepository from "./repository/neDbProfileImageRepository";
import StubTwitterClient from "./stub/stubTwitterClient";
import TwitterGateway from "./twitterGateway";
import TYPES from "./types";

Commander
    .option("--use-stub")
    .parse(process.argv);

async function initContainer() {
    const container = new inversify.Container();

    if (Commander.useStub) {
        container.bind<ITwitterClient>(TYPES.TwitterClient).to(StubTwitterClient);
    }
    else {
        container.bind<ITwitterClient>(TYPES.TwitterClient).toConstantValue(new Twitter({
            access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
            access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        }));
    }
    container.bind<TwitterGateway>(TYPES.TwitterGateway).to(TwitterGateway);

    const profileImageRepository = new NeDbProfileImageRepository();
    await profileImageRepository.init();
    container.bind<IProfileImageRepository>(TYPES.ProfileImageRepository).toConstantValue(profileImageRepository);

    container.bind<IProfileImageDownloader>(TYPES.ProfileImageDownloader).to(AxiosProfileImageDownloader);

    container.bind<BackgroundJob>(TYPES.BackgroundJob).to(BackgroundJob);

    return container;
}

let window: BrowserWindow | null;

function createWindow() {
    window = new BrowserWindow({ width: 800, height: 600 });

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
    const container = await initContainer();

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

        backgroundJob.analyze(screenName);
    });

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
