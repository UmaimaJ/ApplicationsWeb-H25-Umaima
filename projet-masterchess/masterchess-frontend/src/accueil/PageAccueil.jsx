import React, { useContext } from "react";
import "./PageAccueil.css"; // CSS
import { AccueilServiceContext } from "../accueil/service/AccueilService";
import PageCours from "../cours/PageCours";
import PageJeu from "../jeu/PageJeu";

const PageAccueil = () => {
  const { setPageCourante } = useContext(AccueilServiceContext);

  const handlePlayClick = () => {
    setPageCourante(<PageJeu />);
  };

  const handleLearnClick = () => {
    setPageCourante(<PageCours />);
  };

  return (
    <div className="accueil-container">
      <div className="hero-section">
        <h1>LEARN CHESS FROM SCRATCH</h1>
        <p>Master every move, conquer the board.</p>
        <button className="start-button" onClick={handleLearnClick}>
          Start Learning
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
          <h3 className="lesson-title">Take Chess Lessons</h3>
          <p className="lesson-description">
            With over 10 courses available, develop your skills and master every aspect of the game.
            Advance your strategy and train like a professional chess player.
          </p>
          <button className="lessons-btn" onClick={handleLearnClick}>
            Lessons
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
          <h3 className="lesson-title">Play Online</h3>
          <p className="lesson-description">
            Put your knowledge into practice and challenge other players in competitive online matches.
          </p>
          <button className="play-button" onClick={handlePlayClick}>
            Play
          </button>
        </div>
      </div>

      <div className="video-section">
        <h2>Discover the World's Best Chess Players in Action</h2>
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
