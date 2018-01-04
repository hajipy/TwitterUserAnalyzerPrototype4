import User from "./model/user";

export default class ProfileImageDownloadResult {
    public success: User[];
    public fail: Array<{ user: User, reason: string }>;
    public skip: User[];

    public constructor() {
        this.success = [];
        this.fail = [];
        this.skip = [];
    }
}
