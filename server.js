const app = require('express');
const server = app();
const PORT = process.env.PORT || 3000;

server.get('/', (req, res) => {
    res.send('Heroku Working!');
});

server.listen(PORT, () => console.log(`listening on ${PORT}`));