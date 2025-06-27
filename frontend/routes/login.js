
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const contraseña = document.getElementById('contraseña').value;
    console.log(email, contraseña)
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, contraseña })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        
        localStorage.setItem('user', JSON.stringify({
          loggedUser: true,
          email: data.email
        }));
        window.location.href = '/index.html';
      } else {
        console.log('Error al iniciar sesión:', data.message);
      }
  
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
    }
  });
  