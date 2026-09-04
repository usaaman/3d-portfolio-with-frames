/**
 * Enhanced scroll targets utility for ultra-smooth section transitions.
 * Accurately aligns sections within both virtual pinned stages and standard document flow.
 */
export function scrollToSection(id) {
  if (id === 'home') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    return;
  }

  const wrapper = document.querySelector('.scroll-wrapper');

  if (wrapper) {
    const rect = wrapper.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top;
    const maxScrollDistance = Math.max(1, wrapper.offsetHeight - window.innerHeight);

    if (id === 'about') {
      window.scrollTo({
        top: Math.round(scrollTop + (maxScrollDistance * 0.58)),
        behavior: 'smooth'
      });
      return;
    }

    if (id === 'skills') {
      window.scrollTo({
        top: Math.round(scrollTop + (maxScrollDistance * 0.88)),
        behavior: 'smooth'
      });
      return;
    }
  }

  // Projects, Services, Contact sections
  const targetElement = document.getElementById(id);
  if (targetElement) {
    const headerOffset = 20; // Sleek offset for floating nav dock
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(0, Math.round(offsetPosition)),
      behavior: 'smooth'
    });
  }
}
