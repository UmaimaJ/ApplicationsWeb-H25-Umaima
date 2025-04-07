import logo from './style/logo.svg';
import loginicon from "./style/login-icon.svg";
import learnicon from "./style/learn-icon.svg";
import buyicon from "./style/buy-icon.svg";
import gemicon from "./style/gem-icon.svg";
import gemaddicon from "./style/gem-add-icon.svg";
import rectangle from "./style/rectangle.svg";

import Login from "./login/login.jsx";
import SignUp from "./login/signUp.jsx";
import PageListeJeux from "./jeu/PageListeJeux.jsx"
import PageJeu from "./jeu/PageJeu.js";
import PageAccueil from "./accueil/PageAccueil.jsx";
import PageCours from "./cours/PageCours.jsx";

import { useState, useEffect } from 'react';
import { AccueilServiceContext, AccueilService } from "./accueil/service/AccueilService.js";
import { ComptesServiceContext, ComptesService } from "./login/service/ComptesService.js";
import { ServiceCoursContext } from "./cours/service/ServiceCours";

import './App.css';

import axios from 'axios';
// Set a default base URL for all requests
axios.defaults.baseURL = '/';

function App() {
  const accueilService = new AccueilService();
  const comptesService = new ComptesService();

  const [pageCourante, setPageCourante] = useState(<PageAccueil></PageAccueil>);
  const [sessionUsager, setSessionUsager] = useState(null);

  useEffect(() => {
    const str = window.sessionStorage.getItem("sessionUsager");
    const result = JSON.parse(str !== "undefined" ? str : null );
    const currentSessionUsager = (comptesService.getSessionUsager())?.data?.usager ?? null;
    setSessionUsager(result?? currentSessionUsager);
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("sessionUsager", JSON.stringify(sessionUsager));
  }, [sessionUsager]);
 
  const handleAccueilClick = async (event) => {
    setPageCourante(<PageAccueil></PageAccueil>);
  };

  const handleLoginClick = async (event) => {
    setPageCourante(<Login></Login>);
  };

  const handleSignUpClick = async (event) => {
    setPageCourante(<SignUp></SignUp>);
  };

  const handleLogoutClick = async (event) => {
    setPageCourante(<PageAccueil></PageAccueil>);
    await comptesService.postLogout();
    setSessionUsager(null);
  };

  const handleJeuClick = async (event) => {
    setPageCourante(<PageListeJeux></PageListeJeux>);
  };

  const handleLearnClick = async (event) => {
    setPageCourante(<PageCours></PageCours>);
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
              <div class="my-navoption" onClick={handleAccueilClick}>
                <img class="my-icon" src={loginicon} />
                <label class="my-optionlabel">Accueil</label>                
              </div>
              {(!sessionUsager) &&
                <>
                <div class="my-navoption" onClick={handleLoginClick}>
                  <img class="my-icon" src={loginicon} />
                  <label class="my-optionlabel">Login</label>                
                </div>
                <div class="my-navoption" onClick={handleSignUpClick}>
                  <img class="my-icon" src={loginicon} />
                  <label class="my-optionlabel">Enregistrement</label>                
                </div>
                </>
              }
              {(sessionUsager) &&
                <>
                <div class="my-navoption" onClick={handleLogoutClick}>
                  <img class="my-icon" src={loginicon} />
                  <label class="my-optionlabel">Logout</label>                
                </div>
                <div class="my-navoption" onClick={handleJeuClick}>
                  <img class="my-icon" src={loginicon} />
                  <label class="my-optionlabel">Jouer</label>                 
                </div>
                </>
              }
              <div class="my-navoption" onClick={handleLearnClick}>
                <img class="my-icon" src={learnicon} />
                <label class="my-optionlabel">Apprendre</label>
              </div>
              <div class="my-navoption">
                <img class="my-icon" src={buyicon} />
                <label class="my-optionlabel">Acheter</label>
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
