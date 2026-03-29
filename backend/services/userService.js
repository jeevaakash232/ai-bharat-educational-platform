/**
 * User Service — stores and retrieves users from DynamoDB
 * Table: EduLearnUsers (partition key: email)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE || 'EduLearnUsers';

let docClient = null;

function getClient() {
  if (!docClient) {
    const raw = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim(),
      },
    });
    docClient = DynamoDBDocumentClient.from(raw);
  }
  return docClient;
}

/** Create or overwrite a user */
export async function saveUser(userData) {
  const client = getClient();
  const item = {
    ...userData,
    updatedAt: new Date().toISOString(),
    createdAt: userData.createdAt || new Date().toISOString(),
  };
  // Never store raw password in DynamoDB
  delete item.password;

  await client.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

/** Get user by email */
export async function getUserByEmail(email) {
  const client = getClient();
  const result = await client.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { email },
  }));
  return result.Item || null;
}

/** Update specific fields on a user */
export async function updateUser(email, updates) {
  const client = getClient();
  // Never update password via this path
  delete updates.password;

  const entries = Object.entries(updates)
  if (!entries.length) return null;

  const updateExpr = 'SET ' + entries.map((_, i) => `#k${i} = :v${i}`).join(', ')
  const names = Object.fromEntries(entries.map(([k], i) => [`#k${i}`, k]))
  const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))

  const result = await client.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { email },
    UpdateExpression: updateExpr,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW',
  }));
  return result.Attributes || null;
}

/** Delete a user by email */
export async function deleteUser(email) {
  const client = getClient();
  await client.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { email } }));
  return true;
}

export default { saveUser, getUserByEmail, updateUser, deleteUser };
