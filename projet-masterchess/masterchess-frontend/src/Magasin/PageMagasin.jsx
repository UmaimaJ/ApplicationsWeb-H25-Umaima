import React, { useRef } from "react";
import "./PageMagasin.css";

const featuredItems = [
  {
    id: 1,
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Green_chess_pawn_keychain.jpg/120px-Green_chess_pawn_keychain.jpg",
    alt: "Green Pawn Keychain",
  },
  {
    id: 2,
    src: "https://m.media-amazon.com/images/I/71GHUplxjCL._AC_SL1500_.jpg",
    alt: "Electronic Chess Set",
  },
  {
    id: 3,
    src: "https://m.media-amazon.com/images/I/71U3YzrLMZL._AC_SL1500_.jpg",
    alt: "Green Chess Board",
  },
  {
    id: 4,
    src: "https://m.media-amazon.com/images/I/91Aa74ZqUuL._AC_SL1500_.jpg",
    alt: "Foldable Chess Set",
  },
];

const PageMagasin = () => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    const container = carouselRef.current;
    const scrollAmount = 300;
    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  return (
    <div className="magasin-container">
      <section className="featured-section">
        <h1 className="magasin-title">Unlock the latest items with gems !</h1>
        <h2 className="section-title featured">Featured Items</h2>

        <div className="carousel-wrapper">
          <button className="carousel-nav" onClick={() => scroll("left")}>◀</button>
          <div className="carousel" ref={carouselRef}>
            {featuredItems.map((item) => (
              <img
                key={item.id}
                className="carousel-item"
                src={item.src}
                alt={item.alt}
              />
            ))}
          </div>
          <button className="carousel-nav" onClick={() => scroll("right")}>▶</button>
        </div>
      </section>

      <section className="minecraft-section">
        <h2 className="section-title minecraft">Minecraft Edition Chess Pieces</h2>
        <div className="item-grid">
          {[1, 2, 3, 4].map((id) => (
            <div className="item-card" key={id}>
              <img
                className="item-image"
                src={`https://placehold.co/200x200?text=Item+${id}`}
                alt={`Item ${id}`}
              />
              <div className="item-name">Chessboard Illusion</div>
              <button className="btn-buy">Add to cart</button>
            </div>
          ))}
        </div>
        <button className="btn-see-more">See more</button>
      </section>
    </div>
  );
};

export default PageMagasin;
