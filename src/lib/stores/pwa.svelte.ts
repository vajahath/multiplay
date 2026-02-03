/**
 * PWA Install Store
 * 
 * Manages the "Add to Home Screen" prompt state and detection.
 */

class PWAStore {
    canInstall = $state(false);
    isInstalled = $state(false);
    private deferredPrompt: any = null;

    constructor() {
        if (typeof window !== 'undefined') {
            // Check if already installed
            this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;

            // Listen for the install prompt
            window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent the mini-infobar from appearing on mobile
                e.preventDefault();
                // Stash the event so it can be triggered later.
                this.deferredPrompt = e;
                // Update UI notify the user they can install the PWA
                this.canInstall = true;
                console.log('PWA installation is available');
            });

            // Listen for appinstalled
            window.addEventListener('appinstalled', (e) => {
                console.log('PWA was installed');
                this.isInstalled = true;
                this.canInstall = false;
                this.deferredPrompt = null;
            });
        }
    }

    /**
     * Trigger the native installation prompt
     */
    async install(): Promise<void> {
        if (!this.deferredPrompt) {
            console.warn('Install prompt not available');
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        this.deferredPrompt = null;
        this.canInstall = false;
    }

    /**
     * Check if the device is iOS
     */
    get isIOS(): boolean {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    }
}

export const pwaStore = new PWAStore();
