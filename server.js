const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    // .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connected...');
    // console.log(console.log(con.connections));
  });
// .catch((err) => console.log('ERROR 💥💥💥:', err.name, err.message));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// const server = app.listen(port, '127.0.0.1', () => {
//   console.log(`App running on port ${port}...`);
// });

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! shutting down...');
  console.log('ERROR 💥💥💥: ', err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('unhandledRejection', (err) => {
  console.log('ASYNC UNHANDLE REJECTION! shutting down...');
  console.log('ERROR 💥💥💥: ', err.name, err.message);
  server.close(() => process.exit(1));
});
