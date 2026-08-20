export function scrollToSection(id) {
  const wrapper = document.querySelector('.scroll-wrapper');
  if (!wrapper) return;

  const rect = wrapper.getBoundingClientRect();
  const scrollTop = window.scrollY + rect.top;
  const scrollHeight = wrapper.offsetHeight - window.innerHeight;

  let targetScroll = scrollTop;

  if (id === 'home') {
    targetScroll = scrollTop;
  } else if (id === 'about') {
    // About is active at the bottom of the scroll wrapper
    targetScroll = scrollTop + scrollHeight;
  }

  window.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  });
}
