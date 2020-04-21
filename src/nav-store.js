import { writable } from "svelte/store";

function createNav() {
  const { subscribe, update, set } = writable("messages");

  return {
    subscribe,
    update,
    set,
  };
}

export const nav = createNav();
