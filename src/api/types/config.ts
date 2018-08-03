import {
    attribute,
    hashKey,
    table,
} from '@aws/dynamodb-data-mapper-annotations';

@table('configs')
export class Config {
    @hashKey()
    configName: string;
    @attribute()
    configValue: string;
    @attribute({ defaultProvider: () => new Date() })
    created: Date;
    @attribute()
    modified?: Date;
}