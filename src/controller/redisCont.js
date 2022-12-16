const redis = require('redis');

// EXPIRATION TIME SET TO A DAY
const EX_TIME = Date.now();

// CONNECTION REDIS
// const client = redis.createClient({
//   socket: {
//     host: '127.0.0.1',
//     port: 6379,
//   },
// });
// CONNECTION REDIS
const client = redis.createClient({
  socket: {
    // host: '127.0.0.1',
    host: 'redis-14891.c82.us-east-1-2.ec2.cloud.redislabs.com',
    port: 14891,
  },
  password: 'z8Z7dkK8OWdx3652QwYwCxO4gVHMqPqt',
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
