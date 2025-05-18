import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import axios from 'axios';

import Layout from "./Layout.js";
import Login from "./login/login.jsx";
import SignUp from "./login/signUp.jsx";
import PageListeJeux from "./jeu/PageListeJeux.jsx"
import PageJeu from "./jeu/PageJeu.js";
import PageAccueil from "./accueil/PageAccueil.jsx";
import PageCours from "./cours/PageCours.jsx";
import PageDisplayCours from "./cours/PageDisplayCours.jsx";
import PageMagasin from './Magasin/PageMagasin';
import PageCharger from "./achat/PageCharger.jsx";
import PageFacture from "./achat/PageFacture.jsx"
import PageProfil from "./jeu/PageProfil.js";
import PageAdmin from "./admin/PageAdmin.jsx";
import PageContact from "./contact/PageContact.jsx";

// Set a default base URL for all requests
axios.defaults.baseURL = '/data/';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PageAccueil />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/PageListeJeux" element={<PageListeJeux />} />
          <Route path="/PageJeu/:idPartie" element={<PageJeu />} />
          <Route path="/PageCours" element={<PageCours />} />
          <Route path="/PageDisplayCours/:idCours" element={<PageDisplayCours />} />
          <Route path="/PageMagasin" element={<PageMagasin />} />
          <Route path="/PageProfil/:idProfiljeu" element={<PageProfil />} />
          <Route path="/PageCharger" element={<PageCharger />} />
          <Route path="/PageAdmin" element={<PageAdmin />} />
          <Route path="/PageFacture/:idFacture" element={<PageFacture />} />
          <Route path="/PageContact" element={<PageContact /> } />
          <Route path="*" element={<></>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
