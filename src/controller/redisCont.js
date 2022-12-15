const redis = require('redis');

// EXPIRATION TIME SET TO A DAY
const EX_TIME = Date.now();

// CONNECTION REDIS
const client = redis.createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
});

client
  .connect()
  .then(() => {
    console.log('Connection Success to redis!');
  })
  .catch((err) => {
    console.log('Redis connection error', err);
  });

// FETCHING FROM CATCH
exports.getFromCache = async (key) => {
  const data = await client.get(key);
  return data;
};

// INSERTING TO CATCH
exports.addToCache = async (data) => {
  await client.setEx(data.urlCode, EX_TIME, data.longUrl);
  await client.setEx(data.longUrl, EX_TIME, JSON.stringify(data));
};
