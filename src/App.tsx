import './App.css'

//import Screens from "./screens";
import React from "react";
import GameController from "./controllers/game-controller.tsx";

//disble scrolling
function App() {

    document.body.style.overflow = 'hidden';
    //disable dragging of images
    document.body.style.userSelect = 'none';
    //route to landing screen

    return (
        <GameController/>
    )
}

export default App;