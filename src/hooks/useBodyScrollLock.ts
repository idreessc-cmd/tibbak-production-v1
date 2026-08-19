import { useEffect, useRef } from 'react';

/**
 * Custom hook to lock body scrolling when a drawer, menu, or modal is open.
 * Preserves the exact scroll position before opening and restores it on close.
 */
export function useBodyScrollLock(isOpen: boolean, onClose?: () => void) {
  const scrollYRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    // Save exact scroll position
    scrollYRef.current = window.scrollY;
    const body = document.body;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    const originalStyle = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    // Lock body completely
    body.style.position = 'fixed';
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    // Escape key close handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      // Restore body styles
      body.style.position = originalStyle.position;
      body.style.top = originalStyle.top;
      body.style.left = originalStyle.left;
      body.style.right = originalStyle.right;
      body.style.width = originalStyle.width;
      body.style.overflow = originalStyle.overflow;
      body.style.paddingRight = originalStyle.paddingRight;

      // Restore scroll position
      window.scrollTo(0, scrollYRef.current);
    };
  }, [isOpen, onClose]);
}
