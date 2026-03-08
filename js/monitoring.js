(function() {
  'use strict';

  // Global error handler
  window.addEventListener('error', function(e) {
    console.error('[monitoring]', e.message, e.filename, e.lineno);

    // Report to analytics if available
    if (typeof window.va === 'function') {
      window.va('event', {
        name: 'js_error',
        data: {
          message: e.message,
          file: e.filename,
          line: e.lineno
        }
      });
    }
  });

  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', function(e) {
    console.error('[monitoring] Unhandled promise rejection:', e.reason);

    if (typeof window.va === 'function') {
      window.va('event', {
        name: 'promise_rejection',
        data: {
          reason: String(e.reason)
        }
      });
    }
  });

  // Performance observer for long tasks
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      var longTaskObserver = new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(entry) {
          if (entry.duration > 100) {
            console.warn('[monitoring] Long task:', entry.duration.toFixed(0) + 'ms');
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // longtask not supported in all browsers
    }
  }
})();
