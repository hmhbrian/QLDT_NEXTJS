/**
 * Global Error Handler for Chunk Loading Errors
 * Handles unhandled chunk errors and provides recovery options
 */

export class GlobalErrorHandler {
    private static instance: GlobalErrorHandler;
    private isInitialized = false;

    public static getInstance(): GlobalErrorHandler {
        if (!GlobalErrorHandler.instance) {
            GlobalErrorHandler.instance = new GlobalErrorHandler();
        }
        return GlobalErrorHandler.instance;
    }

    public initialize(): void {
        if (this.isInitialized || typeof window === 'undefined') {
            return;
        }

        // Handle unhandled promise rejections (common for chunk loading)
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);

        // Handle global JavaScript errors
        window.addEventListener('error', this.handleGlobalError);

        this.isInitialized = true;
        console.log('🛡️ Global error handler initialized');
    }

    public cleanup(): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        window.removeEventListener('error', this.handleGlobalError);
        this.isInitialized = false;
    }

    private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
        const error = event.reason;

        if (this.isChunkError(error)) {
            console.warn('🔥 Unhandled chunk loading error detected:', error);
            event.preventDefault(); // Prevent default error handling
            this.handleChunkError(error);
        }
    };

    private handleGlobalError = (event: ErrorEvent): void => {
        const error = event.error;

        if (this.isChunkError(error)) {
            console.warn('🔥 Global chunk loading error detected:', error);
            event.preventDefault(); // Prevent default error handling
            this.handleChunkError(error);
        }
    };

    private isChunkError(error: any): boolean {
        if (!error) return false;

        const errorString = (error.toString() + (error.stack || '')).toLowerCase();
        const chunkErrorIndicators = [
            'chunkloaderror',
            'loading chunk',
            'webpack',
            '__webpack_require__',
            'loading css chunk',
            'failed to fetch dynamically imported module'
        ];

        return chunkErrorIndicators.some(indicator =>
            errorString.includes(indicator)
        );
    }

    private handleChunkError(error: any): void {
        // Show user-friendly notification
        this.showChunkErrorNotification();

        // Auto-recovery after a delay
        setTimeout(() => {
            this.performChunkErrorRecovery();
        }, 3000);
    }

    private showChunkErrorNotification(): void {
        // Create or update notification
        let notification = document.getElementById('chunk-error-notification');

        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'chunk-error-notification';
            notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 16px;
        max-width: 320px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      `;

            notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="color: #dc2626; margin-top: 2px;">⚠️</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #991b1b; font-size: 14px; margin-bottom: 4px;">
              Lỗi Tải Ứng Dụng
            </div>
            <div style="color: #7f1d1d; font-size: 12px; line-height: 1.4;">
              Phát hiện lỗi chunk loading. Đang tự động khôi phục...
            </div>
          </div>
        </div>
      `;

            document.body.appendChild(notification);
        }

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    private performChunkErrorRecovery(): void {
        console.log('🔄 Performing automatic chunk error recovery');

        // Clear caches if available
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }

        // Clear some storage but keep user session if possible
        sessionStorage.clear();

        // Force reload with cache bust
        window.location.href = window.location.href +
            (window.location.href.includes('?') ? '&' : '?') +
            't=' + Date.now();
    }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
    const globalErrorHandler = GlobalErrorHandler.getInstance();

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            globalErrorHandler.initialize();
        });
    } else {
        globalErrorHandler.initialize();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        globalErrorHandler.cleanup();
    });
}

export default GlobalErrorHandler;
