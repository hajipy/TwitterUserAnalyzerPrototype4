import * as fs from "fs";
import * as process from "process";

import { injectable } from "inversify";
import "reflect-metadata";

import ITwitterClient from "../interface/ITwitterClient";
import User from "../model/user";

/* tslint:disable:variable-name */
interface IParameters {
    cursor?: number;
    screen_name?: string;
    max_id?: number;
}
/* tslint:enable:variable-name */

@injectable()
class StubTwitterClient implements ITwitterClient {
    public get(endpoint: string, parameters: IParameters, callback: (error, response) => void) {
        if (endpoint === "followers/list" || endpoint === "friends/list") {
            let fileName: string;
            if (endpoint === "followers/list") {
                fileName = "./stubData/stubTwitterClientDataFollowers.json";
            }
            else {
                fileName = "./stubData/stubTwitterClientDataFriends.json";
            }

            const fileContents = fs.readFileSync(fileName, { encoding: "utf8" });
            const users: User[] = JSON.parse(fileContents);

            const beginIndex = (parameters.cursor === undefined || parameters.cursor === -1) ? 0 : parameters.cursor;
            const endIndex = Math.min(beginIndex + 200, users.length);
            const responseUsers = users.slice(beginIndex, endIndex); // Note: endIndexの要素は含まない
            const nextCursor = (endIndex >= users.length) ? 0 : endIndex;

            callback(null, { next_cursor: nextCursor, users: responseUsers });
        }
    }
}

export default StubTwitterClient;
