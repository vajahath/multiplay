/**
 * App Version Store
 * 
 * Manages app version and PWA update detection.
 */

// This will be replaced during build by vite
export const APP_VERSION = __APP_VERSION__;

/**
 * Store for managing PWA updates
 */
class UpdateStore {
    hasUpdate = $state(false);
    private registration: ServiceWorkerRegistration | null = null;
    private waitingWorker: ServiceWorker | null = null;

    /**
     * Register service worker and listen for updates
     */
    async init(): Promise<void> {
        if (!('serviceWorker' in navigator)) {
            console.log('Service workers not supported');
            return;
        }

        try {
            // Use relative paths to support subpath deployments (like GitHub Pages)
            this.registration = await navigator.serviceWorker.register('./sw.js', {
                scope: './',
            });

            // Check for waiting worker (update already downloaded)
            if (this.registration.waiting) {
                this.waitingWorker = this.registration.waiting;
                this.hasUpdate = true;
            }

            // Listen for new service worker installing
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration?.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New update available
                        this.waitingWorker = newWorker;
                        this.hasUpdate = true;
                        console.log('New app version available!');
                    }
                });
            });

            // Handle controller change (when skipWaiting is called)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });

            console.log('Service worker registered');
        } catch (error) {
            console.error('Service worker registration failed:', error);
        }
    }

    /**
     * Apply the pending update
     */
    applyUpdate(): void {
        if (!this.waitingWorker) {
            console.warn('No waiting worker to activate');
            return;
        }

        // Tell the waiting worker to skipWaiting
        this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }

    /**
     * Check for updates manually
     */
    async checkForUpdates(): Promise<void> {
        if (this.registration) {
            await this.registration.update();
        }
    }
}

export const updateStore = new UpdateStore();
