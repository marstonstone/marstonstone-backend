const { getCustomerById, getCustomersByBuilder, putCustomer, deleteCustomerById } = require('./services/dynamoDB');
const { v4: uuidv4 } = require('uuid');

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
          response.body = JSON.stringify(await getCustomerById(queryStringParams?.id));
          response.statusCode = 200;
        } else if (queryStringParams?.builder) {
          response.body = JSON.stringify(await getCustomersByBuilder(queryStringParams?.builder));
          response.statusCode = 200;
        } else response.body = JSON.stringify({ Error: 'Bad Request!' });
        break;
      case 'POST':
        if (!body?.builder) {
          response.body = JSON.stringify({ Error: 'Invalid Builder ID!' });
          break;
        }
        const id = uuidv4();
        await putCustomer({ ...body, id });
        response.statusCode = 201;
        break;
      case 'PUT':
        if (!body?.id) {
          response.body = JSON.stringify({ Error: 'Invalid Customer ID!' });
          break;
        }
        if (!body?.builder) {
          response.body = JSON.stringify({ Error: 'Invalid Builder ID!' });
          break;
        }
        await putCustomer(body);
        response.statusCode = 200;
        break;
      case 'DELETE':
        if (!queryStringParams?.id) {
          response.body = JSON.stringify({ Error: 'Invalid Customer ID!' });
          break;
        }
        await deleteCustomerById(queryStringParams?.id);
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
