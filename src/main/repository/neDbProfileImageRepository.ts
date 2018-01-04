import * as fs from "fs";
import * as path from "path";

import * as DataStore from "nedb";

import IProfileImageRepository from "../interface/IProfileImageRepository";
import ProfileImage from "../model/profileImage";

class NeDbProfileImageRepository implements IProfileImageRepository {
    public readonly imageDir = "db/profileImage";

    protected db;

    public constructor() {
        this.db = new DataStore({ filename: "db/profileImage.db" });
    }

    public async init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.loadDatabase((error) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                /* tslint:disable-next-line:no-shadowed-variable */
                this.db.ensureIndex({ fieldName: "screenName", unique: true }, (error) => {
                    if (error !== null) {
                        reject(error);
                        return;
                    }

                    if (fs.existsSync(this.imageDir)) {
                        if (fs.statSync(this.imageDir).isDirectory() === false) {
                            reject(new Error(`create directory ${this.imageDir} failed.`));
                        }
                        fs.accessSync(this.imageDir, fs.constants.W_OK);
                    }
                    else {
                        fs.mkdirSync(this.imageDir);
                    }

                    resolve();
                });
            });
        });
    }

    public async upsert(screenName: string, sourceUrl: string, localFileName: string, data: Buffer) {
        return new Promise<ProfileImage>((resolve, reject) => {
            fs.writeFile(path.join(this.imageDir, localFileName), data, (error) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                const query = { screenName };
                const update = { screenName, sourceUrl, localFileName };
                const options = { upsert: true, returnUpdatedDocs: true };

                /* tslint:disable-next-line:no-shadowed-variable */
                this.db.update(query, update, options, (error, numAffected, affectedDocuments) => {
                    if (error !== null) {
                        reject(error);
                        return;
                    }

                    const doc = affectedDocuments[0];
                    resolve(new ProfileImage(doc._id, doc.screenName, doc.sourceUrl, doc.localFileName));
                });
            });
        });
    }

    public async find(screenName: string) {
        return new Promise<ProfileImage | null>((resolve, reject) => {
            this.db.findOne({ screenName }, (error, doc: any | null) => {
                if (error !== null) {
                    reject(error);
                }

                if (doc === null) {
                    return null;
                }

                resolve(new ProfileImage(doc._id, doc.screenName, doc.sourceUrl, doc.localFileName));
            });
        });
    }
}

export default NeDbProfileImageRepository;
