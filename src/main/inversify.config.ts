import "reflect-metadata";

import * as inversify from "inversify";
import * as Twitter from "twitter";

import IProfileImageDownloader from "./interface/IProfileImageDownloader";
import IProfileImageRepository from "./interface/IProfileImageRepository";
import ITwitterClient from "./interface/ITwitterClient";

import AxiosProfileImageDownloader from "./axiosProfileImageDownloader";
import BackgroundJob from "./backgroundJob";
import NeDbProfileImageRepository from "./repository/neDbProfileImageRepository";
import StubTwitterClient from "./stub/stubTwitterClient";
import TwitterGateway from "./twitterGateway";

import TYPES from "./types";

export default async function initContainer(useStub: boolean): Promise<inversify.Container> {
    const container = new inversify.Container();

    if (useStub) {
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
