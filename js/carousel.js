// Carousel functionality for popular cars on homepage
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
});

async function initializeCarousel() {
    try {
        const response = await fetch('data/cars.json');
        const allCars = await response.json();
        
        // Get popular cars (isPopular: true)
        const popularCars = allCars.filter(car => car.isPopular === true);
        
        if (popularCars.length > 0) {
            renderCarousel(popularCars);
            setupCarouselNavigation();
        } else {
            // Fallback: show first 4 cars if no popular ones
            renderCarousel(allCars.slice(0, 4));
            setupCarouselNavigation();
        }
    } catch (error) {
        console.error('Error loading carousel data:', error);
        showCarouselError();
    }
}

function renderCarousel(cars) {
    const carouselInner = document.getElementById('carouselInner');
    
    if (!carouselInner) {
        console.error('Carousel inner element not found');
        return;
    }
    
    carouselInner.innerHTML = cars.map(car => `
        <div class="carousel-item">
            <div class="car-card" onclick="window.location.href='car-detail.html?id=${car.id}'">
                <div class="car-image">
                    <img src="${car.images[0]}" alt="${car.brand} ${car.model}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="image-placeholder" style="display: none;">
                        ${car.brand} ${car.model}
                    </div>
                    ${car.isPopular ? '<div class="car-badge">Популярный</div>' : ''}
                </div>
                <div class="car-info">
                    <h3>${car.brand} ${car.model}</h3>
                    <p>${car.year} год • ${car.seats} мест</p>
                    <p>${car.transmission === 'automatic' ? 'АКПП' : 'МКПП'} • ${car.fuelType}</p>
                    <div class="car-price">
                        от ${car.prices["21"]} ₽ <span class="car-price-period">/ день</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function setupCarouselNavigation() {
    const carouselInner = document.getElementById('carouselInner');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    
    if (!carouselInner || !prevButton || !nextButton) {
        console.error('Carousel navigation elements not found');
        return;
    }
    
    let currentPosition = 0;
    const itemWidth = document.querySelector('.carousel-item').offsetWidth + 20; // width + gap
    const visibleItems = getVisibleItemsCount();
    
    function updateNavigation() {
        prevButton.style.display = currentPosition === 0 ? 'none' : 'flex';
        
        const totalWidth = carouselInner.scrollWidth;
        const containerWidth = carouselInner.parentElement.offsetWidth;
        const maxPosition = totalWidth - containerWidth;
        
        nextButton.style.display = currentPosition >= maxPosition ? 'none' : 'flex';
    }
    
    function moveCarousel(direction) {
        const totalWidth = carouselInner.scrollWidth;
        const containerWidth = carouselInner.parentElement.offsetWidth;
        const maxPosition = totalWidth - containerWidth;
        
        if (direction === 'next') {
            currentPosition = Math.min(currentPosition + itemWidth * visibleItems, maxPosition);
        } else {
            currentPosition = Math.max(currentPosition - itemWidth * visibleItems, 0);
        }
        
        carouselInner.style.transform = `translateX(-${currentPosition}px)`;
        updateNavigation();
    }
    
    prevButton.addEventListener('click', () => moveCarousel('prev'));
    nextButton.addEventListener('click', () => moveCarousel('next'));
    
    // Handle window resize
    window.addEventListener('resize', function() {
        currentPosition = 0;
        carouselInner.style.transform = `translateX(0px)`;
        updateNavigation();
    });
    
    updateNavigation();
}

function getVisibleItemsCount() {
    const width = window.innerWidth;
    
    if (width < 768) return 1;
    if (width < 1024) return 2;
    if (width < 1200) return 3;
    return 4;
}

function showCarouselError() {
    const carouselInner = document.getElementById('carouselInner');
    if (carouselInner) {
        carouselInner.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #D4C4A8;">
                <p>Не удалось загрузить популярные модели</p>
                <a href="catalog.html" class="btn btn-primary" style="margin-top: 15px;">Перейти в каталог</a>
            </div>
        `;
    }
}

// Add CSS for carousel if not already in main styles
function injectCarouselStyles() {
    if (!document.getElementById('carousel-styles')) {
        const styles = `
            .carousel {
                max-width: 1200px;
                margin: 0 auto;
                overflow: hidden;
                position: relative;
            }
            
            .carousel-inner {
                display: flex;
                transition: transform 0.5s ease;
                gap: 20px;
            }
            
            .carousel-item {
                min-width: calc(25% - 15px);
                flex-shrink: 0;
            }
            
            .car-card {
                background: rgba(40, 30, 25, 0.8);
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                height: 100%;
                cursor: pointer;
                transition: transform 0.3s;
            }
            
            .car-card:hover {
                transform: translateY(-5px);
            }
            
            .car-image {
                height: 180px;
                background: #5D4037;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                position: relative;
            }
            
            .car-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s;
            }
            
            .car-card:hover .car-image img {
                transform: scale(1.05);
            }
            
            .image-placeholder {
                color: #D4C4A8;
                font-size: 0.9rem;
                text-align: center;
            }
            
            .car-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #8B5A2B;
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .car-info {
                padding: 15px;
            }
            
            .car-info h3 {
                margin: 0 0 8px 0;
                color: #E8DCC5;
                font-size: 1.1rem;
            }
            
            .car-info p {
                color: #D4C4A8;
                margin: 4px 0;
                font-size: 0.85rem;
            }
            
            .car-price {
                font-size: 1.1rem;
                font-weight: bold;
                color: #8B5A2B;
                margin-top: 8px;
            }
            
            .car-price-period {
                font-size: 0.8rem;
                color: #D4C4A8;
                font-weight: normal;
            }
            
            .carousel-nav {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 20px;
            }
            
            .carousel-prev,
            .carousel-next {
                background: rgba(40, 30, 25, 0.8);
                border: 1px solid #8B5A2B;
                border-radius: 5px;
                color: #E8DCC5;
                cursor: pointer;
                padding: 10px 15px;
                transition: all 0.3s;
            }
            
            .carousel-prev:hover,
            .carousel-next:hover {
                background: #8B5A2B;
            }
            
            @media (max-width: 1200px) {
                .carousel-item {
                    min-width: calc(33.333% - 13.33px);
                }
            }
            
            @media (max-width: 768px) {
                .carousel-item {
                    min-width: calc(50% - 10px);
                }
            }
            
            @media (max-width: 480px) {
                .carousel-item {
                    min-width: 100%;
                }
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'carousel-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
}

// Initialize styles when DOM is loaded
document.addEventListener('DOMContentLoaded', injectCarouselStyles);