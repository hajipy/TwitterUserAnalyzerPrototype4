import { EventEmitter } from "events";
import { decorate, inject, injectable } from "inversify";

import ITwitterClient from "./interface/ITwitterClient";
import User from "./model/user";
import TYPES from "./types";

decorate(injectable(), EventEmitter);

@injectable()
class TwitterGateway extends EventEmitter {
    public constructor(
        @inject(TYPES.TwitterClient) protected client: ITwitterClient
    ) {
        super();
    }

    public getFollowers(screenName: string): Promise<User[]> {
        return this.getUserList("followers/list", screenName);
    }

    public getFriends(screenName: string): Promise<User[]> {
        return this.getUserList("friends/list", screenName);
    }

    protected getUserList(endpoint: string, screenName: string): Promise<User[]> {
        const self = this;

        return new Promise<User[]>((resolve, reject) => {
            const users: User[] = [];
            const responses: any[] = [];

            function getUserListInternal(cursor: number) {
                const options = { screen_name: screenName, skip_status: true, count: 200, cursor };

                self.emit("onRequest", endpoint, options);

                self.client.get(endpoint, options, (error, response) => {
                    if (error) {
                        if (error[0].message !== "Rate limit exceeded") {
                            reject(error);
                            return;
                        }

                        self.emit("onRateLimit", endpoint, options);
                        setTimeout(() => { getUserListInternal(cursor); }, 60 * 1000);
                        return;
                    }

                    for (const user of response.users) {
                        users.push({
                            profileImageUrl: user.profile_image_url,
                            screenName: user.screen_name,
                        });
                    }
                    responses.push(...response.users);

                    self.emit("onRequestSuccuess", endpoint, options, response.users);

                    if (response.next_cursor === 0) {
                        self.emit("onComplete", endpoint, options, responses);

                        resolve(users);
                    }
                    else {
                        getUserListInternal(response.next_cursor);
                    }
                });
            }

            getUserListInternal(-1);
        });
    }
}

export default TwitterGateway;
