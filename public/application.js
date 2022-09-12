if (!window.localStorage.getItem('token')) {
  window.location.replace('http://localhost:3000/');
}
const TOKEN = window.localStorage.getItem('token');

const logout = async function () {
  return await fetch('http://localhost:3000/api/logout', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + TOKEN
    }
  })
    .then((response) => response.json())
    .then(function (data) {
      window.localStorage.removeItem('token');
      window.location.replace('http://localhost:3000/index.html');
    })
    .catch(function (error) {
      console.error(error);
      window.localStorage.removeItem('token');
      window.location.replace('http://localhost:3000/index.html');
    });
};

const requestBalanceSheet = async function () {
  const companyName = document.getElementById('companyName').value;
  const establishDate = document.getElementById('establishDate').value;
  let loanAmount = document.getElementById('loanAmount').value;
  if (isNaN(loanAmount)) {
    document.getElementById('notification').innerHTML = 'Loan Amount is not a valid number';
    return;
  }
  loanAmount = parseInt(loanAmount);
  const accountingProvider = document.getElementById('accountingProvider').value;
  const userToken = document.getElementById('userToken').value;
  return await fetch('http://localhost:3000/api/requestBalanceSheet', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + TOKEN
    },
    body: JSON.stringify({
      companyName: companyName,
      establishDate: establishDate,
      loanAmount: loanAmount,
      accountingProvider: accountingProvider,
      userToken: userToken
    })
  })
    .then((response) => response.json())
    .then(function (data) {
      console.log(data);
      if (!data || !data.success === true) {
        document.getElementById('notification').innerHTML = data.message;
        return;
      }
      let tableRows = '';
      data.balanceSheet.forEach(element => {
        tableRows +=
        `<tr>
        <td>${element.year}</td>
        <td>${element.month}</td>
        <td>${element.profitOrLoss}</td>
        <td>${element.assetsValue}</td>
        </tr>`;
      });

      const tableTemplate = `
      <table>
        <tr>
          <th>Year</th>
          <th>Month</th>
          <th>Profit Or Loss</th>
          <th>Assets Value</th>
        </tr>
        ${tableRows}
      </table>
      `;
      document.getElementById('table').innerHTML = tableTemplate;
      document.getElementById('concent').style.display = 'block';
      document.getElementById('notification').innerHTML = '';
    });
};

const accept = function () {
  document.getElementById('submit').style.display = 'block';
};

const decide = async function () {
  const companyName = document.getElementById('companyName').value;
  const establishDate = document.getElementById('establishDate').value;
  let loanAmount = document.getElementById('loanAmount').value;
  if (isNaN(loanAmount)) {
    document.getElementById('notification').innerHTML = 'Loan Amount is not a valid number';
    return;
  }
  loanAmount = parseInt(loanAmount);
  const accountingProvider = document.getElementById('accountingProvider').value;
  const userToken = document.getElementById('userToken').value;
  return await fetch('http://localhost:3000/api/requestOutcome', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + TOKEN
    },
    body: JSON.stringify({
      companyName: companyName,
      establishDate: establishDate,
      loanAmount: loanAmount,
      accountingProvider: accountingProvider,
      userToken: userToken
    })
  })
    .then((response) => response.json())
    .then(function (data) {
      console.log(data);
      if (!data || !data.success === true) {
        document.getElementById('notification').innerHTML = data.message;
        return;
      }

      document.getElementById('result').innerHTML = 'your loan result is ' + data.result;
    });
};
