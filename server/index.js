import express from 'express';
import apiRouter from './api/index.js';
import connect from './database.js';

const SERVER_PORT = process.env.SERVER_PORT || 3000;

// connect to mongodb
connect();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

app.use(['/api'], apiRouter);

app.get('/', app.use(express.static('public')));

/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false
  });
});

app.listen(SERVER_PORT, () => {
  console.log(`app listening on port ${SERVER_PORT}`);
});
