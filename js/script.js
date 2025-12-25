// ============================================
// PYX STUDIO - UNIFIED JAVASCRIPT
// ============================================

(function() {
  'use strict';

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // ============================================
  // UNIFIED REVEAL SYSTEM - IntersectionObserver
  // ============================================
  
  class RevealAnimation {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      // Опции для IntersectionObserver
      const options = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
      };

      // Создаём единый observer
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            
            // Для элементов с word-анимацией
            if (entry.target.hasAttribute('data-word-animate')) {
              this.animateWords(entry.target);
            }
          }
        });
      }, options);

      // Наблюдаем за всеми элементами с классом .reveal
      this.observeElements();
    }

    observeElements() {
      const elements = document.querySelectorAll('.reveal');
      elements.forEach(el => this.observer.observe(el));
    }

    animateWords(element) {
      const words = element.querySelectorAll('.word');
      
      words.forEach((word, index) => {
        setTimeout(() => {
          word.classList.add('is-on');
        }, index * 100); // 100ms задержка между словами
      });
    }

    // Метод для добавления новых элементов в наблюдение
    observe(element) {
      if (this.observer && element) {
        this.observer.observe(element);
      }
    }
  }

  // ============================================
  // STORY SECTION - Word-by-word animation (ORIGINAL)
  // ============================================
  
  class StoryAnimation {
    constructor() {
      this.heading = document.querySelector('.left-column-header h4');
      this.hrLine = document.querySelector('.left-column-header .hr-line');
      this.paragraphs = document.querySelectorAll('.animated-text-block .text-paragraph');
      this.init();
    }

    init() {
      if (!this.heading || !this.hrLine || this.paragraphs.length === 0) return;

      // Оборачиваем слова
      const headingWords = this.wrapWords(this.heading);
      const allParagraphWords = Array.from(this.paragraphs).flatMap(p => 
        Array.from(this.wrapWords(p))
      );

      // Запуск при появлении секции
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.animate(headingWords, allParagraphWords);
          observer.disconnect();
        }
      }, { threshold: 0.3 });

      const storySection = document.querySelector('.story');
      if (storySection) {
        observer.observe(storySection);
      }
    }

    wrapWords(element) {
      const text = element.textContent.trim();
      const words = text.split(/\s+/);
      element.innerHTML = words.map(word => 
        `<span class="word" style="color:#1a1a1a; transition:color 0.8s ease">${word}</span>`
      ).join(' ');
      return element.querySelectorAll('.word');
    }

    animate(headingWords, allParagraphWords) {
      let delay = 0;
      const step = 25;

      // Анимация заголовка
      headingWords.forEach(word => {
        setTimeout(() => {
          word.style.color = '#9aa0a6';
          setTimeout(() => word.style.color = '#f6f6f6', 50);
        }, delay);
        delay += step;
      });

      // Анимация линии
      setTimeout(() => {
        this.hrLine.style.background = '#9aa0a6';
        setTimeout(() => this.hrLine.style.background = '#ffffffff', 50);
      }, delay);

      delay += 200;

      // Анимация параграфов
      allParagraphWords.forEach(word => {
        setTimeout(() => {
          word.style.color = '#9aa0a6';
          setTimeout(() => word.style.color = '#ffffffff', 50);
        }, delay);
        delay += step;
      });
    }
  }

  // ============================================
  // TEXT ANIMATION - Разбивка на слова (для других секций)
  // ============================================
  
  class TextAnimator {
    constructor(selector) {
      this.elements = document.querySelectorAll(selector);
      this.init();
    }

    init() {
      // Исключаем элементы из .story секции
      this.elements.forEach(element => {
        if (!element.closest('.story')) {
          this.wrapWords(element);
        }
      });
    }

    wrapWords(element) {
      const text = element.textContent;
      const words = text.split(' ').filter(word => word.length > 0);
      
      element.innerHTML = words
        .map(word => `<span class="word">${word}</span>`)
        .join(' ');
      
      // Добавляем атрибут для reveal system
      element.setAttribute('data-word-animate', 'true');
    }
  }

// ============================================
// PROJECTS TABS SWITCHER - Improved hover + click
// ============================================

class ProjectTabs {
  constructor() {
    this.tabs = document.querySelectorAll('.tab-row');
    this.mainImage = document.getElementById('projectMainImage');
    this.tabsContainer = document.querySelector('.projects-tabs');
    this.init();
  }

