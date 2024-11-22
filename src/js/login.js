const loginForm = document.getElementById('loginForm');
const loader = $('.loading');
loader.hide();
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value;
  const password = document.getElementById('password').value;
  const token = voter_id;
  login(token, voter_id, password);
});

const login = async (token, voterId, password) => {
  // display loader
  loader.show();
  try {
    const req = await fetch(`http://127.0.0.1:8081/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: voterId, password: password })
    });
    const data = await req.json();
    if (req.ok) {
      if (data.role === 'admin') {
        window.location.replace(`http://127.0.0.1:8081/admin.html`);
      } else if (data.role === 'user') {
        window.location.replace(`http://127.0.0.1:8081/index.html`);
      } else {
        throw new Error("Unknown role.");
      }
    } else {
      throw new Error(data.message || data.error || data.detail);
    }
  } catch (error) {
    notifications.show('Login failed ' + error, 'error')
  } finally {
    loader.hide();
  }
}
