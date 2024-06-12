const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
    res.send('This is the home page') //home.ejs로 전송
})

app.listen(3000, () => {

    console.log('Serving on port 3000')
})