  init() {
    if (!this.tabs.length || !this.mainImage || !this.tabsContainer) return;

    // Предзагрузка всех изображений
    this.tabs.forEach(tab => {
      const imgUrl = tab.getAttribute('data-image');
      if (imgUrl) {
        const img = new Image();
        img.src = imgUrl;
      }
    });

    // Устанавливаем первое изображение и активный таб
    const firstTab = this.tabs[0];
    this.mainImage.src = firstTab.getAttribute('data-image');
    firstTab.classList.add('selected');

    // Основная функция переключения
    this.setActiveTab = (tab) => {
      this.tabs.forEach(t => t.classList.remove('selected'));
      tab.classList.add('selected');

      const newSrc = tab.getAttribute('data-image');
      if (newSrc && newSrc !== this.mainImage.src) {
        this.mainImage.style.opacity = '0.7';
        setTimeout(() => {
          this.mainImage.src = newSrc;
          this.mainImage.style.opacity = '1';
        }, 150);
      }
    };

    // Ховер (десктоп)
    this.tabs.forEach(tab => {
      tab.addEventListener('mouseenter', () => this.setActiveTab(tab));
    });

    // Клик (мобильные + если хочешь фиксировать выбор)
    this.tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActiveTab(tab);
      });
    });
  }
}

  // ============================================
  // FOOTER YEAR
  // ============================================
  
  function updateFooterYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  
class SmoothScroll {
  constructor(options = {}) {
    this.lenis = null;

    // Настройки по умолчанию + твои (можешь переопределять)
    this.options = {
      lerp: 0.08,            // "вязкость": 0.06–0.12 обычно топ
      wheelMultiplier: 1.1,  // "скорость" колеса: 0.8–1.5
      smoothWheel: true,
      smoothTouch: false,    // на мобилках чаще лучше натив
      ...options,
    };

    this._rafId = null;

    // bind
    this.raf = this.raf.bind(this);
    this.onAnchorClick = this.onAnchorClick.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  init() {
    // если уже был запущен — корректно переинициализируем
    if (this.lenis) this.destroy();

    if (typeof Lenis === "undefined") {
      console.error("[SmoothScroll] Lenis is not loaded. Check script include.");
      return;
    }

    this.lenis = new Lenis(this.options);

    // RAF loop
    this._rafId = requestAnimationFrame(this.raf);

    // events
    document.addEventListener("click", this.onAnchorClick);
    window.addEventListener("resize", this.onResize, { passive: true });

    // (опционально) если у тебя есть элементы, которые меняют высоту после загрузки (картинки)
    // можно дернуть resize чуть позже:
    setTimeout(() => this.lenis?.resize(), 0);
  }

  raf(time) {
    this.lenis?.raf(time);
    this._rafId = requestAnimationFrame(this.raf);
  }

  onResize() {
    // Lenis пересчитает размеры
    this.lenis?.resize();
  }

  onAnchorClick(e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#" || href === "#!") return;

    // Если это не валидный селектор или нет элемента — выходим
    let target = null;
    try {
      target = document.querySelector(href);
    } catch {
      return;
    }
    if (!target) return;

    e.preventDefault();
    history.pushState(null, "", href);

    // offset под фиксированный header
    const header = document.querySelector(".site-header");
    const offset = header ? -header.offsetHeight : 0;

    this.lenis?.scrollTo(target, {
      offset,
      duration: 2, // скорость прокрутки к якорю (сек)
      easing: (t) => 1 - Math.pow(1 - t, 3), // мягкий easeOutCubic
      // immediate: false,
      // lock: false,
    });
  }

  // Менять "вязкость" и скорость на лету
  setFeel({ lerp, wheelMultiplier } = {}) {
    if (!this.lenis) return;
    if (typeof lerp === "number") this.lenis.options.lerp = lerp;
    if (typeof wheelMultiplier === "number") this.lenis.options.wheelMultiplier = wheelMultiplier;
  }

  // Удобный метод, если нужен ручной скролл к элементу
  scrollTo(target, opts = {}) {
    if (!this.lenis) return;
    this.lenis.scrollTo(target, opts);
  }

  destroy() {
    document.removeEventListener("click", this.onAnchorClick);
    window.removeEventListener("resize", this.onResize);

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    this.lenis?.destroy();
    this.lenis = null;
  }
}

