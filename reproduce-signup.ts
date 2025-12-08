
async function reproduce() {
    try {
        console.log('Attempting signup on port 3000...');
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                companyName: 'Debug Company',
                email: 'debug_' + Date.now() + '@example.com',
                password: 'password123',
                name: 'Debug User'
            }),
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

reproduce();
