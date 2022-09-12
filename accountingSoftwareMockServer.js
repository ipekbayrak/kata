import express from 'express';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

const port = 3001;

const createRandom = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createBalanceSheet = function (establishDateString) {
  const balanceSheet = [];

  const establishDate = new Date(establishDateString);
  const today = new Date();

  const loop = new Date(establishDate);
  while (loop <= today) {
    const month = loop.getMonth();
    console.log(month);
    console.log(loop);
    const year = loop.getFullYear();
    balanceSheet.push({
      year: year,
      month: month + 1,
      profitOrLoss: createRandom(-250000, 250000),
      assetsValue: createRandom(0, 250000)
    });
    loop.setDate(1);
    loop.setMonth(loop.getMonth() + 1);
  }

  return balanceSheet;
};

const predefinedValues = {};

app.post('/balance', (req, res) => {
  try {
    const scretToken = req.body.scretToken;
    const userToken = req.body.userToken;
    const establishDate = req.body.establishDate;

    if (!scretToken || !userToken) {
      throw new Error('token not provided');
    }
    if (!establishDate) {
      throw new Error('establishDate not provided');
    }

    if (!predefinedValues[userToken]) {
      const balanceSheet = createBalanceSheet(establishDate);
      predefinedValues[userToken] = balanceSheet;
    }

    return res.status(200).json({ success: true, balanceSheet: predefinedValues[userToken] });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
