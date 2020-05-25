// HACK: loading gun with js imports does not work reliably, but script tags do

// import Gun from "gun/gun";
// import "gun/lib/radix";
// import "gun/lib/radisk";
// import "gun/lib/rindexed";
// import "gun/lib/store";
// import "gun/lib/webrtc";

let peers;

if (process.env.NODE_ENV === "development") {
  peers = ["http://localhost:8765/gun"];
} else {
  peers = [
    // Community relay peers: https://github.com/amark/gun/wiki/volunteer.dht
    "https://www.raygun.live/gun",
    "https://gunmeetingserver.herokuapp.com/gun",
    "https://gun-us.herokuapp.com/gun",
    "https://gun-eu.herokuapp.com/gun",
    // My own relay peer
    "https://phrassed.com/gun",
  ];
}

const gun = new Gun({
  peers,
  store: RindexedDB(),
  localStorage: false,
});

// attaching gun to window for testing purposes
window.gun = gun;

export { gun };
