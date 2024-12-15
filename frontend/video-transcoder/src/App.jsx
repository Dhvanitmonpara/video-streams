import { useState } from "react";
import "./App.css";
import VideoPlayer from "./VideoPlayer";
import { useRef } from "react";

function App() {
  const playerRef = useRef(null);
  const videoLink = "";

  const videPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL",
      },
    ],
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.on("waiting", () => {
      videojs.log("Player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("Player will dispose");
    });
  };

  return (
    <div>
      <h1>Video Player</h1>
      <VideoPlayer options={videPlayerOptions} onReady={handlePlayerReady} />
    </div>
  );
}

export default App;
