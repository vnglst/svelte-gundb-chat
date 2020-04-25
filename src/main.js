import App from "./App.svelte";

document.body.innerHTML = "";

const app = new App({
  target: document.body,
});

const production = process.env.NODE_ENV === "production";
// Check that service workers are supported
// only load in production
if ("serviceWorker" in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener("load", () => {
    // only load in production
    if (production) navigator.serviceWorker.register("serviceworker.js");

    // remove all old service workers when developing
    if (!production) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        console.log("Unloading service workers", registrations);
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
  });
}

export default app;
