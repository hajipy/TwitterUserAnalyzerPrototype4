import axios from "axios";
import { inject, injectable } from "inversify";
import * as lodash from "lodash";

import IProfileImageDownloader from "./interface/IProfileImageDownloader";
import IProfileImageRepository from "./interface/IProfileImageRepository";
import User from "./model/user";
import ProfileImageDownloadResult from "./profileImageDownloadResult";
import TYPES from "./types";

@injectable()
class AxiosProfileImageDownloader implements IProfileImageDownloader {
    protected downloadQueue: User[];

    public constructor(
        @inject(TYPES.ProfileImageRepository) protected repository: IProfileImageRepository
    ) {
    }

    public add(users: User[]): void {
        const userComparator = (a, b) => a.screenName === b.screenName;

        this.downloadQueue = lodash.unionWith(this.downloadQueue, users, userComparator);
    }

    public download() {
        return new Promise<ProfileImageDownloadResult>(async (resolve, reject) => {
            const result = new ProfileImageDownloadResult();

            while (true) {
                const target = this.downloadQueue.shift();

                if (target === undefined) {
                    resolve(result);
                    return;
                }

                if (target.profileImageUrl === null || target.profileImageUrl === undefined) {
                    result.fail.push({ user: target, reason: "profileImageUrl is null or undefined" });
                    continue;
                }

                const oldProfileImage = await this.repository.find(target.screenName);
                if (oldProfileImage !== null && oldProfileImage.sourceUrl === target.profileImageUrl) {
                    result.skip.push(target);
                    continue;
                }

                let response;
                try {
                    response = await axios.get(target.profileImageUrl, { responseType: "arraybuffer" });
                }
                catch (error) {
                    result.fail.push({ user: target, reason: `statusCode=${error.response.status}` });
                    continue;
                }

                const contentType = response.headers["content-type"];
                const extension = this.getExtension(contentType);
                if (extension === "") {
                    result.fail.push({ user: target, reason: `Unsupported content-type: ${contentType}` });
                    continue;
                }

                const filename = `${target.screenName}.${extension}`;
                this.repository.upsert(target.screenName, target.profileImageUrl, filename,
                    new Buffer(response.data, "binary"));
                result.success.push(target);
            }
        });
    }

    protected getExtension(contentType: string): string {
        switch (contentType) {
            case "image/jpeg":
                return "jpg";
            case "image/png":
                return "png";
            case "image/gif":
                return "gif";
            default:
                return "";
        }
    }
}

export default AxiosProfileImageDownloader;
