import React from "react";
import "./PageAccueil.css";
import { useNavigate } from "react-router-dom";

const PageAccueil = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate("/PageListeJeux");
  };

  const handleLearnClick = () => {
    navigate("/PageCours");
  };

  return (
    <div className="accueil-container">
      <div className="hero-section">
        <h1>APPRENEZ LES ÉCHECS DE ZÉRO</h1>
        <p>Maîtrisez chaque coup, dominez l’échiquier.</p>
        <button className="start-button" onClick={handleLearnClick}>
          Commencer à apprendre
        </button>
      </div>

      <div className="lesson-container">
        <img
          src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/CHESScom/phphK5JVu.png"
          alt="Lesson"
          className="lesson-image"
        />
        <div className="lesson-content">
          <h3 className="lesson-title">Suivez des cours d’échecs</h3>
          <p className="lesson-description">
            Avec plus de 10 cours disponibles, développez vos compétences et maîtrisez chaque aspect du jeu.
            Améliorez votre stratégie et entraînez-vous comme un joueur d’échecs professionnel.
          </p>
          <button className="lessons-btn" onClick={handleLearnClick}>
            Cours
          </button>
        </div>
      </div>

      <div className="play-container">
        <img
          src="https://static.displate.com/avatars/2023-11-14/48fcf9a0cf1f92a0377c4543ca09f0a7_1519083d00f1a3dd51f3f94d0f002624.jpg"
          alt="Play"
          className="play-image"
        />
        <div className="play-content">
          <h3 className="lesson-title">Jouez en ligne</h3>
          <p className="lesson-description">
            Mettez vos connaissances en pratique et affrontez d'autres joueurs dans des parties compétitives en ligne.
          </p>
          <button className="play-button" onClick={handlePlayClick}>
            Jouer
          </button>
        </div>
      </div>

      <div className="video-section">
        <h2>Découvrez les meilleurs joueurs d’échecs du monde en action</h2>
        <div className="video-thumbnails">
          <div className="video-block">
            <img
              src="https://i.ytimg.com/vi/wofz0k6FCMU/hq720.jpg"
              alt="Chess video 1"
            />
            <p className="video-description">
              Magnus Carlsen vs. Hikaru Nakamura — Une bataille de blitz intense lors du championnat du monde !
            </p>
          </div>
          <div className="video-block">
            <img
              src="https://i.ytimg.com/vi/E7cAz-bnsqM/hq720.jpg"
              alt="Chess video 2"
            />
            <p className="video-description">
              Comment un jeune prodige a surpris Kasparov dans une démonstration magistrale de tactiques.
            </p>
          </div>
          <div className="video-block">
            <img
              src="https://i.ytimg.com/vi/uqzxnz6d7JM/maxresdefault.jpg"
              alt="Chess video 3"
            />
            <p className="video-description">
              Cette finale brillante de 1994 reste l’une des plus grandes échappées de l’histoire des échecs.
            </p>
          </div>
          <div className="video-block">
            <img
              src="https://images.chesscomfiles.com/uploads/v1/article/25422.4d14257f.668x375o.7a44bb0599ef@2x.png"
              alt="Chess video 4"
            />
            <p className="video-description">
              Plongée dans le style de Bobby Fischer — stratégie, agressivité et contrôle.
            </p>
          </div>
        </div>
      </div>

      <footer>
        <p>Copyright © ChessMaster</p>
        <p>Politique de confidentialité & <a href="/PageContact">contact</a></p>
      </footer>
    </div>
  );
};

export default PageAccueil;
