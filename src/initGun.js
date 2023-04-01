import Gun from "gun/gun";
import "gun/lib/webrtc";

let peers;

if (process.env.NODE_ENV === "development") {
  peers = ["http://localhost:8765/gun"];
} else {
  peers = [
    // Community relay peers: https://github.com/amark/gun/wiki/volunteer.dht
    "https://gun-manhattan.herokuapp.com/gun",
    "https://relay.129.153.59.37.nip.io/gun",
    "https://relay.peer.ooo/gun",
    "https://peer.wallie.io/gun",
    "www-dweb-gun.dev.archive.org/gun",
  ];
}

const gun = new Gun({
  peers,
});

// attaching gun to window for testing purposes
window.gun = gun;

export { gun };
