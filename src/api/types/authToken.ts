
import {
    table,
    attribute,
    hashKey
} from '@aws/dynamodb-data-mapper-annotations';

@table('authTokens')
export class AuthToken {
    @hashKey()
    tokenId: string;
    @attribute()
    tokenValue: string;
    @attribute({ defaultProvider: () => new Date() })
    created: Date;
    @attribute()
    expire: Date;

    isExpired(): boolean {
        return this.expire.getTime() < (new Date()).getTime();
    }
}