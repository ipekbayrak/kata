import mongoose from 'mongoose';

const CONNECTION_URL = process.env.CONNECTION_URL || 'mongodb://localhost:27017/kata';

const connect = function () {
  return mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auto_reconnect: true
  }).then(function () {
    console.log('mongoose connection success');
  }).catch(function (e) {
    console.log('mongoose connection failed', e);
  });
};

mongoose.connection.on('connected', () => {
  console.log('Mongo has connected succesfully');
});

mongoose.connection.on('reconnected', () => {
  console.log('Mongo has reconnected');
});

mongoose.connection.on('error', error => {
  console.log('Mongo connection has an error', error);
  mongoose.disconnect();
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongo connection is disconnected');
});

// Close the Mongoose connection, when receiving SIGINT
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Force to close the MongoDB conection');
    process.exit(0);
  });
});

export default connect;
