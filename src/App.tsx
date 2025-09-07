import './App.css'

//import Screens from "./screens";
import LandingScreen from "./screens/landing-screen";
import GameScreen from "./screens/game";
import React from "react";

//disble scrolling
function App() {

    document.body.style.overflow = 'hidden';
    //disable dragging of images
    document.body.style.userSelect = 'none';
    //route to landing screen
    const [state, setState] = React.useState('landing');
    if (state === 'landing') {
        return <LandingScreen setState={setState}/>;
    }
    if (state === 'final_scoring') {

    }
    return <GameScreen setState={setState}/>;
}

export default App;