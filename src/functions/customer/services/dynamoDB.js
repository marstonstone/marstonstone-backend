const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const TableName = process.env.TableName;

const getCustomerById = async (id) => {
  const params = {
    TableName,
    Key: {
      id,
    },
  };

  const queryResponse = await docClient.get(params).promise();

  return queryResponse?.Item;
};

const getCustomersByBuilder = async (builderId, staffId) => {
  const params = {
    TableName,
    IndexName: 'builder-staff',
    KeyConditionExpression: 'builder = :b',
    ExpressionAttributeValues: {
      ':b': builderId,
    },
  };

  if (staffId) {
    params.KeyConditionExpression = params.KeyConditionExpression + ' AND staff = :s';
    params.ExpressionAttributeValues = { ...params.ExpressionAttributeValues, ':s': staffId };
  }

  let nextPage = true;
  const allCustomersByGSI = [];
  while (nextPage) {
    const scanResponse = await docClient.query(params).promise();
    if (scanResponse?.Items?.length > 0) allCustomersByGSI.push(...scanResponse.Items);
    if (scanResponse.LastEvaluatedKey) {
      params.ExclusiveStartKey = scanResponse.LastEvaluatedKey;
    } else {
      nextPage = false;
    }
  }

  const allCustomers = await Promise.all(allCustomersByGSI.map(async (m) => await getCustomerById(m.id)));

  return allCustomers;
};

const putCustomer = async (Item) => {
  const params = {
    TableName,
    Item,
  };

  const queryResponse = await docClient.put(params).promise();
  return queryResponse;
};

const deleteCustomerById = async (id) => {
  const params = {
    TableName,
    Key: {
      id,
    },
  };

  const queryResponse = await docClient.delete(params).promise();

  return queryResponse;
};

module.exports = { getCustomerById, getCustomersByBuilder, putCustomer, deleteCustomerById };
