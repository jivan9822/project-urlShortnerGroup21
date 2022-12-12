const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const app = express();
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGODB)
  .then((conn) => {
    console.log('MongoDb connection successful!');
  })
  .catch((err) => console.Console.log(err));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port${port}`);
});
