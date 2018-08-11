import { ConfigRepository, UserRepository, AuthTokenRepository } from "../repository/repositoryInterfaces";
import { DynamoConfigRepository } from "../repository/dynamoConfigRepository";
import dataMapperFactory from "../repository/dataMapperFactory";
import { DynamoUserRepository } from "../repository/dynamoUserRepository";
import { ManagedKeyServices, FileServices } from "../services/serviceInterfaces";
import { AwsManagedKeyServices } from "../services/awsManagedKeyServices";
import { HostFileServices } from "../services/hostedFileService";
import { ApplicationServices } from "../services/applicationServices";
import { DynamoAuthTokenRepository } from "../repository/dynamoAuthTokenRepository";

export class ObjectFactory {

    static getConfigRepository(): ConfigRepository {
        return new DynamoConfigRepository(dataMapperFactory());
    }

    static getUserRespository(): UserRepository {
        return new DynamoUserRepository(dataMapperFactory());
    }

    static getManagedKeyServices(): ManagedKeyServices {
        return new AwsManagedKeyServices(ObjectFactory.getAuthTokenRepository(),
                ObjectFactory.getUserRespository());
    }

    static getFileServices(): FileServices {
        return new HostFileServices(ObjectFactory.getManagedKeyServices());
    }

    static getApplicationServices() : ApplicationServices {
        return new ApplicationServices(ObjectFactory.getUserRespository(),
            ObjectFactory.getManagedKeyServices(),
            ObjectFactory.getAuthTokenRepository());
    }

    static getAuthTokenRepository(): AuthTokenRepository {
        return new DynamoAuthTokenRepository(dataMapperFactory());
    }
}