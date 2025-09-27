function handleContactSubmit(e) {
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
}

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }
  const modeToggle = document.getElementById('mode-toggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', toggleMode);
    applyMode();
  }
});
let map;
let darkMode = false;

// Map styles
const lightStyle = []; // default light style
const darkStyle = [
  { elementType: 'geometry', stylers: [{color: '#242f3e'}] },
  { elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}] },
  { elementType: 'labels.text.fill', stylers: [{color: '#746855'}] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}]
  }
];

// Initialize Map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 17.866025529658344, lng: 76.95108130579983}, // Change to your school coordinates
    zoom: 15,
    styles: lightStyle
  });

  // Marker
  new google.maps.Marker({
    position: {lat: 17.866025529658344, lng: 76.95108130579983}, // Change to your school coordinates
    map: map,
    title: 'TheAgeSchool'
  });
}

// Toggle Dark/Light Mode
function toggleMode() {
  darkMode = !darkMode;
  map.setOptions({ styles: darkMode ? darkStyle : lightStyle });
}


