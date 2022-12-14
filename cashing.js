// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
// const app = express();
// const redis = require('redis');
// app.use(cors());

// // BEFORE THAT DOWNLOAD AND INSTALL REDIS INSTALLER
// // EXPIRATION TIME
// const DEFAULT_EXP = 10;

// // CREATE CLINT ON LOCAL HOST PORT 6379
// const client = redis.createClient({
//   socket: {
//     host: '127.0.0.1',
//     port: 6379,
//   },
// });

// // CONNECTION TO REDIS
// client
//   .connect()
//   .then(() => {
//     console.log('connection success!');
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// // GET API
// app.get('/photos', async (req, res) => {
//   console.log(req.query.title);

//   // GETTING DATA FROM REDIS
//   const data = await client.get('photos');
//   // IF DATA FOUND THEN SEND THE RESPONSE AND RETURN
//   if (data) {
//     const newData = JSON.parse(data);
//     for (let i = 0; i < newData.length; ++i) {
//       if (newData[i].title === req.query.title) {
//         return res.send(newData[i]);
//       }
//     }
//     return res.status(200).json({
//       status: true,
//       result: newData.length,
//       data: newData,
//     });
//     // IF NO DATA THEN CALL AXIOS AND FETCH DATA
//   } else {
//     const { data } = await axios.get(
//       'https://jsonplaceholder.typicode.com/photos',
//       {
//         headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
//       }
//     );
//     client.setEx('photos', DEFAULT_EXP, JSON.stringify(data));
//     for (let i = 0; i < data.length; ++i) {
//       if (data[i].title === req.query.title) {
//         return res.status(200).json({
//           data: data[i],
//         });
//       }
//     }
//     // AFTER FETCHING SET DATA TO REDIS
//     // FINAL RESPONSE TO CLINT
//     res.status(200).json({
//       status: true,
//       result: data.length,
//       data,
//     });
//   }
// });

// app.listen(3000);
