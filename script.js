document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  // Basic form validation
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (name && email && message) {
    alert('Thank you for your message!');
    // Here you can add code to send the form data to your server
    this.reset();
  } else {
    alert('Please fill in all fields.');
  }
});
