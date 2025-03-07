import logo from './style/logo.svg';
import loginicon from "./style/login-icon.svg";
import learnicon from "./style/learn-icon.svg";
import buyicon from "./style/buy-icon.svg";
import gemicon from "./style/gem-icon.svg";
import gemaddicon from "./style/gem-add-icon.svg";
import rectangle from "./style/rectangle.svg";

import Login from "./login/login.jsx";
import SignUp from "./login/signUp.jsx";
import PageJeu from "./jeu/PageJeu.js";

import { useState, useEffect } from 'react';
import { AccueilServiceContext, AccueilService } from "./accueil/service/AccueilService.js";
import { ComptesServiceContext, ComptesService } from "./login/service/ComptesService.js";

import './App.css';

const accueilService = new AccueilService();
const comptesService = new ComptesService();
const currentSessionUsager = (await comptesService.getSessionUsager())?.data?.usager ?? null;

function App() {
  const [pageCourante, setPageCourante] = useState(null);
  const [sessionUsager, setSessionUsager] = useState(currentSessionUsager);

  useEffect(() => {
    setSessionUsager(JSON.parse(window.sessionStorage.getItem("sessionUsager")));
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("sessionUsager", JSON.stringify(sessionUsager));
  }, [sessionUsager]);
  
  const handleLoginClick = async (event) => {
    setPageCourante(<Login></Login>);
  };

  const handleSignUpClick = async (event) => {
    setPageCourante(<SignUp></SignUp>);
  };

  const handleJeuClick = async (event) => {
    setPageCourante(<PageJeu></PageJeu>);
  };

  return (
    <AccueilServiceContext.Provider value={ {pageCourante, setPageCourante, accueilService} }>
    <ComptesServiceContext.Provider value={ {sessionUsager, setSessionUsager, comptesService} }>
    <div id="container">
      <div class="my-sidebar">
        <div class="my-sidebar-header">
          <div class="my-logo">
            <img src={logo} />
          </div>
          <div class="my-navbar">
            <div class="my-navbaroptions">
              {(!sessionUsager) &&
                <>
                <div class="my-navoption" onClick={handleLoginClick}>
                  <img class="my-icon" src={loginicon} />
                  <label class="my-optionlabel">Login</label>                
                </div>
                <div class="my-navoption" onClick={handleSignUpClick}>
                  <img class="my-icon" src={loginicon} />
                  <label class="my-optionlabel">Sign Up</label>                
                </div>
                </>
              }
              <div class="my-navoption" onClick={handleJeuClick}>
                <img class="my-icon" src={loginicon} />
                <label class="my-optionlabel">Play</label>                 
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
        {sessionUsager &&
        <>
        <div class="my-sidebar-footer">
          <div class="my-gemcounter">
            <div class="my-gemindicator">
              <img class="my-gemicon" src={gemicon} />
              <label class="my-gemcountlabel">{sessionUsager?.points ?? 0}</label>
            </div>
            <img class="my-gemaddbutton" src={gemaddicon} />
          </div>
          <div class="my-sidebar-footer-userparent">
            <div class="my-sidebar-footer-user">
              <div class="my-sidebar-footer-userpfp">
                <img class="my-gemicon" src={rectangle} />
              </div>
                <div class="my-sidebar-footer-userdata">
                  <label class="my-sidebar-footer-username">{sessionUsager?.compte ?? "<blank>"}</label>
                  <label class="my-sidebar-footer-informations">Informations</label>
                </div>
            </div>
          </div>
        </div>
        </>
        }
      </div>
      <div class="content">
        {pageCourante}
      </div>
    </div>
    </ComptesServiceContext.Provider>
    </AccueilServiceContext.Provider>
  );
}

export default App;
