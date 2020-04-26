import { writable } from "svelte/store";

function createUser() {
  const initialUser = localStorage.getItem("chat_user") || "";

  const { subscribe, update, set } = writable(initialUser);

  subscribe((newUser) => {
    if (newUser) localStorage.setItem("chat_user", newUser);
  });

  return {
    subscribe,
    update,
    set,
  };
}

export const user = createUser();
