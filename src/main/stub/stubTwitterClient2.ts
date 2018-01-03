import * as fs from "fs";
import * as process from "process";

import { injectable } from "inversify";
import "reflect-metadata";

import ITwitterClient from "../ITwitterClient";
import User from "../model/user";

/* tslint:disable:variable-name */
interface IParameters {
    cursor?: number;
    screen_name?: string;
    max_id?: number;
}
/* tslint:enable:variable-name */

@injectable()
class StubTwitterClient2 implements ITwitterClient {
    public get(endpoint: string, parameters: IParameters, callback: (error, response) => void) {
    }

    public hello() {
        console.log("hello from StubTwitterClient2");
    }
}

export default StubTwitterClient2;
