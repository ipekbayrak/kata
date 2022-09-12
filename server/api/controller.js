import Model from './model.js';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const validateEmail = (mail) => {
  return String(mail)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const SECRET_KEY = process.env.JWT_SACRET_KEY || 'dev-jwt-key';
const XERO_KEY = process.env.Xero_SACRET_KEY || 'dev-Xero-key';
const MYOB_KEY = process.env.MYOB_SACRET_KEY || 'dev-MYOB-key';
const DECISION_KEY = process.env.JWT_SACRET_KEY || 'dev-decision-key';

const decisionThirdParty = async function (preAssessment, balanceSheet, loanAmount) {
  return await fetch('http://localhost:3002/decide', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scretToken: DECISION_KEY,
      preAssessment: preAssessment,
      balanceSheet: balanceSheet,
      loanAmount: loanAmount
    })
  })
    .then(response => response.json())
    .then(data => {
      if (!data || !data.result || data.success === false) {
        throw new Error(data.message);
      }

      return data;
    });
};

const requestBalanceSheetThirdParty = async function (thirdParyUrl, scretToken, userToken, establishDate) {
  return await fetch(thirdParyUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scretToken: scretToken,
      userToken: userToken,
      establishDate: establishDate
    })
  })
    .then(response => response.json())
    .then(data => {
      if (!data || !data.balanceSheet || data.success === false) {
        throw new Error(data.message);
      }

      return data;
    });
};

const Controller = {
  onLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new Error('no username or password');
      }
      if (!validateEmail(email)) {
        throw new Error('email is not valid');
      }

      const user = await Model.getUserByEmailLogin(email, password);
      if (!user) {
        throw new Error('password and email does not match');
      }

      const payload = {
        userId: user._id
      };
      const authToken = jwt.sign(payload, SECRET_KEY, {
        expiresIn: '30m' // expires in 30 minutes
      });

      req.authToken = authToken;
      return res.status(200).json({ success: true, token: req.authToken });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },
  decode: (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(400).json({ success: false, message: 'No access token provided' });
    }
    const accessToken = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(accessToken, SECRET_KEY);
      const userid = decoded.userId;
      if (!userid) {
        return res.status(401).json({ success: false, message: 'jwt malformed' });
      }
      req.userId = userid;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  },
  onRegister: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new Error('no username or password');
      }
      if (!validateEmail(email)) {
        throw new Error('email is not valid');
      }

      const user = await Model.createUser(email, password);

      if (!user) {
        throw new Error('error on creating user');
      }

      return res.status(200).json({ success: true, message: 'user created' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  onLogout: async (req, res) => {
    try {
      if (!req.headers.authorization) {
        return res.status(400).json({ success: false, message: 'No access token provided' });
      }

      const accessToken = req.headers.authorization.split(' ')[1];
      // TODO add accessToken to blacklist

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  onFetchBalanceSheet: async (req, res) => {
    try {
      const { companyName, establishDate, accountingProvider, userToken } = req.body;
      if (!companyName || !establishDate || !accountingProvider || !userToken) {
        throw new Error('required field is missing');
      }
      let scretToken;
      let thirdParyUrl;
      switch (accountingProvider) {
        case 'Xero':
          scretToken = XERO_KEY;
          thirdParyUrl = 'http://localhost:3001/balance';
          break;
        case 'MYOB':
          scretToken = MYOB_KEY;
          thirdParyUrl = 'http://localhost:3001/balance';
          break;
        default:
          throw new Error('account provider info is wrong');
      }
      const data = await requestBalanceSheetThirdParty(thirdParyUrl, scretToken, userToken, establishDate);
      return res.status(200).json({ success: true, balanceSheet: data.balanceSheet });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },
  onRequestOutcome: async (req, res) => {
    try {
      const { companyName, establishDate, loanAmount, accountingProvider, userToken } = req.body;
      if (!companyName || !establishDate || !loanAmount || !accountingProvider || !userToken) {
        throw new Error('required field is missing');
      }
      let scretToken;
      let thirdParyUrl;
      switch (accountingProvider) {
        case 'Xero':
          scretToken = XERO_KEY;
          thirdParyUrl = 'http://localhost:3001/balance';
          break;
        case 'MYOB':
          scretToken = MYOB_KEY;
          thirdParyUrl = 'http://localhost:3001/balance';
          break;
        default:
          throw new Error('account provider info is wrong');
      }
      const data = await requestBalanceSheetThirdParty(thirdParyUrl, scretToken, userToken, establishDate);

      if (!data || data.success === false) {
        throw new Error(data.message);
      }

      let preAssessment = 20;
      let maxIndex;
      if (data.balanceSheet.length <= 12) {
        maxIndex = data.balanceSheet.length;
      } else {
        maxIndex = 12;
      }
      let profit = 0;
      let totalAssetsValue;
      for (let index = 0; index < maxIndex; index++) {
        profit += data.balanceSheet[index].profitOrLoss;
        totalAssetsValue += data.balanceSheet[index].assetsValue;
      }
      const avarageAssetsValue = totalAssetsValue / maxIndex;
      if (profit > 0) {
        preAssessment = 60;
      }
      if (avarageAssetsValue > loanAmount) {
        preAssessment = 100;
      }
      const decisionData = await decisionThirdParty(preAssessment, data.balanceSheet, loanAmount);

      return res.status(200).json({ success: true, result: decisionData.result });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
};

export default Controller;
