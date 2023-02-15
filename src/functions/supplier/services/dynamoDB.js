const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const TableName = process.env.TableName;

exports.getAllSuppliers = async () => {
  const params = {
    TableName,
  };

  let nextPage = true;
  let allSuppliers = [];
  while (nextPage) {
    const scanResponse = await docClient.scan(params).promise();
    if (scanResponse?.Items?.length > 0) allSuppliers.push(...scanResponse.Items);
    if (scanResponse.LastEvaluatedKey) {
      params.ExclusiveStartKey = scanResponse.LastEvaluatedKey;
    } else {
      nextPage = false;
    }
  }

  return allSuppliers;
};

exports.getSupplierById = async (id) => {
  const params = {
    TableName,
    Key: {
      id,
    },
  };

  const queryResponse = await docClient.get(params).promise();

  return queryResponse?.Item;
};

exports.putSupplier = async (Item) => {
  const params = {
    TableName,
    Item,
  };

  const queryResponse = await docClient.put(params).promise();
  return queryResponse;
};

exports.deleteSupplierById = async (id) => {
  const params = {
    TableName,
    Key: {
      id,
    },
  };

  const queryResponse = await docClient.delete(params).promise();

  return queryResponse;
};
