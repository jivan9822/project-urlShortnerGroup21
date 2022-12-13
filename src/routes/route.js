const router = require('express').Router();
const axios = require('axios');
const AppError = require('../error/AppError');
const UrlModel = require('../models/UrlModel');
const express = require('express');
const redis = require('redis');

const DEFAULT_EXP = Date.now();
// CREATE CLINT ON LOCAL HOST PORT 6379
const client = redis.createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// CONNECTION TO REDIS
client
  .connect()
  .then(() => {
    console.log('connection success!');
  })
  .catch((err) => {
    console.log(err);
  });

router.post('/url/shorten', async (req, res, next) => {
  // IF THE BODY IS EMPTY
  if (!Object.keys(req.body).length) {
    return next(new AppError(`Body is empty!`, 400));
  }
  try {
    // USING AXIOS CHECKING URL IS VALID OR NOT
    let str = req.body.longUrl.toString();
    await axios.get(str, {
      headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
    });
    // IF THE URL IS ALREADY IN DATABASE THEN SEND THE OLD SHORTEN CODE TO CLINT
    // const oldData = await UrlModel.findOne(req.body).select({ _id: 0, __v: 0 });
    const oldData = await client.get(str);

    if (oldData) {
      return res.status(200).json({
        status: true,
        result: 'redis',
        data: JSON.parse(oldData),
      });
    }
    // SETTING IN BODY URLCODE AND SHORTEN URL
    req.body.urlCode = (Math.random() + 1).toString(36).substring(7);
    req.body.shortUrl = `http://localhost:3000/${req.body.urlCode}`;

    const data = await UrlModel.create(req.body);
    const finalData = data.toJSON();
    ['__v', '_id'].map((each) => delete finalData[each]);
    // delete finalData['_id'];
    // const data = await query.select({ __v: 0, _id: 0 });
    client.setEx(req.body.urlCode, DEFAULT_EXP, JSON.stringify(finalData));
    client.setEx(req.body.longUrl, DEFAULT_EXP, JSON.stringify(finalData));

    res.status(201).json({
      status: true,
      result: 'db',
      data,
    });
  } catch (error) {
    // SENDING ERROR TO CLINT IF ANY
    const err = error.message.split(' ');
    return next(
      new AppError(
        `Url not responding! Please Check and send a valid Url! URL:${err[2]}`,
        400
      )
    );
  }
});

// THIS GET METHOD TO REDIRECT THE TO MAIN URL
router.get('/:urlCode', async (req, res, next) => {
  try {
    let data = await client.get(req.params.urlCode);
    data = JSON.parse(data);
    // res.send(data.longUrl);
    return res.redirect(302, data.longUrl);
  } catch (error) {
    next(error);
  }
});
// THIS GET METHOD TO REDIRECT THE TO MAIN URL
// router.get('/:urlCode', async (req, res, next) => {
//   try {
//     const url = await UrlModel.findOne({ urlCode: req.params.urlCode });
//     if (url) {
//       return res.redirect(302, url.longUrl);
//     }
//     return next(
//       new AppError(`Invalid short Url code: ${req.params.urlCode}`, 400)
//     );
//   } catch (error) {
//     next(error);
//   }
// });
module.exports = router;

// const router = require('express').Router();
// const axios = require('axios');
// const AppError = require('../error/AppError');
// const UrlModel = require('../models/UrlModel');

// router.post('/url/shorten', async (req, res, next) => {
//   // IF THE BODY IS EMPTY
//   if (!Object.keys(req.body).length) {
//     return next(new AppError(`Body is empty!`, 400));
//   }
//   try {
//     // USING AXIOS CHECKING URL IS VALID OR NOT
//     let str = req.body.longUrl.toString();
//     await axios.get(str, {
//       headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
//     });
//     // IF THE URL IS ALREADY IN DATABASE THEN SEND THE OLD SHORTEN CODE TO CLINT
//     const oldData = await UrlModel.findOne(req.body).select({ _id: 0, __v: 0 });
//     if (oldData) {
//       return res.status(200).json({
//         status: true,
//         data: oldData,
//       });
//     }
//     // SETTING IN BODY URLCODE AND SHORTEN URL
//     req.body.urlCode =
//       (Math.random() + 1).toString(36).substring(7) + str.slice(-1);
//     req.body.shortUrl = `http://localhost:3000/${req.body.urlCode}`;
//     // CREATE NEW DATA AND SAVE TO DATABASE
//     const data = await UrlModel.create(req.body);
//     res.status(201).json({
//       status: true,
//       data,
//     });
//   } catch (error) {
//     // SENDING ERROR TO CLINT IF ANY
//     const err = error.message.split(' ');
//     return next(
//       new AppError(
//         `Url not responding! Please Check and send a valid Url! URL:${err[2]}`,
//         400
//       )
//     );
//   }
// });

//

// module.exports = router;
