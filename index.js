const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/keys');

const app = express();

require('./models/Registration');
mongoose.connect(config.mongoURI, {useNewUrlParser:true, useUnifiedTopology: true});

app.use(bodyParser.json());


require('./routes/dialogFlowRoutes')(app);


const PORT = process.env.PORT||5000;
app.listen(PORT);
