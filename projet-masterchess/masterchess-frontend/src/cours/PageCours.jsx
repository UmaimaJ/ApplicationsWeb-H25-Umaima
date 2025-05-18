import React, { useEffect, useState, useContext } from "react";
import "./PageCours.css";

import { ServiceCoursContext } from "./service/ServiceCours";
import { AccueilService, AccueilServiceContext } from "../accueil/service/AccueilService";
import { ComptesServiceContext } from "../login/service/ComptesService.js"

const PageCours = () => {
  const { service } = useContext(ServiceCoursContext);
  const { navigate, accueilService } = useContext(AccueilServiceContext)
  const {sessionUsager, setSessionUsager, comptesService} = useContext(ComptesServiceContext)
  const [coursList, setCoursList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [coursAchetesList, setCoursAchetesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Tous");
  const [showDescriptionCours, setShowDescriptionCours] = useState({});
  const [showDescriptionCoursAchete, setShowDescriptionCoursAchete] = useState({});

  var tooltipInvalidAcheter = null;

  const levelMap = {
    "Débutant": 1,
    "Intermédiaire": 2,
    "Avancé": 3,
    "Tous": null,
  };


  const fetchCours = async () => {
    const cours = await service.getLessons();
    setCoursList(cours);
    setFilteredList(cours);
    const coursAchetes = await service.getCoursAchetes();
    setCoursAchetesList(coursAchetes);
  };

  useEffect(() => {
    fetchCours();
  }, [service]);

  useEffect(() => {
    const filtered = coursList.filter((cours) => {
      const matchLevel =
        selectedLevel === "Tous" || cours.niveau === levelMap[selectedLevel];
      const matchSearch =
        cours.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cours.id_nom.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
    setFilteredList(filtered);
  }, [searchQuery, selectedLevel, coursList]);

  const toggleDescriptionCours = (index) => {
    setShowDescriptionCours((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleDescriptionCoursAchete = (index) => {
    setShowDescriptionCoursAchete((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAcheterCours = async (coursId) => {
    try
    {
      await service.addTransactionCours(coursId);
    }
    catch(error)
    {
      if(error?.message === "insertTransaction: transaction existe deja")
      {
        const element = document.querySelector("#lblError");
        await setInvalidTooltip(element, "Vous avez déjà acheté cet article.");
        //timer undo tooltip
        if(tooltipInvalidAcheter)
        {
          clearTimeout(tooltipInvalidAcheter);
          tooltipInvalidAcheter = null;
        }
        tooltipInvalidAcheter = setTimeout(async () => { await setInvalidTooltip(element, null) } , 10000);
      }
    }
    fetchCours();
  };

  const setInvalidTooltip = async (tooltip, message) => {
    if(!message || message === "")
        tooltip.style.display = "none";
    if(message)
        tooltip.style.display = "block";

    tooltip.innerText = message;
    tooltip.hidden = false;
  };

  const ouvrirCoursAchete = async (id) => {
    await navigate("/PageDisplayCours/" + id);
  }

  return (
    <div className="cours-container">
      <div id="lblError" className="alert alert-danger alert-fixed w-100" role="alert" style={{display: "none"}}>
      </div>
      <h1>📘 Lessons</h1>

      <div className="tabs">
        <span className="active-tab">Bibliothèque</span>
        <span>Guide</span>
      </div>
      <div className="tab-header">
        <div className="active">Bibliothèque</div>
        <div>Guide</div>
      </div>

      <div className="category-bar">
        <div className="category-item">
          <img src="/icons/book.png" alt="Openings" />
          <span>Openings</span>
        </div>
        <div className="category-item">
          <img src="/icons/strategy.png" alt="Strategy" />
          <span>Strategy</span>
        </div>
        <div className="category-item">
          <img src="/icons/tactics.png" alt="Tactics" />
          <span>Tactics</span>
        </div>
        <div className="category-item">
          <img src="/icons/endgames.png" alt="Endgames" />
          <span>Endgames</span>
        </div>
        <div className="category-item">
          <img src="/icons/masters.png" alt="Masters" />
          <span>Master Games</span>
        </div>
      </div>

      <input
        className="search-bar"
        type="text"
        placeholder="Rechercher un cours..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="filter-buttons">
        {["Tous", "Débutant", "Intermédiaire", "Avancé"].map((level) => (
          <button
            key={level}
            className={`filter-btn ${selectedLevel === level ? "active" : ""}`}
            onClick={() => setSelectedLevel(level)}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="lesson-list">
        {filteredList.map((cours, index) => (
          <div key={index} className="lesson-card">
            <img
              src={
                cours.id_image ||
                "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
              }
              alt={`Cours ${cours.id}`}
              className="lesson-img"
            />
            <div className="lesson-info">
              <h2>{cours.id_nom}</h2>
              <p className="cours-description">
                {showDescriptionCours[index] ? cours.description : ""}
              </p>
              <div className="lesson-meta">
                <span>🎯 Niveau: {cours.niveau}</span>
                <span>💰 Coût: {cours.cout} pts</span>
                <span>📅 {new Date(cours.dateajout).toLocaleDateString()}</span>
              </div>
              <div className="lesson-actions">
                <button onClick={() => toggleDescriptionCours(index)}>
                  {showDescriptionCours[index] ? "Masquer" : "Voir"} description
                </button>
                { sessionUsager && <button onClick={() => handleAcheterCours(cours.id)}>Acheter</button> }
              </div>
            </div>
          </div>
        ))}
      </div>

      <h1 style={{ marginTop: "40px" }}>🎓 Cours achetés</h1>

      <div className="lesson-list">
        {coursAchetesList.map((cours, index) => (
          <div key={index} className="lesson-card">
            <img
              src={
                cours.id_image ||
                "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
              }
              alt={`Cours ${cours.id}`}
              className="lesson-img"
            />
            <div className="lesson-info">
              <h2>{cours.id_nom}</h2>
              <p className="cours-description">
                {showDescriptionCoursAchete[index] ? cours.description : ""}
              </p>
              <div className="lesson-meta">
                <span>🎯 Niveau: {cours.niveau}</span>
                <span>💰 Coût: {cours.cout} pts</span>
                <span>📅 {new Date(cours.dateajout).toLocaleDateString()}</span>
              </div>
              <div className="lesson-actions">
                <button onClick={() => toggleDescriptionCoursAchete(index)}>
                  {showDescriptionCoursAchete[index] ? "Masquer" : "Voir"} description
                </button>
                <button onClick={() => ouvrirCoursAchete(cours.id)}>
                  Contenu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageCours;

