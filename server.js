const express = require('express');
const app = express();
const appserver = process.env.EVC_APPSERVER || 'localhost';
const port = process.env.EVC_PORT || 3000;
const rootDir = process.cwd();

app.use(express.static('client'));
app.get('/', (req, res) => res.sendFile(rootDir+'/client/app.html'));

app.listen(port, () => console.log(`App listening on port ${port}!`));
