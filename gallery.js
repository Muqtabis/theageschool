// gallery 
let currentIndex = 0;
let images = document.querySelectorAll(".gallery-grid img");
const itemsPerPage = 6; // Show 6 initially
let currentVisible = itemsPerPage;

// ✅ Lightbox Functions
function openLightbox(index) {
  currentIndex = index;
  document.getElementById("lightbox").style.display = "flex";
  showSlide(currentIndex);
}
function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}
function changeSlide(step) {
  currentIndex += step;
  if (currentIndex < 0) currentIndex = images.length - 1;
  if (currentIndex >= images.length) currentIndex = 0;
  showSlide(currentIndex);
}
function showSlide(index) {
  let img = images[index];
  document.getElementById("lightbox-img").src = img.src;
  document.getElementById("lightbox-caption").innerText = img.getAttribute("data-caption");
}

// ✅ Filtering
function filterSelection(category, event) {
  let items = document.querySelectorAll(".filter-item");
  let buttons = document.querySelectorAll(".filter-buttons button");

  buttons.forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");

  items.forEach((item, index) => {
    if (category === "all" || item.classList.contains(category)) {
      if (index < currentVisible) {
        item.classList.remove("hide");
      } else {
        item.classList.add("hide");
      }
    } else {
      item.classList.add("hide");
    }
  });

  // Update images for slideshow
  setTimeout(() => {
    images = document.querySelectorAll(".gallery-grid img:not(.hide)");
  }, 400);
}

// ✅ Load More
document.getElementById("loadMoreBtn").addEventListener("click", () => {
  let items = document.querySelectorAll(".filter-item");
  currentVisible += itemsPerPage;

  items.forEach((item, index) => {
    if (index < currentVisible) {
      item.classList.remove("hide");
    }
  });

  if (currentVisible >= items.length) {
    document.getElementById("loadMoreBtn").style.display = "none";
  }

  setTimeout(() => {
    images = document.querySelectorAll(".gallery-grid img:not(.hide)");
  }, 400);
});

// ✅ Show only first N items on load
window.addEventListener("DOMContentLoaded", () => {
  let items = document.querySelectorAll(".filter-item");
  items.forEach((item, index) => {
    if (index >= itemsPerPage) {
      item.classList.add("hide");
    }
  });
});

// ✅ Keyboard Controls
document.addEventListener("keydown", function(e) {
  let lightbox = document.getElementById("lightbox");
  if (lightbox.style.display === "flex") {
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
    if (e.key === "Escape") closeLightbox();
  }
});
const galleryGrid = document.querySelector(".gallery-grid");

// Render images dynamically
galleryImages.forEach((img, index) => {
  const imageElement = document.createElement("img");
  imageElement.src = img.src;
  imageElement.setAttribute("data-caption", img.caption);
  imageElement.classList.add("filter-item");
  imageElement.onclick = () => openLightbox(index);
  galleryGrid.appendChild(imageElement);
});
