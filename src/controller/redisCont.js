const redis = require('redis');

const DEFAULT_EXP = Date.now();

// CONNECTION TO CATCH LOCAL
const client = redis.createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
});

client
  .connect()
  .then(() => {
    console.log('connection success!');
  })
  .catch((err) => {
    console.log(err);
  });

// ADDING DATA TO CATCH
exports.addToCache = async (data) => {
  // THIS IS KEY->shortCode VALUE->longUrl
  await client.setEx(data.urlCode, DEFAULT_EXP, data.longUrl);

  // THIS IS KEY->longUrl VALUE->shortCode
  await client.setEx(data.longUrl, DEFAULT_EXP, JSON.stringify(data));
};

// GETTING LONG URL FROM CATCH
exports.getFromCache = async (key) => {
  const longUrl = await client.get(key);
  return longUrl;
};

// THIS IS FLUSH-ALL AND ADD
exports.addArr = async (keyArr) => {
  await client.flushAll();
  const allSet = keyArr.map(async (el) => {
    await client.setEx(el.urlCode, DEFAULT_EXP, el.longUrl);
    await client.setEx(el.longUrl, DEFAULT_EXP, el.urlCode);
  });
  await Promise.all(allSet);
};

// const client = redis.createClient({
//   socket: {
//     host: process.env.REDIS_HOST_REMOTE,
//     port: process.env.REDIS_PORT_REMOTE,
//   },
//   password: process.env.REDIS_PASSWORD_REMOTE,
// });
