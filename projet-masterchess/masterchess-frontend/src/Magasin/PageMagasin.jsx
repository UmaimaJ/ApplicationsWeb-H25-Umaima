import React from "react";
import "./PageMagasin.css";
import { ChargerService } from "../achat/service/ChargerService";

const chargerService = new ChargerService();

const PageMagasin = () => {
  const handleAddToCart = async (itemId) => {
    try {
      await chargerService.acheterItem(itemId);
      alert("Item added successfully!");
    } catch (error) {
      alert("Error adding item");
    }
  };

  return (
    <div className="magasin-wrapper">
      <div className="magasin-header">
        <h1 className="magasin-title">Unlock the latest items with gems !</h1>
      </div>

      <div className="featured-title">Featured Items</div>
      <div className="featured-row">
        <div className="featured-card"></div>
        <div className="featured-card"></div>
        <div className="featured-card"></div>
        <div className="featured-card"></div>
      </div>

      <div className="section-title">Minecraft Edition Chess Pieces</div>

      <div className="items-grid">
        {[1, 2, 3, 4].map((id) => (
          <div className="store-item" key={id}>
            <img
              src={`https://placehold.co/200x200?text=Item+${id}`}
              alt={`Item ${id}`}
              className="item-image"
            />
            <div className="item-name">Chessboard Illusion</div>
            <button className="buy-btn" onClick={() => handleAddToCart(id)}>
              Add to cart
            </button>
          </div>
        ))}
      </div>

      <div className="see-more">
        <button>See more</button>
      </div>
    </div>
  );
};

export default PageMagasin;
