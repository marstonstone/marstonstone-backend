const { getMaterialById, getMaterialsBySupplier, putMaterial, deleteMaterialById } = require('./services/dynamoDB');

exports.handler = async (event) => {
  console.log('Incoming Event ===>\n', JSON.stringify(event));

  const response = {
    statusCode: 400,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    },
  };

  const body = JSON.parse(event.body);
  const queryStringParams = event.queryStringParameters;

  try {
    switch (event.httpMethod) {
      case 'GET':
        if (queryStringParams?.id) {
          response.body = JSON.stringify(await getMaterialById(queryStringParams?.id));
          response.statusCode = 200;
        } else if (queryStringParams?.supplier) {
          response.body = JSON.stringify(await getMaterialsBySupplier(queryStringParams?.supplier));
          response.statusCode = 200;
        } else response.body = JSON.stringify({ Error: 'Bad Request!' });
        break;
      case 'POST':
      case 'PUT':
        if (!body?.id) {
          response.body = JSON.stringify({ Error: 'Invalid Material ID!' });
          break;
        }
        if (!body?.supplier) {
          response.body = JSON.stringify({ Error: 'Invalid Supplier ID!' });
          break;
        }
        await putMaterial(body);
        response.statusCode = 200;
        break;
      case 'DELETE':
        if (!queryStringParams?.id) {
          response.body = JSON.stringify({ Error: 'Invalid Supplier ID!' });
          break;
        }
        await deleteMaterialById(queryStringParams?.id);
        response.statusCode = 204;
        break;
      default:
        response.statusCode = 405;
        response.body = JSON.stringify({ Error: 'Invalid HTTP Method!' });
        break;
    }
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({ Error: 'Internal Server Error!' });
  }

  return response;
};
