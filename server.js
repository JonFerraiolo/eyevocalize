const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const rootDir = process.cwd();

app.use(express.static('client'));
app.get('/', (req, res) => res.sendFile(rootDir+'/client/app.html'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
