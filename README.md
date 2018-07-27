# Sample Authentication App

Simple application served via AWS Lamabda with static file hosting in S3 bucket. Contains login functionality where the custom authorizer generates & verifies JWT tokens. The data store is dynamodb. For testing we'll be using AWS SAM Local & DynamoDb Local. This app uses following AWS services:

* DynamoDb
* Api Gateway
* Lambdas
* S3 Bucket
* Route53 (for api gateway custom domains)

## Local DynamoDb

java "-Djava.library.path=./DynamoDBLocal_lib" -jar DynamoDBLocal.jar -dbPath "E:\Projects\dynamodb_local_dbs" -sharedDb