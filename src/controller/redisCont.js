const redis = require('redis');

// const DEFAULT_EXP = Date.now();
const client = redis.createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
});
// const client = redis.createClient({
//   socket: {
//     host: process.env.REDIS_HOST_REMOTE,
//     port: process.env.REDIS_PORT_REMOTE,
//   },
//   password: process.env.REDIS_PASSWORD_REMOTE,
// });

client
  .connect()
  .then(() => {
    console.log('connection success!');
  })
  .catch((err) => {
    console.log(err);
  });

exports.addToCache = async (data) => {
  await client.set(data.urlCode, data.longUrl);
  await client.set(data.longUrl, JSON.stringify(data));
};

exports.getFromCache = async (key) => {
  const longUrl = await client.get(key);
  return longUrl;
};

exports.addArr = async (keyArr) => {
  console.log(keys);
  await client.flushAll();
  const allSet = keyArr.map(
    async (el) => await client.set(el.urlCode, el.longUrl)
  );
  await Promise.all(allSet);
};
