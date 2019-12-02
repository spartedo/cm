let fs = require('fs');

/*(function loadData() {

  let films_names;
  let artists_names;
  let films = [];
  let artists = [];

  try {
    films_names = fs.readdirSync("./data/films");
    artists_names = fs.readdirSync("./data/artists");
    console.log(films_names, artists_names);
  } catch (e) {
    console.log("Проблемки");
  }

  for (let filename of films_names) {
    let film = JSON.parse(fs.readFileSync(`./data/films/${filename}`));
    films.push(film);
  }
  for (filename of artists_names) {
    let artist = JSON.parse(fs.readFileSync(`./data/artists/${filename}`));
    artists.push(artist);
  }
  return {films, artists};
}*/

let mimeTypes = {
  "html":"text/html",
  "png":"image/png",
  "jpg":"image/jpg",
  "css":"text/css",
  "js":"text/javascript",
  "rar": "application/x-rar-compressed",
  "zip": "application/zip"
};

/*function requestHandler(request, response){
    return false;
}*/
const http = require('http');
const port = 3000;

function requestBusinessHandler(request, response) {
  console.log(request)
  return false;
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
    console.log(requestedFile);

    if (requestBusinessHandler(request, response)) return;
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
      response.statusCode = 404;
      response.setHeader('Content-Type', `text/html; charset=utf-8`);
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
