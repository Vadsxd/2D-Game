const express = require('express');
const fs = require("fs");
const path = require('path');
const server = express();
const bodyParser = require('body-parser');

const host = 'localhost';
const port = 3000;
let jsonParser = bodyParser.json();

server.use(express.static(path.join(__dirname, 'public')));

server.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

server.get('/game', (req, res) => {
    res.sendFile(`${__dirname}/game.html`);
});

server.post('/asset/score.json', jsonParser, function(req,res){
    fs.writeFile('./public/asset/score.json', JSON.stringify(req.body) , (err) => {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

module.exports = server;
