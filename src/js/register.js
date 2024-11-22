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
    if (!voter_id || voter_id.trim().length == 0) { notifications.show('VoterId/username is required', 'error'); return; }
    if (!password || password.trim().length == 0) { notifications.show('Password is required', 'error'); return }
    if (!role || role.trim().length == 0) { notifications.show('Role is required', 'error'); return }
    register(voter_id, password, role);
});

const register = async (voterId, password, role) => {
    // display loader
    loader.show();
    try {
        const req = await fetch(`http://127.0.0.1:8081/register`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: voterId, password: password, role: role })
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
        notifications.show('Register failed ' + error, 'error')
    } finally {
        loader.hide();
    }
}
