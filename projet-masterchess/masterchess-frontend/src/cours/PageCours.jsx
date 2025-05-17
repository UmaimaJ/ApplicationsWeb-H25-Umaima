import React, { useEffect, useState, useContext } from "react";
import "./PageCours.css";
import { ServiceCoursContext } from "./service/ServiceCours";

const PageCours = () => {
  const { service } = useContext(ServiceCoursContext);
  const [coursList, setCoursList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [coursAchetesList, setCoursAchetesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Tous");
  const [showDescription, setShowDescription] = useState({});

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
        cours.pagecontenu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cours.id_nom.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
    setFilteredList(filtered);
  }, [searchQuery, selectedLevel, coursList]);

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

  return (
    <div className="cours-container">
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
                {showDescription[index] ? cours.pagecontenu : ""}
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
                <button onClick={() => handleAcheterCours(cours.id)}>Acheter</button>
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
                {showDescription[index] ? cours.pagecontenu : ""}
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageCours;

