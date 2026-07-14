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
