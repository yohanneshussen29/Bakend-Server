const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const studentRoutes = require('./routes/studentRoutes');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/students', studentRoutes);

module.exports = app;
