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
    "https://gunjs.herokuapp.com/gun",
  ]);

  const { subscribe, update } = writable([]);
  const chats = gun.get("chats");

  chats.map().on((val, msgId) => {
    update((state) => {
      if (!val) {
        removeByMsgId(state, msgId);
        return state;
      }

      if (val)
        state.push({
          msgId,
          msg: val.msg,
          time: parseFloat(val.time),
          user: val.user,
        });

      return state;
    });
  });

  return {
    subscribe,
    delete: (msgId) => {
      chats.get(msgId).put(null);
    },
    set: ({ msg, user }) => {
      const time = new Date().getTime();
      const msgId = `${time}_${Math.random()}`;
      chats.get(msgId).put({
        msg,
        user,
        time,
      });
    },
  };
}

export const store = createStore();
