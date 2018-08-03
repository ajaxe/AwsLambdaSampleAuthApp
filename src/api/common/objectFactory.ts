import { ConfigRepository, UserRepository } from "../repository/repositoryInterfaces";
import { DynamoConfigRepository } from "../repository/dynamoConfigRepository";
import dataMapperFactory from "../repository/dataMapperFactory";
import { DynamoUserRepository } from "../repository/dynamoUserRepository";
import { ManagedKeyServices, FileServices } from "../services/serviceInterfaces";
import { AwsManagedKeyServices } from "../services/awsManagedKeyServices";
import { HostFileServices } from "../services/hostedFileService";

export class ObjectFactory {

    static getConfigRepository(): ConfigRepository {
        return new DynamoConfigRepository(dataMapperFactory());
    }

    static getUserRespository(): UserRepository {
        return new DynamoUserRepository(dataMapperFactory());
    }

    static getManagedKeyServices(): ManagedKeyServices {
        return new AwsManagedKeyServices(ObjectFactory.getConfigRepository());
    }

    static getFileServices(): FileServices {
        return new HostFileServices(ObjectFactory.getManagedKeyServices());
    }
}