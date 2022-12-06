import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// ##TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info('call TodosAccess.getTodosForUser');

        const params = {
            TableName: this.todosTable,
            KeyConditionExpression: "#DYNOBASE_userId = :pkey",
            ExpressionAttributeValues: {
              ":pkey": userId
            },
            ExpressionAttributeNames: {
              "#DYNOBASE_userId": "userId"
            },
            ScanIndexForward: true
          };
          
        const result = await this.docClient.query(params).promise();
          
        const items = result.Items
        logger.info('result: ' + items);
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('call TodosAccess.createTodo');
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        logger.info('result: ' + todo);
        return todo
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('call TodosAccess.updateTodo');
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set #dynobase_name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done,
            },
            ExpressionAttributeNames: { "#dynobase_name": "name" }
        };

        await this.docClient.update(params, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        }).promise()
        logger.info('result: ' + todoUpdate);
        return todoUpdate
    }

    async updateAttachmentUrl(userId: string, todoId: string, uploadUrl: string): Promise<string> {
        logger.info('call TodosAccess.updateTodo'+ uploadUrl);
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': uploadUrl.split("?")[0]
            }
        };

        await this.docClient.update(params, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        }).promise()
        logger.info('result: ' + uploadUrl);
        return uploadUrl
    }

    async deleteTodo(userId: string, todoId: string) {
        logger.info('call TodosAccess.deleteTodo');
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        };

        await this.docClient.delete(params, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        })
        logger.info('result: done');
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}