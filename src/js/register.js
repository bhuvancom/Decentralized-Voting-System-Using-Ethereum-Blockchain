const loginForm = document.getElementById('registerForm');
const loader = $('.loading');
localStorage.removeItem('jwtTokenAdmin');
localStorage.removeItem('jwtTokenVoter');
loader.hide();
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const voter_id = document.getElementById('voter-id').value || "";
    const password = document.getElementById('password').value || "";
    var role = $("input[name='role']:checked").val();
    if (!voter_id || voter_id.trim().length == 0) { alert('VoterId/username is required'); return; }
    if (!password || password.trim().length == 0) { alert('Password is required'); return }
    if (!role || role.trim().length == 0) { alert('Role is required'); return }
    register(voter_id, password, role);
});

const register = (voterId, password, role) => {
    // display loader
    loader.show();
    fetch(`http://127.0.0.1:8000/register`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: voterId, password: password, role: role })
    }).then(response => {
        // hide loader
        loader.hide();
        if (response.ok) {
            return response.json();
        } else {
            // display error pop-up
            throw new Error('Register failed, try changing username/voterId.');
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
            console.log(error);
            loader.hide();
            console.error('register failed:', error);
            alert('failed to register ' + error)
        });
}
