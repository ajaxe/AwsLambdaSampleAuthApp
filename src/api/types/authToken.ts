
import {
    attribute
} from '@aws/dynamodb-data-mapper-annotations';

export class AuthToken {
    @attribute()
    tokenId: string;
    @attribute()
    tokenValue: string;
    @attribute()
    created: Date;
    @attribute()
    expire: Date;
}