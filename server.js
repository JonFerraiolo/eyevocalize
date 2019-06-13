const express = require('express');
const app = express();
const port = 3000;
const rootDir = process.cwd();

// app.get('/', (req, res) => res.send('Hello World!'));

app.use(express.static('client'));
app.get('/', (req, res) => res.sendFile(rootDir+'/client/app.html'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
