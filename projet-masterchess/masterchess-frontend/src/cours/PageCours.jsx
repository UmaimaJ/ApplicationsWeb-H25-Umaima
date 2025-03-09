import React, { useState, useEffect, useContext } from "react";

import "./PageCours.css";

import { ServiceCoursContext } from "./service/ServiceCours";



const ElementCoursComposante = ({ cours, index }) => {

  return (

    <div className="lesson-card">

      <img

        src="https://preview.redd.it/didnt-play-this-game-ask-me-a-question-and-ill-answer-like-v0-m3r49atlw06a1.png?width=640&crop=smart&auto=webp&s=46e15ff42be6cc7ae55a943b55e10f1a7cef149c"

        alt={cours.title} className="lesson-thumbnail"

      />

      <div className="lesson-info">

        <h3 className={index % 2 === 0 ? "lesson-title-green" : "lesson-title-white"}>

          {cours.title}

        </h3>

        <p className="lesson-description">{cours.shortDescription}</p>

      </div>

    </div>

  );

};



const PageCours = () => {

  const { service } = useContext(ServiceCoursContext);

  const [lessons, setLessons] = useState([

    { id: 1, title: "Pawn A - Tactical Attacks", shortDescription: "Learn how to use Pawn A to control the board early.", category: "Tactics" },

    { id: 2, title: "Pawn B - Defensive Strategies", shortDescription: "Master defensive structures using Pawn B.", category: "Strategy" },

    { id: 3, title: "Pawn C - Midgame Positioning", shortDescription: "Understand the best placements for Pawn C.", category: "Positioning" },

    { id: 4, title: "Pawn D - Center Control", shortDescription: "How to use Pawn D to control the center squares.", category: "Openings" },

    { id: 5, title: "Pawn E - King's Pawn Opening", shortDescription: "Famous openings that begin with Pawn E.", category: "Openings" },

    { id: 6, title: "Pawn F - Passed Pawn Techniques", shortDescription: "Learn how to push Pawn F to promotion.", category: "Endgames" },

    { id: 7, title: "Pawn G - Gambit Openings", shortDescription: "Use Pawn G in gambit-based openings for aggressive play.", category: "Openings" },

    { id: 8, title: "Pawn H - Endgame Breakthrough", shortDescription: "Using Pawn H effectively in the endgame.", category: "Endgames" },

  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");



  const filteredLessons = lessons.filter(lesson =>

    (selectedCategory === "All" || lesson.category === selectedCategory) &&

    lesson.title.toLowerCase().includes(searchTerm.toLowerCase())

  );



  return (

    <div className="cours-container">

      <div className="lesson-header">

        <h1 className="lesson-title">Master Chess - Pawn Lessons</h1>

        <p className="lesson-subtitle">Improve your gameplay by understanding the role of each pawn.</p>

      </div>



      <div className="lesson-library">

        <div className="lesson-categories">

          <select className="category-dropdown" onChange={(e) => setSelectedCategory(e.target.value)}>

            <option value="All">All</option>

            <option value="Tactics">Tactics</option>

            <option value="Strategy">Strategy</option>

            <option value="Positioning">Positioning</option>

            <option value="Openings">Openings</option>

            <option value="Endgames">Endgames</option>

          </select>

          <input

            type="text"

            placeholder="Search for a lesson..."

            className="lesson-search-input"

            onChange={(e) => setSearchTerm(e.target.value)}

          />

        </div>

      </div>



      <div className="lesson-list-container">

        <div className="lesson-list">

          {filteredLessons.map((lesson, index) => (

            <ElementCoursComposante key={lesson.id} cours={lesson} index={index} />

          ))}

        </div>

      </div>

    </div>

  );

};



export default PageCours;