(() => {
  let pendingPos = {
    x: parseFloat(sessionStorage.getItem('demo_cursor_x') || '960'),
    y: parseFloat(sessionStorage.getItem('demo_cursor_y') || '540')
  };
  const savedFlow = sessionStorage.getItem('demo_caption_flow');
  const savedTitle = sessionStorage.getItem('demo_caption_title');
  const savedDesc = sessionStorage.getItem('demo_caption_desc');
  let pendingCaption = (savedFlow && savedTitle) ? { flow: savedFlow, title: savedTitle, desc: savedDesc || '' } : null;

  function ensureElements() {
    const root = document.body || document.documentElement;
    if (!root) return false;

    if (!document.getElementById('demo-cursor-styles')) {
      const style = document.createElement('style');
      style.id = 'demo-cursor-styles';
      style.textContent = `
        * { cursor: none !important; }
        #demo-cursor-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          pointer-events: none !important;
          z-index: 2147483647 !important;
          overflow: hidden !important;
        }
        #demo-cursor-pointer {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 38px !important;
          height: 46px !important;
          transform: translate3d(-100px, -100px, 0);
          will-change: transform;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.65)) drop-shadow(0 0 8px rgba(16,185,129,0.45));
          pointer-events: none !important;
        }
        #demo-cursor-svg {
          transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: 2px 2px;
        }
        .demo-ripple {
          position: absolute !important;
          width: 22px !important;
          height: 22px !important;
          border-radius: 50% !important;
          border: 3px solid #10b981 !important;
          background: radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(16,185,129,0) 70%) !important;
          box-shadow: 0 0 25px rgba(16,185,129,0.95) !important;
          pointer-events: none !important;
          transform: translate(-50%, -50%) scale(0.4);
          animation: demo-ripple-anim 0.65s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        @keyframes demo-ripple-anim {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(4.5); opacity: 0; }
        }
        #demo-hud-caption {
          position: fixed !important;
          bottom: 28px !important;
          top: auto !important;
          left: 50% !important;
          transform: translate(-50%, 12px);
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          padding: 10px 24px !important;
          border-radius: 9999px !important;
          background: rgba(6, 14, 10, 0.94) !important;
          border: 1.5px solid rgba(16, 185, 129, 0.5) !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.65), 0 0 25px rgba(16, 185, 129, 0.25) !important;
          color: #ffffff !important;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          opacity: 0;
          z-index: 2147483647 !important;
          pointer-events: none !important;
          max-width: 90vw !important;
        }
        #demo-hud-caption.visible {
          opacity: 1 !important;
          transform: translate(-50%, 0) !important;
        }
        .demo-hud-badge {
          display: inline-flex !important;
          align-items: center !important;
          gap: 7px !important;
          font-size: 11px !important;
          font-weight: 800 !important;
          letter-spacing: 0.08em !important;
          text-transform: uppercase !important;
          color: #34d399 !important;
          background: rgba(16, 185, 129, 0.18) !important;
          border: 1px solid rgba(16, 185, 129, 0.45) !important;
          padding: 4px 11px !important;
          border-radius: 9999px !important;
          white-space: nowrap !important;
        }
        .demo-hud-dot {
          width: 7px !important;
          height: 7px !important;
          border-radius: 50% !important;
          background: #10b981 !important;
          box-shadow: 0 0 10px #10b981 !important;
          animation: demo-pulse 1.8s infinite !important;
        }
        @keyframes demo-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .demo-hud-title {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
          white-space: nowrap !important;
        }
        .demo-hud-desc {
          font-size: 13px !important;
          font-weight: 400 !important;
          color: #a7f3d0 !important;
          white-space: nowrap !important;
        }
        .demo-hud-divider {
          width: 1px !important;
          height: 14px !important;
          background: rgba(255, 255, 255, 0.25) !important;
        }
      `;
      (document.head || root).appendChild(style);
    }

    let overlay = document.getElementById('demo-cursor-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'demo-cursor-overlay';
      overlay.innerHTML = `
        <div id="demo-cursor-pointer">
          <svg id="demo-cursor-svg" width="38" height="46" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2L14.5 38L19.5 24.5L32.5 22.5L2 2Z" fill="#0A0F0D" stroke="#10B981" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M6 7L14.5 32L18.5 22.5L27.5 21L6 7Z" fill="#FFFFFF"/>
            <circle cx="10" cy="11" r="2.8" fill="#10B981"/>
          </svg>
        </div>
        <div id="demo-hud-caption">
          <span class="demo-hud-badge">
            <span class="demo-hud-dot"></span>
            <span id="demo-hud-badge-text">DEMO</span>
          </span>
          <span id="demo-hud-title" class="demo-hud-title"></span>
          <span class="demo-hud-divider"></span>
          <span id="demo-hud-desc" class="demo-hud-desc"></span>
        </div>
      `;
      root.appendChild(overlay);
    }

    const pointer = document.getElementById('demo-cursor-pointer');
    if (pointer) {
      pointer.style.transform = `translate3d(${pendingPos.x}px, ${pendingPos.y}px, 0)`;
    }

    if (pendingCaption) {
      const badgeText = document.getElementById('demo-hud-badge-text');
      const titleText = document.getElementById('demo-hud-title');
      const descText = document.getElementById('demo-hud-desc');
      const hud = document.getElementById('demo-hud-caption');
      if (badgeText && titleText && descText && hud) {
        badgeText.textContent = pendingCaption.flow;
        titleText.textContent = pendingCaption.title;
        descText.textContent = pendingCaption.desc;
        hud.classList.add('visible');
      }
    }
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ensureElements(), { once: true });
    window.addEventListener('load', () => ensureElements(), { once: true });
  } else {
    ensureElements();
  }

  // Periodic safeguard to guarantee presence across Next.js navigation & rehydration
  setInterval(() => {
    ensureElements();
  }, 300);

  window.__demoCursor = {
    setPos(x, y) {
      pendingPos = { x, y };
      sessionStorage.setItem('demo_cursor_x', String(x));
      sessionStorage.setItem('demo_cursor_y', String(y));
      const pointer = document.getElementById('demo-cursor-pointer');
      if (pointer) {
        pointer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      } else {
        ensureElements();
      }
    },
    getPos() {
      return pendingPos;
    },
    press() {
      const pointerSvg = document.getElementById('demo-cursor-svg');
      if (pointerSvg) {
        pointerSvg.style.transform = 'scale(0.82)';
      }
      const overlay = document.getElementById('demo-cursor-overlay');
      if (overlay) {
        const ripple = document.createElement('div');
        ripple.className = 'demo-ripple';
        ripple.style.left = `${pendingPos.x}px`;
        ripple.style.top = `${pendingPos.y}px`;
        overlay.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      }
    },
    release() {
      const pointerSvg = document.getElementById('demo-cursor-svg');
      if (pointerSvg) {
        pointerSvg.style.transform = 'scale(1)';
      }
    },
    setCaption(flow, title, desc) {
      pendingCaption = { flow, title, desc };
      sessionStorage.setItem('demo_caption_flow', flow);
      sessionStorage.setItem('demo_caption_title', title);
      sessionStorage.setItem('demo_caption_desc', desc);
      ensureElements();
    },
    hideCaption() {
      pendingCaption = null;
      sessionStorage.removeItem('demo_caption_flow');
      sessionStorage.removeItem('demo_caption_title');
      sessionStorage.removeItem('demo_caption_desc');
      const hud = document.getElementById('demo-hud-caption');
      if (hud) hud.classList.remove('visible');
    }
  };
})();
