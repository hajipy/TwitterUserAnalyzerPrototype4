import { inject, injectable } from "inversify";

import ITwitterClient from "./ITwitterClient";
import User from "./model/user";
import TYPES from "./types";

@injectable()
class TwitterGateway {
    public constructor(
        @inject(TYPES.TwitterClient) protected client: ITwitterClient
    ) {
    }

    public getFollowers(
        screenName: string,
        onRequest: (cursor: number) => void,
        onRequestSuccuess: (cursor: number) => void,
        onRateLimit: () => void,
        onComplete: (users: any[]) => void
    ): Promise<User[]> {
        return this.getUserList("followers/list", screenName, onRequest, onRequestSuccuess, onRateLimit, onComplete);
    }

    public getFriends(
        screenName: string,
        onRequest: (cursor: number) => void,
        onRequestSuccuess: (cursor: number) => void,
        onRateLimit: () => void,
        onComplete: (users: any[]) => void
    ): Promise<User[]> {
        return this.getUserList("friends/list", screenName, onRequest, onRequestSuccuess, onRateLimit, onComplete);
    }

    protected getUserList(
        endpoint: string,
        screenName: string,
        onRequest: (cursor: number) => void,
        onRequestSuccuess: (cursor: number) => void,
        onRateLimit: () => void,
        onComplete: (responses: any[]) => void
    ): Promise<User[]> {
        const self = this;

        return new Promise<User[]>((resolve, reject) => {
            const users: User[] = [];
            const responses: any[] = [];

            function getUserListInternal(cursor: number) {
                onRequest(cursor);

                const options = { screen_name: screenName, skip_status: true, count: 200, cursor };

                self.client.get(endpoint, options, (error, response) => {
                    if (error) {
                        if (error[0].message !== "Rate limit exceeded") {
                            reject(error);
                            return;
                        }

                        onRateLimit();
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

                    onRequestSuccuess(cursor);

                    if (response.next_cursor === 0) {
                        onComplete(responses);

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
