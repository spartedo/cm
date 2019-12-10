let fs = require('fs');

let mimeTypes = require(`./web/Types.json`);

const http = require('http');
const port = 3000;

/*function requestBusinessHandler(request, response) {
  let requestedUrl = decodeURI(request.url);
  let regexpApi = new RegExp("\^/api", "g");
  if (!regexpApi.test(requestedUrl)) return false
  let businessResult = {result: null}
  response.setHeader('Content-Type', 'application/json');
  response.statusCode = 200;
  response.end(JSON.stringify(businessResult));
  return true
}*/

function requestAuthorizationHandler(request, response) {
  let requestedUrl = decodeURI(request.url);
  let regexpApi = new RegExp("\^/api/auth", "g");
  if (!regexpApi.test(requestedUrl)) return false;
  let authResult = { result: false };
  let requestParams = parseRequestParameters(requestedUrl);
  console.log(requestParams);
  fs.readFile(`./data/profiles/${requestParams.username}.json`, 'utf-8', (e, data) => {
    response.setHeader('Content-Type', 'application/json');
    if (e) {
      response.statusCode = 401;
      response.end(JSON.stringify(authResult));
    } else {
      let userData = JSON.parse(data);
      if (userData.account.password === requestParams.password) {
        response.statusCode = 200;
        authResult.result = true;
      } else {
        response.statusCode = 401;
      }
      response.end(JSON.stringify(authResult));
    }
  });
  return true;
}

function parseRequestParameters(uri) {
  result = {}
  let [address, query] = uri.split('?')
  console.log(query);
  if (query)
    for (keyvalue in query.split('&')) {
      let [key, value] = keyvalue.split('=')
      result[key] = value
    }
  return result;
}

const requestHandler = (request, response) => {
    let requestedFile = decodeURI(request.url);
    if (requestedFile.slice(-1) === `/`) requestedFile += `/index1.html`;

    let fileExtension = requestedFile.split(".");
    let fileExt = fileExtension[fileExtension.length-1];
    let contentType = 'application/octet-stream';
    if (typeof mimeTypes[fileExt] !== "undefined") {
      contentType = mimeTypes[fileExt];
    }
    console.log(fileExt);
    console.log(contentType);
    //console.log(requestedFile);

    //if (requestBusinessHandler(request, response)) return;
    if (requestAuthorizationHandler(request, response)) return;
    try {
      let fileSize = fs.statSync(`./web${requestedFile}`)[`size`];
      let readStream = fs.ReadStream(`./web${requestedFile}`);
      response.setHeader('Content-Length', `${fileSize}`);
      response.setHeader('Content-Type', `${contentType}; charset=utf-8`);
      response.statusCode = 200;

      readStream.pipe(response);
      readStream.on('error', (e) => {
        response.setHeader('Content-Type', 'text/html; charset=utf-8;');
        response.statusCode = 500;
        response.end(`Server Error`);
        console.error(e);
      });
      response.on('close', () => {
        readStream.destroy();
      });
    } catch (e) {
      response.setHeader('Content-Type', `text/html; charset=utf-8`);
      response.statusCode = 404;
      response.end(`Запрашиваемого файла не существует`);
    }
}


/*
function saveData(films, artists) {
  fs.writeFile('data.json', JSON.stringify({films, artists}), (e) => {
    if (e) throw err;
    console.log('The file has been saved!');
  });
}*/
// let loadedData = loadData();
// saveData(loadedData.films, loadedData.artists);

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }    console.log(`server is listening on ${port}`)
})
