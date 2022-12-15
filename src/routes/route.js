const router = require('express').Router();
const axios = require('axios');
const { addToCache, getFromCache, addArr } = require('../controller/redisCont');
const AppError = require('../error/AppError');
const UrlModel = require('../models/UrlModel');

// CREATE SHORT URL ROUTE
router.post('/url/shorten', async (req, res, next) => {
  // IF BODY EMPTY
  if (!Object.keys(req.body).length) {
    return next(new AppError(`Body is empty!`, 400));
  }
  try {
    let str = req.body.longUrl.toString();
    // CHECKING IN CATCH IF URL ALREADY PRESENT
    const longUrl = await getFromCache(str);
    if (longUrl) {
      const data = JSON.parse(longUrl);
      return res.status(200).json({
        status: true,
        from: 'catch',
        data,
      });
    }

    // VERIFYING URL USING AXIOS
    await axios.get(str, {
      headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
    });

    // IF VALID URL THEN CREATING A RANDOM SHORT CODE
    req.body.urlCode = (Math.random() + 1).toString(36).substring(7);
    req.body.shortUrl = `http://localhost:3000/${req.body.urlCode}`;

    // DATA CREATE TO DATA-BASE
    const data = await UrlModel.create(req.body);

    // INSERTING TO REDIS CATCH
    addToCache(data);

    // FINAL RETURN TO CLINT NEW SHORT URL AND OTHER DETAILS
    res.status(201).json({
      status: true,
      from: 'db',
      data,
    });
  } catch (error) {
    const err = error.message.split(' ');
    return next(
      new AppError(
        `Url not responding! Please Check and send a valid Url! URL:${err[2]}`,
        400
      )
    );
  }
});

// GET LONG URL AND REDIRECT TO CLINT
router.get('/:urlCode', async (req, res, next) => {
  try {
    const urlCode = req.params.urlCode;

    // GETTING FROM CATCH
    const cacheData = await getFromCache(urlCode);
    if (cacheData) {
      return res.redirect(302, cacheData);
    } else {
      // IF NOT PRESENT IN CATCH ONE MORE CHECK IN DATA-BASE
      const data = await UrlModel.findOne(req.params);

      // IF FOUND IN DATA-BASE THEN WE WILL ADD IT TO CATCH
      addToCache(data);
      if (data) {
        return res.redirect(302, data.longUrl);
      } else {
        // AT LAST SENDING ERROR OF INVALID SHORT CODE
        return next(
          new AppError(`no data found with the urlCode: ${urlCode}`, 400)
        );
      }
    }
  } catch (error) {
    next(error);
  }
});

// THIS IS ADDITIONAL ROUTE TO FLUSH ALL DATA FROM CATCH AND RESTORE ALL FROM DATA-BASE
router.put('/refreshAll', async (req, res, next) => {
  const allData = await UrlModel.find();
  addArr(allData);
  res.send('Refresh of catch done!');
});

module.exports = router;
