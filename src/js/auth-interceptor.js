$(window).on("load", async function () {
    $('.loading').hide();
    const userAdmin = localStorage.getItem("jwtTokenAdmin")
    const userUser = localStorage.getItem("jwtTokenVoter")
    if (userAdmin || userUser) {
        const jwt = userAdmin || userUser;
        try {
            $('.loading').show();
            let res = await fetch('http://127.0.0.1:8081/auth', {
                headers: {
                    'authorization': 'Bearer ' + jwt
                }
            });
            if (!res.ok) {
                gotoLogin();
            }
            const role = await res.json();
            const path = window.location.pathname?.replace("/", "");
            console.log(role, path);
            if (role == 'admin') {

            } else if (role.role === 'user') {
                if (path !== 'index.html') {
                    window.location = 'index.html';
                }
            } else {
                // gotoLogin();
            }
        } catch (error) {
            gotoLogin();
        }
    } else {
        gotoLogin();
    }
    $('.loading').hide();
});

const gotoLogin = () => {
    $('.loading').hide();
    window.location.replace('login.html');
}

$('#logout').click(() => {
    $('.loading').show();
    gotoLogin();
})