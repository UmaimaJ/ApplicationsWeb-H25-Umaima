
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
                  onClick={() => toggleDescription(index)}
                >
                  {showDescription[index] ? "Masquer" : "Voir"} description
                </button>

                <button className="cours-btn" onClick={() => { handleAcheterCours(cours.id); } }>
                  Acheter
                </button>
              </div>

              {showDescription[index] && (
                <p className="cours-description">{cours.pagecontenu}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <h1 className="page-cours-title">Cours achetés</h1>
      <div className="cours-grid">
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
                  onClick={() => toggleDescription(index)}
                >
                  {showDescription[index] ? "Masquer" : "Voir"} description
                </button>
              </div>

              {showDescription[index] && (
                <p className="cours-description">{cours.pagecontenu}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageCours;