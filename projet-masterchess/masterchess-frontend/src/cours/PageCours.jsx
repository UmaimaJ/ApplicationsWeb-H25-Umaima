
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
    <div className="page-cours-container">
      <h1 className="page-cours-title">Cours</h1>

      <input
        type="text"
        placeholder="Rechercher un cours..."
        className="search-bar"
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

      <div className="cours-grid">
      <div className="cours-grid-header">
        <div id="lblError" class="alert alert-warning" role="alert" hidden="true">
        </div>
      </div>
        {filteredList.map((cours, index) => (
          <div key={index} className="cours-card">
            <img
              src={
                cours.id_image ||
                "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
              }
              alt={`Cours ${cours.id}`}
              className="cours-image"
            />
            <div className="cours-info">
              <span className="cours-nom">{cours.id_nom}</span>

              <div className="cours-footer">
                <span>Niveau: {cours.niveau}</span>
                <span>Coût: {cours.cout} pts</span>
                <span>Ajouté: {new Date(cours.dateajout).toLocaleDateString()}</span>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  className="cours-btn"
                  onClick={() => toggleDescriptionCours(index)}
                >
                  {showDescriptionCours[index] ? "Masquer" : "Voir"} description
                </button>

                {sessionUsager &&
                <button className="cours-btn" onClick={() => { handleAcheterCours(cours.id); } }>
                  Acheter
                </button>
                }
              </div>

              {showDescriptionCours[index] && (
                <p className="cours-description">{cours.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      { sessionUsager && <>
      <h1 className="page-cours-title">Cours achetés</h1>
      <div className="cours-grid">
      <div className="cours-grid-header">
        <div id="lblErrorAchetes" class="alert alert-warning" role="alert" hidden="true">
        </div>
      </div>
        { coursAchetesList.map((cours, index) => (
          <div key={index} className="cours-card">
            <img
              src={
                cours.id_image ||
                "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
              }
              alt={`Cours ${cours.id}`}
              className="cours-image"
            />
            <div className="cours-info">
              <span className="cours-nom">{cours.id_nom}</span>

              <div className="cours-footer">
                <span>Niveau: {cours.niveau}</span>
                <span>Coût: {cours.cout} pts</span>
                <span>Ajouté: {new Date(cours.dateajout).toLocaleDateString()}</span>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  className="cours-btn"
                  onClick={() => toggleDescriptionCoursAchete(index)}
                >
                  {showDescriptionCoursAchete[index] ? "Masquer" : "Voir"} description
                </button>
                <button
                  className="cours-btn"
                  onClick={() => ouvrirCoursAchete(cours.id)}
                >
                  Ouvrir
                </button>
              </div>

              {showDescriptionCoursAchete[index] && (
                <p className="cours-description">{cours.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      </> }
    </div>
  );
};

export default PageCours;