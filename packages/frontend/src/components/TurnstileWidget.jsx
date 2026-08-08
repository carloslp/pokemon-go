import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // test key

/**
 * Renders the Cloudflare Turnstile challenge widget.
 * Calls onVerify(token) when a token is obtained.
 * Calls onExpire() when the token expires.
 */
export default function TurnstileWidget({ onVerify, onExpire }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    function mount() {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current !== null) return; // already mounted
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onVerify?.(token),
        'expired-callback': () => onExpire?.(),
        theme: 'auto',
      });
    }

    // The Turnstile script may not be loaded yet; poll until available.
    if (window.turnstile) {
      mount();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          mount();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [onVerify, onExpire]);

  return <div ref={containerRef} />;
}
