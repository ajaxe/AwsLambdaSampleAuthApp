import { DataMapper } from '@aws/dynamodb-data-mapper';
import { ConfigRepository } from './repositoryInterfaces';
import { Config } from '../types/config';
import { equals } from '@aws/dynamodb-expressions';

export class DynamoConfigRepository implements ConfigRepository {

    private readonly mapper: DataMapper;

    constructor(mapper: DataMapper) {
        this.mapper = mapper;
    }

    private async ensureConfigTable(): Promise<void> {
        return this.mapper.ensureTableExists(Config, {
            readCapacityUnits: 3,
            writeCapacityUnits: 1
        });
    }
    async getConfiguration(name: string): Promise<Config> {
        await this.ensureConfigTable();
        let cfg: Config[] = [];
        for await (const f of this.mapper.query(Config, { configName: name })) {
            cfg.push(f);
        }
        if (cfg.length > 1) {
            throw new Error('More than one config with same name found.');
        }
        else if (cfg.length === 0) {
            return null;
        }
        return cfg[0];
    }

    async addConfiguration(config: Config): Promise<Config> {
        await this.ensureConfigTable();
        let toSave = Object.assign(new Config, config);
        return await this.mapper.put(toSave);
    }

    async setConfiguration(config: Config): Promise<Config> {
        await this.ensureConfigTable();
        config.modified = new Date();
        let toUpdate = Object.assign(new Config, config);
        let existing = await this.getConfiguration(toUpdate.configName);
        if(!existing) {
            throw new Error(`Cannot set non-existent configuration. config name: ${toUpdate.configName}`);
        }
        try {
            return await this.mapper.update(toUpdate, {
                condition: {
                    ...equals(toUpdate.configName),
                    subject: 'configName'
                }
            });
        }
        catch (err) {
            console.log(err.stack);
            if(err.stack.indexOf('ConditionalCheckFailedException') !== -1) {
                return null;
            }
            throw err;
        }
    }

}