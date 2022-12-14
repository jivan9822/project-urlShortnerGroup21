const router = require('express').Router();
const axios = require('axios');
const {
  addToCache,
  getFromCache,
  addArr,
  getLogUrl,
} = require('../controller/redisCont');
const AppError = require('../error/AppError');
const UrlModel = require('../models/UrlModel');

router.post('/url/shorten', async (req, res, next) => {
  if (!Object.keys(req.body).length) {
    return next(new AppError(`Body is empty!`, 400));
  }
  try {
    let str = req.body.longUrl.toString();
    const longUrl = await getFromCache(str);
    if (longUrl) {
      const data = JSON.parse(longUrl);
      return res.status(200).json({
        status: true,
        result: 'catch',
        data,
      });
    }
    await axios.get(str, {
      headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
    });

    req.body.urlCode = (Math.random() + 1).toString(36).substring(7);
    req.body.shortUrl = `http://localhost:3000/${req.body.urlCode}`;

    const data = await UrlModel.create(req.body);
    addToCache(data);
    res.status(201).json({
      status: true,
      result: 'db',
      data,
    });
  } catch (error) {
    console.log(error.message);
    const err = error.message.split(' ');
    return next(
      new AppError(
        `Url not responding! Please Check and send a valid Url! URL:${err[2]}`,
        400
      )
    );
  }
});

router.get('/:urlCode', async (req, res, next) => {
  try {
    const urlCode = req.params.urlCode;
    const cacheData = await getFromCache(urlCode);
    if (cacheData) {
      return res.redirect(302, cacheData);
    } else {
      const data = await UrlModel.findOne(req.params);
      if (data) {
        return res.redirect(302, data.longUrl);
      } else {
        return next(
          new AppError(`no data found with the urlCode: ${urlCode}`, 400)
        );
      }
    }
  } catch (error) {
    next(error);
  }
});

router.put('/refreshAll', async (req, res, next) => {
  const allData = await UrlModel.find();
  addArr(allData);
  res.send('Refresh of catch done!');
});

module.exports = router;
