const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const TableName = process.env.TableName;

const getMaterialById = async (id) => {
  const params = {
    TableName,
    Key: {
      id,
    },
  };

  const queryResponse = await docClient.get(params).promise();

  return queryResponse?.Item;
};

const getMaterialsBySupplier = async (supplierId) => {
  const params = {
    TableName,
    IndexName: 'supplier',
    KeyConditionExpression: 'supplier = :s',
    ExpressionAttributeValues: {
      ':s': supplierId,
    },
  };

  let nextPage = true;
  const allMaterialsByGSI = [];
  while (nextPage) {
    const scanResponse = await docClient.query(params).promise();
    if (scanResponse?.Items?.length > 0) allMaterialsByGSI.push(...scanResponse.Items);
    if (scanResponse.LastEvaluatedKey) {
      params.ExclusiveStartKey = scanResponse.LastEvaluatedKey;
    } else {
      nextPage = false;
    }
  }

  const allMaterials = await Promise.all(allMaterialsByGSI.map(async (m) => await getMaterialById(m.id)));

  return allMaterials;
};

const putMaterial = async (Item) => {
  const params = {
    TableName,
    Item,
  };

  const queryResponse = await docClient.put(params).promise();
  return queryResponse;
};

const deleteMaterialById = async (id) => {
  const params = {
    TableName,
    Key: {
      id,
    },
  };

  const queryResponse = await docClient.delete(params).promise();

  return queryResponse;
};

module.exports = { getMaterialById, getMaterialsBySupplier, putMaterial, deleteMaterialById };
