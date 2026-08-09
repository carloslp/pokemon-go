import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

/**
 * Renders the Cloudflare Turnstile challenge widget.
 * Calls onVerify(token) when a token is obtained.
 * Calls onExpire() when the token expires.
 * Calls onError(code) when the widget encounters an error.
 */
export default function TurnstileWidget({ onVerify, onExpire, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY) {
      console.error('[Turnstile] VITE_TURNSTILE_SITE_KEY is not set.');
      return;
    }

    function mount() {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current !== null) return; // already mounted
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onVerify?.(token),
        'expired-callback': () => onExpire?.(),
        'error-callback': (code) => onError?.(code),
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

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onVerify, onExpire, onError]);

  return <div ref={containerRef} />;
}
