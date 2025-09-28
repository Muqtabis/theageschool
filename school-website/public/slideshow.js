// public/slideshow.js

document.addEventListener('DOMContentLoaded', () => {
    const slideshow = document.querySelector('.slideshow');
    const dotContainer = document.getElementById('dot-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    let featuredPhotos = [];
    let currentIndex = 0;
    let slideInterval; // Variable to hold our autoplay timer

    // --- Main Function to Initialize the Slideshow ---
    async function initSlideshow() {
        try {
            const response = await fetch('/api/featured-photos');
            if (!response.ok) throw new Error('Could not load photos');
            
            featuredPhotos = await response.json();
            
            if (featuredPhotos.length > 0) {
                createSlides();
                createDots();
                showSlide(currentIndex);
                startAutoplay();
            } else {
                document.querySelector('.slideshow-container').style.display = 'none';
            }
        } catch (error) {
            console.error('Slideshow Error:', error);
            document.querySelector('.slideshow-container').style.display = 'none';
        }
    }

    // --- Create HTML elements for slides and dots ---
    function createSlides() {
        featuredPhotos.forEach(photo => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.innerHTML = `
                <img src="${photo.src}" alt="${photo.caption}">
                <p class="slide-caption">${photo.caption}</p>
            `;
            slideshow.insertBefore(slide, prevBtn); // Insert before the buttons
        });
    }
    
    function createDots() {
        featuredPhotos.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.dataset.index = index;
            dot.addEventListener('click', () => {
                jumpToSlide(index);
            });
            dotContainer.appendChild(dot);
        });
    }

    // --- Core function to display a specific slide ---
    function showSlide(index) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        
        // Hide all slides
        slides.forEach(slide => slide.style.display = 'none');
        // Deactivate all dots
        dots.forEach(dot => dot.classList.remove('active'));

        // Show the correct slide and activate the corresponding dot
        slides[index].style.display = 'block';
        dots[index].classList.add('active');
    }

    // --- Control Functions ---
    function nextSlide() {
        currentIndex++;
        if (currentIndex >= featuredPhotos.length) {
            currentIndex = 0; // Loop back to the first photo
        }
        showSlide(currentIndex);
    }
    
    function prevSlide() {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = featuredPhotos.length - 1; // Loop back to the last photo
        }
        showSlide(currentIndex);
    }

    function jumpToSlide(index) {
        currentIndex = index;
        showSlide(currentIndex);
    }

    // --- Autoplay Logic ---
    function startAutoplay() {
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }
    
    function resetAutoplay() {
        clearInterval(slideInterval);
        startAutoplay();
    }

    // --- Event Listeners ---
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });

    // --- Initial Load ---
    initSlideshow();
});