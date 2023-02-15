const { getAllSuppliers, getSupplierById, putSupplier, deleteSupplierById } = require('./services/dynamoDB');

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
  const id = queryStringParams?.id;

  try {
    switch (event.httpMethod) {
      case 'GET':
        if (id) response.body = JSON.stringify(await getSupplierById(id));
        else response.body = JSON.stringify(await getAllSuppliers());
        response.statusCode = 200;

        break;
      case 'POST':
      case 'PUT':
        if (!body?.id) {
          response.statusCode = 400;
          response.body = JSON.stringify({ Error: 'Invalid Supplier ID!' });
          break;
        }
        await putSupplier(body);
        response.statusCode = 200;
        break;
      case 'DELETE':
        if (!id) {
          response.statusCode = 400;
          response.body = JSON.stringify({ Error: 'Invalid Supplier ID!' });
          break;
        }
        await deleteSupplierById(id);
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
