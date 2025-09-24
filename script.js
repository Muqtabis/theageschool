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
let map;
let darkMode = false;

// Light style (empty = default)
const lightStyle = [];

// Dark style
const darkStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
];

function initMap() {
    const schoolLocation = { lat: 17.866025529658344, lng: 76.95108130579983 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: schoolLocation,
    });

function toggleMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark", darkMode);
  map.setOptions({ styles: darkMode ? darkStyle : lightStyle });
}

    new google.maps.Marker({ position: schoolLocation, map: map });
  }
window.initMap = initMap;
document.getElementById('mode-toggle').addEventListener('click', toggleMode);