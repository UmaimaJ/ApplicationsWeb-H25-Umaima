import React, { useEffect, useState, useContext } from "react";
import "./PageCours.css";

import { ServiceCoursContext } from "./service/ServiceCours";
import { AccueilService, AccueilServiceContext } from "../accueil/service/AccueilService";
import { ComptesServiceContext } from "../login/service/ComptesService.js"

const PageCours = () => {
  const { service } = useContext(ServiceCoursContext);
  const { navigate, accueilService } = useContext(AccueilServiceContext)
  const [coursList, setCoursList] = useState([]);
  const [coursAchetesList, setCoursAchetesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Tous");
  const [showDescription, setShowDescription] = useState({});
  const [activeTab, setActiveTab] = useState("Bibliothèque");

  const levelMap = {
    "Débutant": 1,
    "Intermédiaire": 2,
    "Avancé": 3,
    "Tous": null,
  };

  const categoryKeywords = {
    "Ouvertures": ["ouverture", "pirc", "ouvertures"],
    "Stratégie": ["attaquer", "capturer"],
    "Tactiques": ["tactique", "fourchette", "sacrifice"],
    "Fins de partie": ["fin de partie", "finale"],
    "Parties de maîtres": ["maître", "champion"]
  };

  const emojiByCategory = {
    "Ouvertures": "♟️",
    "Stratégie": "🧠",
    "Tactiques": "🎯",
    "Fins de partie": "🏁",
    "Parties de maîtres": "👑",
    "Autres": "📘"
  };

  const [activeCategory, setActiveCategory] = useState("Tous");

  const matchCategory = (cours, category) => {
    if (category === "Tous") return true;
    const content = `${cours.id_nom} ${cours.description}`.toLowerCase();
    return categoryKeywords[category]?.some(keyword => content.includes(keyword));
  };

  const getCategoryEmoji = (nom) => {
    nom = nom.toLowerCase();
    if (nom.includes("ouverture")) return emojiByCategory["Ouvertures"];
    if (nom.includes("attaquer") || nom.includes("stratégie")) return emojiByCategory["Stratégie"];
    if (nom.includes("tactique") || nom.includes("sacrifice")) return emojiByCategory["Tactiques"];
    if (nom.includes("fin") || nom.includes("roi")) return emojiByCategory["Fins de partie"];
    if (nom.includes("maître") || nom.includes("grand")) return emojiByCategory["Parties de maîtres"];
    return emojiByCategory["Autres"];
  };

  const fetchCours = async () => {
    const cours = await service.getLessons();
    setCoursList(cours);
    const coursAchetes = await service.getCoursAchetes();
    setCoursAchetesList(coursAchetes);
  };

  useEffect(() => {
    fetchCours();
  }, [service]);

  const toggleDescription = (index) => {
    setShowDescription((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAcheterCours = async (coursId) => {
    await service.addTransactionCours(coursId);
    fetchCours();
  };

  const ouvrirCoursAchete = async (id) => {
    await navigate("/PageDisplayCours/" + id);
  }

  const renderCoursList = (coursArray) => {
    return coursArray
      .filter((cours) =>
        matchCategory(cours, activeCategory) &&
        (selectedLevel === "Tous" || cours.niveau === levelMap[selectedLevel]) &&
        (cours.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cours.id_nom.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .map((cours, index) => (
        <div key={index} className="lesson-card">
          <div className="emoji-img">{getCategoryEmoji(cours.id_nom)}</div>
          <div className="lesson-info">
            <h2>{cours.id_nom}</h2>
            <p className="cours-description">
              {showDescription[index] ? cours.description : ""}
            </p>
            <div className="lesson-meta">
              <span>🎯 Niveau: {cours.niveau}</span>
              <span>💰 Coût: {cours.cout} pts</span>
              <span>📅 {new Date(cours.dateajout).toLocaleDateString()}</span>
            </div>
            <div className="lesson-actions">
              <button onClick={() => toggleDescription(index)}>
                {showDescription[index] ? "Masquer" : "Voir"} description
              </button>
              {!coursAchetesList.some(c => c.id === cours.id) && (
                <button onClick={() => handleAcheterCours(cours.id)}>Acheter</button>
              )}
              {coursAchetesList.some(c => c.id === cours.id) && (
                <button onClick={() => ouvrirCoursAchete(cours.id)}>Ouvrir</button>
              )}
            </div>
          </div>
        </div>
      ));
  };

  return (
    <div className="cours-container">
      <h1>📘 Lessons</h1>

      <div className="tabs">
        <span
          className={activeTab === "Bibliothèque" ? "active-tab" : ""}
          onClick={() => setActiveTab("Bibliothèque")}
        >
          Bibliothèque
        </span>
        <span
          className={activeTab === "Vidéos" ? "active-tab" : ""}
          onClick={() => setActiveTab("Vidéos")}
        >
          Vidéos
        </span>
      </div>

      {activeTab === "Bibliothèque" && (
        <>
          <div className="category-bar">
            {Object.keys(categoryKeywords).map((cat) => (
              <div
                className={`category-item ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
                key={cat}
              >
                <span style={{ fontSize: "20px", marginRight: "8px" }}>
                  {emojiByCategory[cat] || "📚"}
                </span>
                <span>{cat}</span>
              </div>
            ))}
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
            {renderCoursList(coursList)}
          </div>

          <h1 style={{ marginTop: "40px" }}>🎓 Cours achetés</h1>

          <div className="lesson-list">
            {renderCoursList(coursAchetesList)}
          </div>
        </>
      )}

      {activeTab === "Vidéos" && (
        <div className="video-grid">
          {coursList.map((cours, idx) => (
            cours.id_video && (
              <div className="video-card" key={idx}>
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${new URL(cours.id_video).searchParams.get("v")}`}
                  title={cours.id_nom}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <p>{cours.id_nom}</p>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default PageCours;