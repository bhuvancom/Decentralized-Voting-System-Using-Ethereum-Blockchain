const loginForm = document.getElementById('loginForm');
const loader = $('.loading');
localStorage.removeItem('jwtTokenAdmin');
localStorage.removeItem('jwtTokenVoter');
loader.hide();
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value;
  const password = document.getElementById('password').value;
  const token = voter_id;
  login(token, voter_id, password);
});

const login = (token, voterId, password) => {
  // display loader
  loader.show();
  fetch(`http://127.0.0.1:8000/login`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: voterId, password: password })
  }).then(response => {
    // hide loader
    loader.hide();
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Login failed, please check username/password.');
    }
  }).then(data => {
    if (data.role === 'admin') {
      console.log(data.role)
      localStorage.setItem('jwtTokenAdmin', data.token);
      window.location.replace(`http://127.0.0.1:8081/admin.html`);
    } else if (data.role === 'user') {
      localStorage.setItem('jwtTokenVoter', data.token);
      window.location.replace(`http://127.0.0.1:8081/index.html`);
    } else {
      // display error pop-up
    }
  })
    .catch(error => {
      // display error pop-up
      loader.hide();
      console.error('Login failed:', error);
      alert('Login failed ', error)
    });
}
