import { EventEmitter } from "events";
import { decorate, inject, injectable } from "inversify";
import * as lodash from "lodash";

import IProfileImageDownloader from "./interface/IProfileImageDownloader";
import IProfileImageRepository from "./interface/IProfileImageRepository";
import User from "./model/user";
import TwitterGateway from "./twitterGateway";
import TYPES from "./types";

@injectable()
class BackgroundJob extends EventEmitter {
    public constructor(
        @inject(TYPES.TwitterGateway) protected twitterGateway: TwitterGateway,
        @inject(TYPES.ProfileImageRepository) protected profileImageRepository: IProfileImageRepository,
        @inject(TYPES.ProfileImageDownloader) protected profileImageDownloader: IProfileImageDownloader
    ) {
        super();
    }

    public async analyze(screenName: string) {
        this.emit("start");
        this.emit("updateProgress", "analyzing started");

        let followers: User[];
        let friends: User[];
        try {
            this.twitterGateway.on("onRequest", (endpoint, options) => {
                if (endpoint === "followers/list") {
                    this.emit("updateProgress", `get followers(${options.cursor})`);
                }
                else if (endpoint === "friends/list") {
                    this.emit("updateProgress", `get friends(${options.cursor})`);
                }
            });
            this.twitterGateway.on("onRequestSuccuess", (endpoint, options, response) => {
                if (endpoint === "followers/list") {
                    this.emit("updateProgress", `get followers(${options.cursor}) finished.`);
                }
                else if (endpoint === "friends/list") {
                    this.emit("updateProgress", `get friends(${options.cursor}) finished.`);
                }
            });
            this.twitterGateway.on("onRateLimit", (endpoint, options) => {
                this.emit("updateProgress", "Rate limit exceeded. wait 60 sec.");
            });

            followers = await this.twitterGateway.getFollowers(screenName);
            friends = await this.twitterGateway.getFriends(screenName);
        }
        catch (error) {
            throw new Error(JSON.stringify(error, null, 4));
        }

        this.emit("updateProgress", "user grouping start");
        const followerScreenNames = followers.map((u) => u.screenName);
        const friendScreenNames = friends.map((u) => u.screenName);
        const followEachOther = lodash.intersectionWith(followerScreenNames, friendScreenNames);
        const followedOnly = lodash.differenceWith(followerScreenNames, friendScreenNames);
        const followOnly = lodash.differenceWith(friendScreenNames, followerScreenNames);
        this.emit("updateProgress", "user grouping finish");

        this.emit("updateProgress", "profile image download start");
        this.profileImageDownloader.add(followers);
        this.profileImageDownloader.add(friends);
        const result = await this.profileImageDownloader.download();
        this.emit("updateProgress", "profile image download finish");

        const profileImageFiller = async (targetScreenName: string) => {
            const profileImage = await this.profileImageRepository.find(targetScreenName);
            const profileImageUrl = (profileImage === null)
                ? ""
                : "../db/profileImage/" + profileImage.localFileName;
            const twitterHomeUrl = "https://twitter.com/" + targetScreenName;

            return {
                profileImageUrl,
                screenName: targetScreenName,
                twitterHomeUrl
            };
        };

        const followEachOtherResult = await Promise.all(followEachOther.map(profileImageFiller));
        const followedOnlyResult = await Promise.all(followedOnly.map(profileImageFiller));
        const followOnlyResult = await Promise.all(followOnly.map(profileImageFiller));

        // tslint:disable:object-literal-sort-keys
        const anaylzeResult = {
            followEachOther: followEachOtherResult,
            followedOnly: followedOnlyResult,
            followOnly: followOnlyResult
        };
        // tslint:enable:object-literal-sort-keys

        this.emit("updateProgress", "Analyzing finish!!");
        this.emit("complete", anaylzeResult);
    }
}

export default BackgroundJob;
