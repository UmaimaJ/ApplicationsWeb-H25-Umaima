import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./PageAccueil.css"; // Import the styles

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
        <h1>APPRENEZ LES ÉCHECS</h1>
        <p>Maîtrisez l'ultime.</p>
        <button className="start-button" onClick={handleLearnClick}>
          Débutez votre cheminement
        </button>
      </div>

      {/* Lesson Section */}
      <div className="lesson-container">
        <img
          src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/CHESScom/phphK5JVu.png"
          alt="Lesson"
          className="lesson-image"
        />
        <div className="lesson-content">
          <h3 className="lesson-title">Prenez des cours d'échecs édifiants.</h3>
          <p className="lesson-description">
            Avec un arsenal de plus de 10 cours disponnibes, vous pouvez devenir un champion de la pensée et du procéssus tactique.
          </p>
          <button className="lessons-btn" onClick={handleLearnClick}>
            Leçons
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
            Mettez vos connaissances au test.
          </p>
          <button className="play-button" onClick={handlePlayClick}>
            Jouer
          </button>
        </div>
      </div>

      <div className="video-section">
        <h2>Découvrez les meilleurs</h2>
        <div className="video-thumbnails">
          <div className="video-block">
            <img
              src="https://i.ytimg.com/vi/wofz0k6FCMU/hq720.jpg"
              alt="Chess video 1"
            />
            <p className="video-description">
              Magnus Carlsen vs. Hikaru Nakamura — Intense blitz battle at the world championship!
            </p>
          </div>
          <div className="video-block">
            <img
              src="https://i.ytimg.com/vi/E7cAz-bnsqM/hq720.jpg"
              alt="Chess video 2"
            />
            <p className="video-description">
              How a young prodigy surprised Kasparov in a masterclass display of tactics.
            </p>
          </div>
          <div className="video-block">
            <img
              src="https://i.ytimg.com/vi/uqzxnz6d7JM/maxresdefault.jpg"
              alt="Chess video 3"
            />
            <p className="video-description">
              This brilliant endgame from 1994 is still one of the greatest escapes in chess history.
            </p>
          </div>
          <div className="video-block">
            <img
              src="https://images.chesscomfiles.com/uploads/v1/article/25422.4d14257f.668x375o.7a44bb0599ef@2x.png"
              alt="Chess video 4"
            />
            <p className="video-description">
              Deep dive into the style of Bobby Fischer — strategy, aggression and control.
            </p>
          </div>
        </div>
      </div>

      <footer>
        <p>Copyright © ChessMaster</p>
        <p>Privacy policy & contact</p>
      </footer>
    </div>
  );
};

export default PageAccueil;
