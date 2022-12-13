const router = require('express').Router();
const axios = require('axios');
const AppError = require('../error/AppError');
const UrlModel = require('../models/UrlModel');

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
    const oldData = await UrlModel.findOne(req.body).select({ _id: 0, __v: 0 });
    if (oldData) {
      return res.status(200).json({
        status: true,
        data: oldData,
      });
    }
    // SETTING IN BODY URLCODE AND SHORTEN URL
    req.body.urlCode =
      (Math.random() + 1).toString(36).substring(7) + str.slice(-1);
    req.body.shortUrl = `http://localhost:3000/${req.body.urlCode}`;
    // CREATE NEW DATA AND SAVE TO DATABASE
    const data = await UrlModel.create(req.body);
    res.status(201).json({
      status: true,
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
    const url = await UrlModel.findOne({ urlCode: req.params.urlCode });
    if (url) {
      return res.redirect(302, url.longUrl);
    }
    return next(
      new AppError(`Invalid short Url code: ${req.params.urlCode}`, 400)
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
