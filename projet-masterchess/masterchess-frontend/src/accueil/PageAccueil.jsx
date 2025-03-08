import React from "react";
import "./PageAccueil.css"; // Import the styles

const PageAccueil = () => {
  return (
    <div className="accueil-container">
      <div className="hero-section">
        <h1>LEARN CHESS FROM SCRATCH</h1>
        <p>Master every move, conquer the board.</p>
        <button className="start-button">Start Learning</button>
      </div>

      {/* Lesson Section - Image on the left */}
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
          <button className="lessons-btn">Lessons</button>
        </div>
      </div>

      {/* Play Section - Image on the right */}
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
          <button className="play-button">Play</button>
        </div>
      </div>
      
      {/* Video Section */}
      <div className="video-section">
        <h2>Discover the World's Best Chess Players in Action</h2>
        <div className="video-thumbnails">
          <img src="https://i.ytimg.com/vi/wofz0k6FCMU/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLAgH1mK6V8SdgQGsO_mpXvGveii7w" alt="Chess video 1" />
          <img src="https://i.ytimg.com/vi/E7cAz-bnsqM/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLDF1XEUVPYRdHdOS4i7mALnFzvxmQ" alt="Chess video 2" />
          <img src="https://placehold.co/250x150" alt="Chess video 3" />
          <img src="https://placehold.co/250x150" alt="Chess video 4" />
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
