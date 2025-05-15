import logo from './style/logo.svg';
import homeicon from "./style/home-icon2.svg";
import loginicon from "./style/login-icon2.svg";
import logouticon from "./style/logout-icon2.svg";
import playicon from "./style/play-icon2.svg";
import learnicon from "./style/learn-icon2.svg";
import buyicon from "./style/buy-icon2.svg";
import gemicon from "./style/gem-icon2.svg";
import gemaddicon from "./style/gem-add-icon2.svg";
import person from "./style/person2.svg";

import { Outlet, Link, useNavigate } from "react-router-dom";

import { useState, useEffect } from 'react';
import { AccueilServiceContext, AccueilService } from "./accueil/service/AccueilService.js";
import { ComptesServiceContext, ComptesService } from "./login/service/ComptesService.js";
import { ServiceCoursContext } from "./cours/service/ServiceCours";

import './Layout.css';

function Layout() {
    const navigate = useNavigate();

    const accueilService = new AccueilService();
    const comptesService = new ComptesService();

    const [sessionUsager, setSessionUsager] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
        const sessionUsagerDB = (await comptesService.getSessionUsager())?.data?.usager ?? null;
        return sessionUsagerDB;
        }

        fetchData().then((usager) => {
        const cacheStr = window.sessionStorage.getItem("sessionUsager");
        const cacheParsed = JSON.parse(cacheStr !== "undefined" ? cacheStr : "null" );
        setSessionUsager(cacheParsed ?? usager)
        });
    }, []);

    useEffect(() => {
        window.sessionStorage.setItem("sessionUsager", JSON.stringify(sessionUsager));
    }, [sessionUsager]);
    
    const handleAccueilClick = async (event) => {
        navigate("/");
    };

    const handleLoginClick = async (event) => {
        navigate("/Login");
    };

    const handleSignUpClick = async (event) => {
        navigate("/SignUp");
    };

    const handleLogoutClick = async (event) => {
        navigate("/");
        await comptesService.postLogout();
        setSessionUsager(null);
    };

    const handleJeuClick = async (event) => {
        navigate("/PageListeJeux");
    };

    const handleLearnClick = async (event) => {
        navigate("/PageCours");
    };

    const handleProfilClick = async (event) => {
        navigate("/PageProfil/" + (sessionUsager?.id_profiljeu ?? -1));
    }

    const handleAcheterGems = async (event) => {
        navigate("/PageCharger");
    }

    return (
        <AccueilServiceContext.Provider value={ {navigate, accueilService} }>
        <ComptesServiceContext.Provider value={ {sessionUsager, setSessionUsager, comptesService} }>
        <div id="container">
            <div class="my-sidebar">
                <div class="my-sidebar-header">
                <div class="my-logo">
                    <a href="/">
                        <img src={logo} />
                    </a>
                </div>
                <div class="my-navbar">
                    <div class="my-navbaroptions">
                    <div class="my-navoption" onClick={handleAccueilClick}>
                        <img class="my-icon" src={homeicon} />
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
                        <img class="my-icon" src={logouticon} />
                        <label class="my-optionlabel">Logout</label>                
                        </div>
                        <div class="my-navoption" onClick={handleJeuClick}>
                        <img class="my-icon" src={playicon} />
                        <label class="my-optionlabel">Jouer</label>                 
                        </div>
                        </>
                    }
                    <div class="my-navoption" onClick={handleLearnClick}>
                        <img class="my-icon" src={learnicon} />
                        <label class="my-optionlabel">Apprendre</label>
                    </div>
                    <div class="my-navoption" onClick={handleAcheterGems}>
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
                    <img class="my-gemaddbutton" src={gemaddicon} onClick={handleAcheterGems} />
                </div>
                <div class="my-sidebar-footer-userparent" onClick={handleProfilClick}>
                    <div class="my-sidebar-footer-user">
                        <div class="my-sidebar-footer-userpfp">
                            <img class="my-usericon" src={person} />
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
                <Outlet/>
            </div>
        </div>
        </ComptesServiceContext.Provider>
        </AccueilServiceContext.Provider>
    );
}

export default Layout;
