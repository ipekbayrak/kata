const login = async function () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
    .then((response) => response.json())
    .then(function (data) {
      if (data && data.token && data.success === true) {
        window.localStorage.setItem('token', data.token);
        // redirect to application
        window.location.href = 'http://localhost:3000/application.html';
        return;
      }
      document.getElementById('notification').innerHTML = 'There was an error';
      console.error('cannot login', data);
    });
};

const register = async function () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
    .then((response) => response.json())
    .then(function (data) {
      if (data && data.success === true) {
        document.getElementById('notification').innerHTML = 'register success. you can login now';
        return;
      }
      document.getElementById('notification').innerHTML = 'There was an error';
      console.error('cannot login', data);
    });
};
