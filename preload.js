/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
navigator.serviceWorker
	.getRegistrations()
	.then((registrations) => {
		for (let registration of registrations) {
			registration.unregister();
		}
	})
	.catch((err) => null);

// Disable service worker registration
// @ts-ignore
navigator.serviceWorker.register = new Promise(() => {});

setInterval(() => {
	window.onerror = console.error;
	window.onunhandledrejection = console.error;
}, 500);
