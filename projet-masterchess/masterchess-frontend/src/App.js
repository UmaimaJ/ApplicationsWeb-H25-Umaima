import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout.js";
import Login from "./login/login.jsx";
import SignUp from "./login/signUp.jsx";
import PageListeJeux from "./jeu/PageListeJeux.jsx"
import PageJeu from "./jeu/PageJeu.js";
import PageAccueil from "./accueil/PageAccueil.jsx";
import PageCours from "./cours/PageCours.jsx";

import axios from 'axios';
// Set a default base URL for all requests
axios.defaults.baseURL = '/';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PageAccueil/>} />
          <Route path="/Login" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/PageListeJeux" element={<PageListeJeux />} />
          <Route path="/PageJeu/:idPartie" element={<PageJeu />} />
          <Route path="/PageCours" element={<PageCours />} />
          <Route path="*" element={<></>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
