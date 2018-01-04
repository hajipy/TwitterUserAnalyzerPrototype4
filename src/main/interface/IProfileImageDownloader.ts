import User from "../model/user";
import ProfileImageDownloadResult from "../profileImageDownloadResult";

export default interface IProfileImageDownloader {
    add(users: User[]): void;
    download(): Promise<ProfileImageDownloadResult>;
}
