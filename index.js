const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/keys');

const app = express();

require('./models/Registration');
mongoose.connect(config.mongoURI, {useNewUrlParser:true, useUnifiedTopology: true});

app.use(bodyParser.json());


require('./routes/dialogFlowRoutes')(app);

if (process.env.NODE_ENV === 'production') {
    // js and css files
    app.use(express.static('client/build'));
    // index.html for all page routes
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(_dirname,'client','build','index.html'));
    });
}

const PORT = process.env.PORT||5000;
app.listen(PORT);
