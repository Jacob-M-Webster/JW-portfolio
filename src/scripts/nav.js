const navLinks = document.querySelectorAll('.nav-links a')

window.addEventListener('scroll', () => {
  let current = 'hero-section'
  document.querySelectorAll('section[id]').forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id
  })
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current))
}, { passive: true })
