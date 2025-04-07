// ANIMAZIONI E LAZY LOADING
document.addEventListener('DOMContentLoaded', function () {
  // Animazioni con IntersectionObserver
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Forza il reflow per fix animazioni
            void entry.target.offsetWidth;
        }
    });
}, { 
    threshold: 0.05, // Trigger più sensibile
    rootMargin: '0px 0px -50px 0px' // Carica 50px prima dello scroll
});

  document.querySelectorAll('.animate').forEach(el => animationObserver.observe(el));

  // Lazy loading immagini
  const lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if(entry.isIntersecting) {
              const img = entry.target;
              const src = img.dataset.src;
              if(src) {
                  img.style.backgroundImage = `url(${src})`;
                  img.classList.add('loaded');
                  lazyLoadObserver.unobserve(img);
              }
          }
      });
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll('[data-src]').forEach(img => lazyLoadObserver.observe(img));
});

// CONTROLLI QUANTITÀ (Ottimizzato con delegazione eventi)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.quantity-controls').forEach(controls => {
      const input = controls.querySelector('input');
      const minusBtn = controls.querySelector('.minus');
      
      const updateButtons = () => {
          minusBtn.style.display = input.value > 0 ? 'flex' : 'none';
          input.dispatchEvent(new Event('change')); // Aggiorna lo stato
      };

      controls.querySelector('.plus').addEventListener('click', () => {
          input.value = Math.min(10, parseInt(input.value) + 1);
          updateButtons();
      });

      controls.querySelector('.minus').addEventListener('click', () => {
          input.value = Math.max(0, parseInt(input.value) - 1);
          updateButtons();
      });

      input.addEventListener('input', () => {
          input.value = input.value.replace(/[^0-9]/g, '');
          updateButtons();
      });

      updateButtons();
  });
});

// GESTIONE ORDINE (Con caching degli elementi DOM)
let productItemsCache = null;
const getProductItems = () => {
  if(!productItemsCache) productItemsCache = document.querySelectorAll('.product-item');
  return productItemsCache;
};

document.addEventListener('DOMContentLoaded', () => {
  const proceedOrderBtn = document.getElementById('proceed-order');
  if(!proceedOrderBtn) return;

  proceedOrderBtn.addEventListener('click', () => {
      const loader = document.querySelector('.loader');
      if(loader) loader.classList.add('active');

      const selectedProducts = [];
      
      getProductItems().forEach(product => {
          const quantityInput = product.querySelector('input[type="number"]');
          const quantity = parseInt(quantityInput.value) || 0;
          if(quantity > 0) {
              selectedProducts.push({
                  name: product.querySelector('h2').innerText,
                  quantity: quantity
              });
          }
      });

      if(selectedProducts.length === 0) {
          alert('Inserisci una quantità maggiore di zero per almeno un prodotto');
          if(loader) loader.classList.remove('active');
          return;
      }

      const message = 'ORDINE:\n' + 
          selectedProducts.map(p => `${p.name} - Quantità: ${p.quantity}`).join('\n');
      
      sessionStorage.setItem('ordineCorrente', message);
      window.location.href = 'contatti.html';
  });
});

// PRE-COMPILAZIONE MESSAGGIO (Ottimizzato)
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.querySelector('textarea[name="messaggio"]');
  if(textarea) {
      const ordine = sessionStorage.getItem('ordineCorrente');
      if(ordine) {
          textarea.value = ordine;
          sessionStorage.removeItem('ordineCorrente');
          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }
});

// HAMBURGER MENU MOBILE
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  const overlay = document.querySelector('.menu-overlay');
  const navItems = document.querySelectorAll('.nav-item a');

  // Funzione per chiudere il menu
  const closeMenu = () => {
    hamburger.classList.remove('active');
    nav.style.transform = 'translateX(-110%) skewX(-5deg)';
    nav.style.opacity = '0';
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  };

  // Toggle menu
  if(hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : 'auto';
    });
  }

  // Chiudi menu al click sull'overlay
  if(overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  // Chiudi menu al click sui link (mobile)
  if(navItems.length > 0) {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if(window.innerWidth <= 768) {
                closeMenu();
                // Aggiungi ritardo per permettere la transizione
                setTimeout(() => {
                    window.location.href = item.getAttribute('href');
                }, 300);
            }
        });
    });
}

  // Chiudi menu con ESC
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && nav.classList.contains('active')) {
      closeMenu();
    }
  });

  // Ottimizzazione resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    if(window.innerWidth > 768 && nav.classList.contains('active')) {
      closeMenu();
    }
    else {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        document.querySelectorAll('.animate').forEach(el => {
          if(el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('visible');
          }
        });
      }, 250);
    }
  });
});

// Highlight cards mobile interaction
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.card-wrap');
  
  if(cards.length > 0) { // Controllo sicurezza se esistono elementi
    const closeAllCards = () => {
      cards.forEach(card => card.classList.remove('active'));
    };

    const handleCardClick = (e) => {
      e.stopPropagation();
      const card = e.currentTarget;
      
      if(card.classList.contains('active')) {
        card.classList.remove('active');
      } else {
        closeAllCards();
        card.classList.add('active');
      }
    };

    if(window.innerWidth <= 768) {
      cards.forEach(card => {
        card.removeEventListener('click', handleCardClick); // Pulizia eventuali listener precedenti
        card.addEventListener('click', handleCardClick);
      });

      // Chiudi le card cliccando fuori
      document.removeEventListener('click', closeAllCards);
      document.addEventListener('click', closeAllCards);
    }
  }
});