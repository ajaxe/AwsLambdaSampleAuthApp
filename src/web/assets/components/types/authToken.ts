export class AuthToken {
    tokenId: string;
    tokenValue: string;
    created: Date;
    expire: Date;

    isExpired(): boolean {
        return this.expire.getTime() < (new Date()).getTime();
    }
}