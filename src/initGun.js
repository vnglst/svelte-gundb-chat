import Gun from "gun/gun";
import "gun/lib/webrtc";

export const gun = new Gun([
  // // Community relay peers: https://github.com/amark/gun/wiki/volunteer.dht
  "https://www.raygun.live/gun",
  "https://gunmeetingserver.herokuapp.com/gun",
  "https://gun-us.herokuapp.com/gun",
  "https://gun-eu.herokuapp.com/gun",
  // // My own relay peer
  "https://phrassed.com/gun",
]);

if (process.env.NODE_ENV === "development")
  gun.opt({ peers: ["http://localhost:8765/gun"] });
