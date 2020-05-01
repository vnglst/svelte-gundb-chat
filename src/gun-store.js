import { writable, derived } from "svelte/store";
import Gun from "gun/gun";

const CHAT_ID = "chats-v2";
const MAX_MESSAGES = 200;

const gun = new Gun(["https://phrassed.com/gun"]);

if (process.env.NODE_ENV === "development")
  gun.opt({ peers: ["http://localhost:8765/gun"] });

function createChatStore() {
  const store = writable([]);

  gun
    .get(CHAT_ID)
    .map()
    .on((val, msgId) =>
      // update svelte store for all messages
      // and keep watching for changes
      store.update((state) => {
        // ignore null messages = deleted
        if (!val) {
          delete state[msgId];
          return state;
        }

        state[msgId] = { msgId, ...val };
        return state;
      })
    );

  // derived store that converts key/value object
  // to sorted array of messages (with a max length)
  const chatStore = derived(store, ($store) => {
    const arr = Object.values($store);
    const sorted = arr.sort((a, b) => a.time - b.time);
    const begin = Math.max(0, sorted.length - MAX_MESSAGES);
    const end = arr.length;
    return arr.slice(begin, end);
  });

  return {
    subscribe: chatStore.subscribe,
    delete: (msgId) => {
      gun.get(CHAT_ID).get(msgId).put(null);
    },
    set: (chat) => {
      const msgId = Gun.text.random();
      gun.get(CHAT_ID).get(msgId).put(chat);
    },
  };
}

export const chats = createChatStore();
