// connect with dataBase
const mongoose = require('mongoose');
mongoose
.connect('mongodb://localhost/e-commerce', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('database connected'))
.catch((err) => console.log(err))