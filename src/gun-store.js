import { writable } from "svelte/store";
import Gun from "gun/gun";

function removeByMsgId(array, msgId) {
  for (let i in array) {
    if (array[i].msgId == msgId) {
      array.splice(i, 1);
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
  const chats = gun.get("chats-live-typing"); // "chats" version 1 was message bombed to death

  chats.map().on((val, msgId) => {
    update((state) => {
      if (!val) {
        removeByMsgId(state, msgId);
        return state;
      }

      const existingMsgIdx = state.findIndex((m) => m.msgId === msgId);

      if (existingMsgIdx > -1) {
        state[existingMsgIdx] = {
          msgId,
          msg: val.msg,
          time: parseFloat(val.time),
          user: val.user,
        };
      } else if (val)
        state.push({
          msgId,
          msg: val.msg,
          time: parseFloat(val.time),
          user: val.user,
        });

      // no pagination yet, so can't render all the messages for now 😥
      if (state.length > 200) state.shift();

      return state;
    });
  });

  return {
    subscribe,
    delete: (msgId) => {
      chats.get(msgId).put(null);
    },
    set: ({ msg, user, msgId, time }) => {
      chats.get(msgId).put({
        msg,
        user,
        time,
      });
    },
  };
}

export const store = createStore();
