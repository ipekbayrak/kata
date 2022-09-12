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

const port = 3002;

app.post('/decide', (req, res) => {
  try {
    const scretToken = req.body.scretToken;
    const preAssessment = req.body.preAssessment;
    const balanceSheet = req.body.balanceSheet;
    const loanAmount = req.body.loanAmount;

    if (!scretToken || !preAssessment || !balanceSheet || !loanAmount) {
      throw new Error('missing input');
    }

    const result = Math.floor(loanAmount / 100 * preAssessment);

    return res.status(200).json({ success: true, result: result });
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
  console.log(`decision app listening on port ${port}`);
});
