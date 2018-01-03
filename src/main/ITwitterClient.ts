export default interface ITwitterClient {
    get(endpoint: string, parameters: any, callback: (error, response) => void);
}
