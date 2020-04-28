import { writable } from "svelte/store";
import Gun from "gun/gun";

function removeById(arr, msgId) {
  for (let i in arr) {
    if (arr[i].msgId == msgId) {
      arr.splice(i, 1);
      break;
    }
  }
}

function createStore() {
  const gun = new Gun([
    // "http://localhost:8765/gun",
    "https://phrassed.com/gun",
    // "https://gunjs.herokuapp.com/gun", // Don't use, unstable
  ]);

  const { subscribe, update } = writable([]);
  const chats = gun.get("chats-v2"); // "chats" version 1 was "bombed" to death with too many large messages

  chats.map().on((val, id) => {
    update((state) => {
      if (!val) {
        removeById(state, id);
        return state;
      }

      if (val)
        state.push({
          msgId: id,
          ...val,
        });

      // no pagination yet, failsafe to prevent rendering too many messages
      if (state.length > 500) state.shift();

      // sort messages based on creation time
      return state.sort((a, b) => a.time - b.time);
    });
  });

  return {
    subscribe,
    delete: (id) => {
      chats.get(id).put(null);
    },
    set: (chat) => {
      const id = Gun.text.random();
      chats.get(id).put(chat);
    },
  };
}

export const store = createStore();
