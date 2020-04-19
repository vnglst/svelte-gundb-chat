import { writable } from "svelte/store";
import Gun from "gun/gun";

class GunCounter {
  constructor(name) {
    this.gun = new Gun([
      "http://localhost:8765/gun",
      "https://gunjs.herokuapp.com/gun",
    ]);
    this.name = name;
    this.localStore = writable(0);
    this.localStore.subscribe((data) => {
      this.current = data;
    });
    this.gun
      .get(name)
      .get("value")
      .on((data) => {
        if (data.value !== this.current) {
          this.localStore.set(data);
        }
      });
  }

  subscribe(cb) {
    return this.localStore.subscribe(cb);
  }

  set(value) {
    this.gun.get(this.name).get("value").put(value);
    return this.localStore.set(value);
  }
}

export const counter = new GunCounter("roflcounter");
