import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    const main = document.getElementById('main-content');
    if (main) {
      main.focus({ preventScroll: true });
    }
  }, [pathname, search]);

  return null;
}
