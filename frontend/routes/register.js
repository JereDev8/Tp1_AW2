const button = document.getElementById('register-button');

button.addEventListener('click', async () => {
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;


  if (!firstName || !password || !email || !lastName) {
    alert('Please fill all fields.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre: firstName, contraseña: password, email, apellido:lastName }),
    });

    if (response.ok) {
      alert('Registration successful!');
      window.location.href = '/login.html';
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('An error occurred. Please try again later.');
  }
});