// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Projects: filter by Past / Current / Future
  var filterBtns = document.querySelectorAll('[data-filter]');
  var projectCards = document.querySelectorAll('[data-status]');
  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var val = btn.getAttribute('data-filter');
        projectCards.forEach(function (card) {
          var show = val === 'all' || card.getAttribute('data-status') === val;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // Artists: simple search-as-you-type filter
  var searchInput = document.getElementById('artist-search');
  var artistCards = document.querySelectorAll('[data-artist-name]');
  if (searchInput && artistCards.length) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim().toLowerCase();
      artistCards.forEach(function (card) {
        var name = card.getAttribute('data-artist-name').toLowerCase();
        var mediums = (card.getAttribute('data-mediums') || '').toLowerCase();
        var match = name.indexOf(q) !== -1 || mediums.indexOf(q) !== -1;
        card.style.display = match ? '' : 'none';
      });
    });
  }

  // Artists: expand / collapse project history
  document.querySelectorAll('[data-expand-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-expand-toggle'));
      if (!target) return;
      var isOpen = target.classList.toggle('open');
      btn.textContent = isOpen ? 'Hide their work \u2191' : 'See their work \u2193';
    });
  });
});

// Swipeable art carousels (Instagram-style multi-image cards)
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.art-carousel').forEach(function (carousel) {
    var track = carousel.querySelector('.art-carousel-track');
    var dots = carousel.querySelectorAll('.art-carousel-dots span');
    var prevBtn = carousel.querySelector('.art-carousel-arrow.prev');
    var nextBtn = carousel.querySelector('.art-carousel-arrow.next');
    if (!track) return;

    function updateDots() {
      var index = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
    }
    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(updateDots);
    });
    dots.forEach(function (dot, i) {
      dot.parentElement.style.pointerEvents = 'auto';
      dot.addEventListener('click', function () {
        track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
      });
    });
    if (prevBtn) prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    });
  });
});

// Fullscreen lightbox — click any carousel image to view large, swipe to browse
document.addEventListener('DOMContentLoaded', function () {
  var carousels = document.querySelectorAll('.art-carousel');
  if (!carousels.length) return;

  // Build the lightbox DOM once
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML =
    '<button class="lightbox-close" aria-label="Close">&times;</button>' +
    '<button class="lightbox-arrow prev" aria-label="Previous image">&#8249;</button>' +
    '<button class="lightbox-arrow next" aria-label="Next image">&#8250;</button>' +
    '<div class="lightbox-track"></div>' +
    '<div class="lightbox-dots"></div>' +
    '<div class="lightbox-caption"></div>';
  document.body.appendChild(overlay);

  var track = overlay.querySelector('.lightbox-track');
  var dotsWrap = overlay.querySelector('.lightbox-dots');
  var caption = overlay.querySelector('.lightbox-caption');
  var closeBtn = overlay.querySelector('.lightbox-close');
  var prevBtn = overlay.querySelector('.lightbox-arrow.prev');
  var nextBtn = overlay.querySelector('.lightbox-arrow.next');

  var currentCaptionBase = '';

  function openLightbox(images, startIndex, captionText) {
    track.innerHTML = images.map(function (src) {
      return '<div class="lightbox-slide"><img src="' + src + '" alt=""></div>';
    }).join('');
    dotsWrap.innerHTML = images.map(function (_, i) {
      return '<span class="' + (i === startIndex ? 'active' : '') + '"></span>';
    }).join('');
    currentCaptionBase = captionText || '';
    updateCaption(startIndex, images.length);

    overlay.classList.add('open');
    document.body.classList.add('lightbox-locked');

    // Jump to the clicked slide without animating
    requestAnimationFrame(function () {
      track.scrollLeft = startIndex * track.clientWidth;
    });
  }

  function updateCaption(index, total) {
    if (total > 1) {
      caption.textContent = currentCaptionBase ? currentCaptionBase + ' — ' + (index + 1) + ' / ' + total : (index + 1) + ' / ' + total;
    } else {
      caption.textContent = currentCaptionBase;
    }
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.classList.remove('lightbox-locked');
    track.innerHTML = '';
  }

  function currentIndex() {
    return Math.round(track.scrollLeft / track.clientWidth);
  }

  track.addEventListener('scroll', function () {
    window.requestAnimationFrame(function () {
      var idx = currentIndex();
      var dots = dotsWrap.querySelectorAll('span');
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
      updateCaption(idx, dots.length);
    });
  });

  dotsWrap.addEventListener('click', function (e) {
    if (e.target.tagName !== 'SPAN') return;
    var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('span'));
    var i = dots.indexOf(e.target);
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  });

  prevBtn.addEventListener('click', function () {
    track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', function () {
    track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    if (e.key === 'ArrowLeft') track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
  });

  // Wire up every carousel's images to open the lightbox
  carousels.forEach(function (carousel) {
    var imgs = Array.prototype.slice.call(carousel.querySelectorAll('.art-carousel-track img'));
    if (!imgs.length) return;
    var sources = imgs.map(function (img) { return img.src; });

    var card = carousel.closest('.art-card');
    var authorEl = card ? card.querySelector('.art-card-author') : null;
    var titleEl = card ? card.querySelector('.art-card-title') : null;
    var captionText = [authorEl ? authorEl.textContent : '', titleEl ? titleEl.textContent : ''].filter(Boolean).join(' — ');

    imgs.forEach(function (img, i) {
      img.addEventListener('click', function () {
        openLightbox(sources, i, captionText);
      });
    });
  });
});
