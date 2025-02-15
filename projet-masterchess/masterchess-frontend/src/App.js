import logo from './style/logo.svg';
import loginicon from "./style/login-icon.svg";
import learnicon from "./style/learn-icon.svg";
import buyicon from "./style/buy-icon.svg";
import gemicon from "./style/gem-icon.svg";
import gemaddicon from "./style/gem-add-icon.svg";
import rectangle from "./style/rectangle.svg";

import Jeu from "./jeu/Jeu.js";

//import outfitmedium from "./style/Outfit-Medium.ttf";
import './App.css';

function App() {
  return (
    <div id="container">
      <div class="my-sidebar">
        <div class="my-sidebar-header">
          <div class="my-logo">
            <img src={logo} />
          </div>
          <div class="my-navbar">
            <div class="my-navbaroptions">
              <div class="my-navoption">
                <img class="my-icon" src={loginicon} />
                <label class="my-optionlabel">Login</label>
              </div>
              <div class="my-navoption">
                <img class="my-icon" src={learnicon} />
                <label class="my-optionlabel">Learn</label>
              </div>
              <div class="my-navoption">
                <img class="my-icon" src={buyicon} />
                <label class="my-optionlabel">Buy</label>
              </div>
            </div>
          </div>
        </div>
        <div class="my-sidebar-footer">
          <div class="my-gemcounter">
            <div class="my-gemindicator">
              <img class="my-gemicon" src={gemicon} />
              <label class="my-gemcountlabel">300</label>
            </div>
            <img class="my-gemaddbutton" src={gemaddicon} />
          </div>
          <div class="my-sidebar-footer-userparent">
            <div class="my-sidebar-footer-user">
              <div class="my-sidebar-footer-userpfp">
                <img class="my-gemicon" src={rectangle} />
              </div>
              <div class="my-sidebar-footer-userdata">
                <label class="my-sidebar-footer-username">Test</label>
                <label class="my-sidebar-footer-informations">Informations</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <Jeu></Jeu>
      </div>
    </div>
  );
}

export default App;
