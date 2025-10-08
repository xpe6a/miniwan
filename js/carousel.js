// carousel.js - Управление каруселью популярных автомобилей на главной странице

class Carousel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Настройки по умолчанию
        this.settings = {
            itemsToShow: 4,
            itemsToScroll: 1,
            autoPlay: true,
            autoPlayInterval: 4000,
            infinite: true,
            showDots: true,
            showArrows: true,
            responsive: [
                { breakpoint: 1024, itemsToShow: 3 },
                { breakpoint: 768, itemsToShow: 2 },
                { breakpoint: 480, itemsToShow: 1 }
            ],
            ...options
        };
        
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoPlayTimer = null;
        this.items = [];
        
        this.init();
    }
    
    init() {
        this.setupCarousel();
        this.setupEvents();
        if (this.settings.autoPlay) {
            this.startAutoPlay();
        }
        this.updateResponsive();
    }
    
    setupCarousel() {
        // Находим элементы карусели
        this.track = this.container.querySelector('.carousel-inner');
        this.items = Array.from(this.track.querySelectorAll('.carousel-item'));
        
        if (this.items.length === 0) return;
        
        // Создаем структуру карусели
        this.createCarouselStructure();
        this.updateCarousel();
    }
    
    createCarouselStructure() {
        // Добавляем кнопки навигации если нужно
        if (this.settings.showArrows) {
            this.createNavigationArrows();
        }
        
        // Добавляем точки если нужно
        if (this.settings.showDots) {
            this.createDots();
        }
        
        // Клонируем элементы для бесконечной прокрутки
        if (this.settings.infinite && this.items.length > this.settings.itemsToShow) {
            this.setupInfiniteScroll();
        }
    }
    
    createNavigationArrows() {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-arrow carousel-prev';
        prevBtn.innerHTML = '‹';
        prevBtn.addEventListener('click', () => this.prev());
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-arrow carousel-next';
        nextBtn.innerHTML = '›';
        nextBtn.addEventListener('click', () => this.next());
        
        this.container.style.position = 'relative';
        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);
        
        // Добавляем стили для стрелок
        this.addArrowStyles();
    }
    
    addArrowStyles() {
        if (!document.querySelector('#carousel-arrow-styles')) {
            const styles = `
                <style id="carousel-arrow-styles">
                    .carousel-arrow {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        background: rgba(139, 90, 43, 0.8);
                        border: none;
                        color: white;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 20px;
                        font-weight: bold;
                        z-index: 10;
                        transition: all 0.3s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .carousel-arrow:hover {
                        background: rgba(160, 106, 55, 0.9);
                        transform: translateY(-50%) scale(1.1);
                    }
                    .carousel-prev {
                        left: 10px;
                    }
                    .carousel-next {
                        right: 10px;
                    }
                    @media (max-width: 768px) {
                        .carousel-arrow {
                            width: 35px;
                            height: 35px;
                            font-size: 18px;
                        }
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
    
    createDots() {
        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = 'carousel-dots';
        
        for (let i = 0; i < this.getTotalPages(); i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.addEventListener('click', () => this.goToPage(i));
            this.dotsContainer.appendChild(dot);
        }
        
        this.container.appendChild(this.dotsContainer);
        this.addDotsStyles();
        this.updateDots();
    }
    
    addDotsStyles() {
        if (!document.querySelector('#carousel-dots-styles')) {
            const styles = `
                <style id="carousel-dots-styles">
                    .carousel-dots {
                        display: flex;
                        justify-content: center;
                        gap: 8px;
                        margin-top: 20px;
                    }
                    .carousel-dot {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        border: none;
                        background: rgba(212, 196, 168, 0.3);
                        cursor: pointer;
                        transition: all 0.3s;
                    }
                    .carousel-dot.active {
                        background: #8B5A2B;
                        transform: scale(1.2);
                    }
                    .carousel-dot:hover {
                        background: rgba(139, 90, 43, 0.6);
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
    
    setupInfiniteScroll() {
        // Клонируем первые и последние элементы
        const firstItems = this.items.slice(0, this.settings.itemsToShow).map(item => item.cloneNode(true));
        const lastItems = this.items.slice(-this.settings.itemsToShow).map(item => item.cloneNode(true));
        
        // Добавляем клоны в начало и конец
        lastItems.reverse().forEach(item => this.track.insertBefore(item, this.track.firstChild));
        firstItems.forEach(item => this.track.appendChild(item));
        
        // Обновляем список элементов
        this.items = Array.from(this.track.querySelectorAll('.carousel-item'));
        
        // Устанавливаем начальную позицию
        this.currentIndex = this.settings.itemsToShow;
        this.updateCarousel(true);
    }
    
    setupEvents() {
        // Обработчики для свайпа на мобильных
        this.setupTouchEvents();
        
        // Обработчики для паузы автоплея при наведении
        if (this.settings.autoPlay) {
            this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        }
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', () => {
            const diff = startX - endX;
            if (Math.abs(diff) > 50) { // Минимальное расстояние свайпа
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        });
    }
    
    handleResize() {
        this.updateResponsive();
        this.updateCarousel();
    }
    
    updateResponsive() {
        const width = window.innerWidth;
        const responsiveSetting = this.settings.responsive.find(setting => 
            width <= setting.breakpoint
        ) || this.settings;
        
        this.currentItemsToShow = responsiveSetting.itemsToShow;
        this.currentItemsToScroll = responsiveSetting.itemsToScroll || responsiveSetting.itemsToShow;
    }
    
    next() {
        if (this.isAnimating) return;
        
        const totalItems = this.items.length;
        const maxIndex = this.settings.infinite ? 
            totalItems - this.currentItemsToShow : 
            totalItems - this.currentItemsToShow;
        
        if (this.currentIndex >= maxIndex && !this.settings.infinite) return;
        
        this.currentIndex += this.currentItemsToScroll;
        this.updateCarousel();
    }
    
    prev() {
        if (this.isAnimating) return;
        
        if (this.currentIndex <= 0 && !this.settings.infinite) return;
        
        this.currentIndex -= this.currentItemsToScroll;
        this.updateCarousel();
    }
    
    goToSlide(index) {
        if (this.isAnimating) return;
        
        this.currentIndex = index;
        this.updateCarousel();
    }
    
    goToPage(page) {
        const slidesPerPage = this.currentItemsToShow;
        this.currentIndex = page * slidesPerPage;
        this.updateCarousel();
    }
    
    updateCarousel(instant = false) {
        if (this.items.length === 0) return;
        
        this.isAnimating = true;
        
        // Проверка границ для бесконечной прокрутки
        if (this.settings.infinite) {
            this.handleInfiniteBounds();
        } else {
            this.handleBounds();
        }
        
        // Расчет смещения
        const itemWidth = this.items[0].offsetWidth + this.getItemGap();
        const offset = -this.currentIndex * itemWidth;
        
        // Применение анимации
        this.track.style.transition = instant ? 'none' : 'transform 0.5s ease';
        this.track.style.transform = `translateX(${offset}px)`;
        
        // Обновление точек если есть
        if (this.settings.showDots) {
            this.updateDots();
        }
        
        // Сброс флага анимации
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }
    
    handleInfiniteBounds() {
        const totalItems = this.items.length;
        const realItemsCount = totalItems - (2 * this.settings.itemsToShow);
        
        if (this.currentIndex >= totalItems - this.currentItemsToShow) {
            // Достигли конца - переходим к началу реальных элементов
            setTimeout(() => {
                this.currentIndex = this.settings.itemsToShow;
                this.updateCarousel(true);
            }, 500);
        } else if (this.currentIndex < 0) {
            // Достигли начала - переходим к концу реальных элементов
            setTimeout(() => {
                this.currentIndex = realItemsCount;
                this.updateCarousel(true);
            }, 500);
        }
    }
    
    handleBounds() {
        const maxIndex = this.items.length - this.currentItemsToShow;
        this.currentIndex = Math.max(0, Math.min(this.currentIndex, maxIndex));
    }
    
    getItemGap() {
        const style = window.getComputedStyle(this.track);
        return parseFloat(style.gap) || 20;
    }
    
    getTotalPages() {
        return Math.ceil(this.items.length / this.currentItemsToShow);
    }
    
    getCurrentPage() {
        return Math.floor(this.currentIndex / this.currentItemsToShow);
    }
    
    updateDots() {
        if (!this.dotsContainer) return;
        
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        const currentPage = this.getCurrentPage();
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });
    }
    
    startAutoPlay() {
        if (this.autoPlayTimer) return;
        
        this.autoPlayTimer = setInterval(() => {
            this.next();
        }, this.settings.autoPlayInterval);
    }
    
    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    destroy() {
        this.stopAutoPlay();
        // Удаляем все созданные элементы и обработчики
        if (this.dotsContainer) {
            this.dotsContainer.remove();
        }
        
        const arrows = this.container.querySelectorAll('.carousel-arrow');
        arrows.forEach(arrow => arrow.remove());
        
        // Удаляем клонированные элементы для бесконечной прокрутки
        if (this.settings.infinite) {
            const originalItems = this.items.slice(
                this.settings.itemsToShow, 
                this.items.length - this.settings.itemsToShow
            );
            this.track.innerHTML = '';
            originalItems.forEach(item => this.track.appendChild(item));
        }
    }
}

// ==================== ФУНКЦИИ ДЛЯ ЗАГРУЗКИ АВТОМОБИЛЕЙ ====================

// Функция для загрузки данных об автомобилях
async function loadPopularCars() {
    try {
        const response = await fetch('data/cars.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const cars = await response.json();
        
        // Фильтруем популярные автомобили (первые 8)
        const popularCars = cars.filter(car => car.isPopular).slice(0, 8);
        
        const carouselInner = document.getElementById('carouselInner');
        if (!carouselInner) {
            console.error('Элемент карусели не найден');
            return;
        }
        
        // Создаем HTML для каждого автомобиля
        carouselInner.innerHTML = popularCars.map(car => `
            <div class="carousel-item">
                <div class="car-card">
                    <div class="car-image">
                        <img src="${car.images[0]}" alt="${car.brand} ${car.model}" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                        <div class="image-placeholder" style="display: none;">
                            ${car.brand} ${car.model}
                        </div>
                    </div>
                    <div class="car-info">
                        <h3>${car.brand} ${car.model}</h3>
                        <p>${car.year} год • ${car.seats} мест</p>
                        <p>${car.transmission === 'automatic' ? 'Автомат' : 'Механика'} • ${car.fuelType}</p>
                        <div class="car-price">${car.prices["1"].toLocaleString()} ₽/день</div>
                        <div class="car-deposit">Залог: ${car.deposit.toLocaleString()} ₽</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        return popularCars.length > 0;
        
    } catch (error) {
        console.error('Ошибка загрузки автомобилей:', error);
        
        // Показываем заглушку при ошибке
        const carouselInner = document.getElementById('carouselInner');
        if (carouselInner) {
            carouselInner.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #D4C4A8;">
                    <p>Не удалось загрузить автомобили. Попробуйте обновить страницу.</p>
                </div>
            `;
        }
        return false;
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ КАРУСЕЛИ ====================

// Глобальная функция для инициализации карусели
function initCarousel(containerId, options = {}) {
    return new Carousel(containerId, options);
}

// Автоматическая инициализация карусели при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем автомобили и только потом инициализируем карусель
    const carsLoaded = await loadPopularCars();
    
    if (carsLoaded) {
        // Даем небольшую задержку для применения стилей
        setTimeout(() => {
            const mainCarousel = document.getElementById('carouselInner');
            if (mainCarousel && mainCarousel.children.length > 0) {
                initCarousel('carouselInner', {
                    autoPlay: true,
                    autoPlayInterval: 4000,
                    infinite: true,
                    showArrows: true,
                    showDots: true,
                    responsive: [
                        { breakpoint: 1024, itemsToShow: 3 },
                        { breakpoint: 768, itemsToShow: 2 },
                        { breakpoint: 480, itemsToShow: 1 }
                    ]
                });
            }
        }, 100);
    }
});

// Экспорт для использования в других файлах
window.initCarousel = initCarousel;
window.Carousel = Carousel;
window.loadPopularCars = loadPopularCars;