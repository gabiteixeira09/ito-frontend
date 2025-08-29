import React, { useState } from "react";
import Lobby from "./components/Lobby";
import Game from "./components/Game";

function App() {
  const [room, setRoom] = useState(null);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {!room ? (
        <Lobby setRoom={setRoom} />
      ) : (
        <Game room={room} />
      )}
    </div>
  );
}

export default App;
