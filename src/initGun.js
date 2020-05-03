import Gun from "gun/gun";
import "gun/lib/webrtc";

export const gun = new Gun(["https://phrassed.com/gun"]);

if (process.env.NODE_ENV === "development")
  gun.opt({ peers: ["http://localhost:8765/gun"] });
