import React, { useEffect, useState, useContext } from "react";
import "./PageCours.css";
import { ServiceCoursContext } from "./service/ServiceCours"; 


const PageCours = () => {
  const { service } = useContext(ServiceCoursContext);
  const [coursList, setCoursList] = useState([]);

  useEffect(() => {
    const fetchCours = async () => {
      const data = await service.getLessons();
      setCoursList(data);
    };

    fetchCours();
  }, []);

  return (
    <div className="page-cours-container">
      <h1 className="titre-cours">Tous les cours disponibles:</h1>
      <div className="cours-grid">
        {coursList.map((cours, index) => (
          <div key={index} className="cours-card">
            <div className="cours-img-container">
              <iframe
                src={cours.id_video}
                title={`vidéo-${index}`}
                allowFullScreen
                className="cours-video"
              />
            </div>
            <div className="cours-infos">
              <h2 className="cours-titre">{cours.id}</h2>
              <p className="cours-description">{cours.pagecontenu}</p>
              <p className="cours-niveau">Niveau : {cours.niveau}</p>
              <p className="cours-cout">Coût : {cours.cout} points</p>
              <p className="cours-date">Ajouté le : {new Date(cours.dateajout).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageCours;