  // ============================================
  // PARTNERS CAROUSEL - Infinite scroll fix
  // ============================================
  
  class PartnersCarousel {
    constructor() {
      this.track = document.getElementById('partnersTrack');
      this.init();
    }

    init() {
      if (!this.track) return;

      // Клонируем партнёров для бесконечной прокрутки
      const partners = Array.from(this.track.children);
      
      // Дублируем для плавной бесконечности
      partners.forEach(partner => {
        const clone = partner.cloneNode(true);
        this.track.appendChild(clone);
      });
    }
  }

  // ============================================
  // HEADER SCROLL BEHAVIOR
  // ============================================
  
  class HeaderScroll {
    constructor() {
      this.header = document.querySelector('.site-header');
      this.lastScroll = 0;
      this.init();
    }

    init() {
      if (!this.header) return;

      window.addEventListener('scroll', debounce(() => {
        const currentScroll = window.pageYOffset;
        
        // Добавляем класс при скролле
        if (currentScroll > 100) {
          this.header.classList.add('scrolled');
        } else {
          this.header.classList.remove('scrolled');
        }

        this.lastScroll = currentScroll;
      }, 10));
    }
  }

  // ============================================
  // FORM HANDLING (optional)
  // ============================================
  
  class ContactForm {
    constructor() {
      this.form = document.getElementById('contact-form');
      this.init();
    }

    init() {
      if (!this.form) return;

      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    handleSubmit() {
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);
      
      console.log('Form data:', data);
      
      // Здесь можно добавить отправку на сервер
      // Пока просто показываем успешное сообщение
      alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
      this.form.reset();
    }
  }

  // ============================================
  // HERO MARQUEE - Fix infinite scroll
  // ============================================
  
  class HeroMarquee {
    constructor() {
      this.marquee = document.querySelector('.marquee');
      this.init();
    }

    init() {
      if (!this.marquee) return;

      // Дублируем контент для плавной бесконечности
      const spans = Array.from(this.marquee.children);
      
      // Добавляем копии
      spans.forEach(span => {
        const clone = span.cloneNode(true);
        this.marquee.appendChild(clone);
      });
    }
  }

  // ============================================
  // RESPONSIVE NAVIGATION (Mobile Menu)
  // ============================================
  
  class MobileMenu {
    constructor() {
      this.header = document.querySelector('.site-header');
      this.init();
    }

    init() {
      // Проверяем ширину экрана
      const checkMobile = () => {
        if (window.innerWidth <= 768) {
          this.enableMobileMenu();
        } else {
          this.disableMobileMenu();
        }
      };

      checkMobile();
      window.addEventListener('resize', debounce(checkMobile, 200));
    }

    enableMobileMenu() {
      // Логика для мобильного меню (если нужно)
      // Можно добавить бургер-меню и т.д.
    }

    disableMobileMenu() {
      // Отключаем мобильное меню на десктопе
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  function init() {
    // Инициализация всех компонентов
    const revealSystem = new RevealAnimation();
    
    // ВАЖНО: Специальная анимация для Story секции (оригинальная)
    const storyAnimation = new StoryAnimation();
    
    // Текстовые анимации для остальных заголовков (не для story)
    const textAnimator = new TextAnimator('.animated-text-block p');
    
    // Табы проектов
    const projectTabs = new ProjectTabs();
    
    // Обновление года в футере
    updateFooterYear();
    
    // Плавный скролл
    const smoothScroll = new SmoothScroll({
      lerp: 0.05,
      wheelMultiplier: 0.7,
    });
    smoothScroll.init();
    
    // Карусель партнёров
    const partnersCarousel = new PartnersCarousel();
    
    // Поведение хедера при скролле
    const headerScroll = new HeaderScroll();
    
    // Форма обратной связи
    const contactForm = new ContactForm();
    
    // Hero marquee fix
    const heroMarquee = new HeroMarquee();
    
    // Мобильное меню
    const mobileMenu = new MobileMenu();

    // Добавляем reveal класс к элементам, которые должны анимироваться
    // НО исключаем .story секцию - у неё своя анимация
    document.querySelectorAll('.section-heading, .project-big, .card, .cta-block').forEach(el => {
      if (!el.closest('.story')) {
        el.classList.add('reveal');
        revealSystem.observe(el);
      }
    });

    console.log('✨ PYX Studio initialized');
  }

  // ============================================
  // START APPLICATION
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();