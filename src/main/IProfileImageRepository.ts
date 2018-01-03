import ProfileImage from "./model/profileImage";

export default interface IProfileImageRepository {
    upsert(screenName: string, sourceUrl: string, localFileName: string, data: Buffer): Promise<ProfileImage>;
    find(screenName: string): Promise<ProfileImage | null>;
}
