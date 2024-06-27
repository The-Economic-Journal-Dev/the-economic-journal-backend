// Ensure the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');
    // Get the registration form element
    const registerForm = document.getElementById('registerForm');

    // Add an event listener to handle form submission
    registerForm.addEventListener('submit', async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Get the form data
        const email = document.getElementById('registerEmail').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Send a POST request to the registration endpoint
            const response = await axios.post('/auth/local/register', {
                email,
                username,
                password
            });
            console.log(response.status)
            // If the response is successful, redirect to the dashboard
            if (response.status == 200) {
                window.location.href = '/dashboard';
            }
        } catch (error) {
            // If an error occurs, redirect to the homepage
            console.error('Registration failed:', error);
        }
    });

    // // Get the login form element
    // const loginForm = document.getElementById('loginForm');

    // // Add an event listener to handle form submission
    // loginForm.addEventListener('submit', async (event) => {
    //     // Prevent the default form submission behavior
    //     event.preventDefault();

    //     // Get the form data
    //     const email = document.getElementById('loginEmail').value;
    //     const password = document.getElementById('loginPassword').value;

    //     try {
    //         // Send a POST request to the login endpoint
    //         const response = await axios.post('/auth/local/login', {
    //             email,
    //             password
    //         });

    //         // If the response is successful, redirect to the dashboard
    //         if (response.status == 200) {
    //             window.location.href = '/dashboard';
    //         }
    //     } catch (error) {
    //         // If an error occurs, redirect to the homepage
    //         console.error('Login failed:', error);
    //     }
    // });
});
