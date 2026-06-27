import React, { useState, useEffect } from 'react';
import './Menu.css';
import { useCartStore } from '../context/cartStore';
import { toast } from 'react-toastify';
import { menuAPI } from '../services/api';
import ugaliPlain from '../assets/ugali_plain.jfif';
import samakiWetFry from '../assets/samaki_wet_fry.webp';
import mbuziChoma from '../assets/mbuzi_choma.jfif';
import mbuziWetFry from '../assets/mbuzi_wet_fry.jfif';
import dryFryImage from '../assets/Air-Fryer-chicken-legs-with-dry-rub-10.jpg';
import dielDryFryImage from '../assets/diel dry fry.jpg';
import beefDryFryImage from '../assets/abula.jfif';
import kukuFull from '../assets/kuku_full.jfif';
import tumboPlain from '../assets/tumbo_plain.jfif';
import chickenStew from '../assets/chicken_stew.jfif';
import chipsPlain from '../assets/chips_plain.jfif';
import delmonteMango from '../assets/delmonte_mango.jpg';
import minutemaid from '../assets/minutemaid.jfif';
import mmImage from '../assets/mm.jpg';
import sodaImage from '../assets/soda.jpg';
import afiaImage from '../assets/afia.png';
import monsterImage from '../assets/monster.jfif';
import redbullImage from '../assets/redbull.jfif';
import dasaniWaterImage from '../assets/dasani_water.webp';
import dasaniImage from '../assets/dasani.webp';
import keringetImage from '../assets/keringet.jfif';
import keringet1LImage from '../assets/keringet_l.jpg';
import robertsonImage from '../assets/robertson.webp';
import frImage from '../assets/fr.jpg';
import fwImage from '../assets/fw.jpg';
import fourRedImage from '../assets/4r.jfif';
import fourWhiteImage from '../assets/4w.webp';
import cellarRedImage from '../assets/cellar_cask_red.png';
import cellarWhiteImage from '../assets/celar_white.jfif';
import capriceRedImage from '../assets/cpr.jfif';
import capriceWhiteImage from '../assets/cpw.png';
import drostdyImage from '../assets/dro.webp';
import tuskerLiteImage from '../assets/tl.jfif';
import tuskerLagerImage from '../assets/tlaga.jfif';
import whitecapImage from '../assets/wcap.jfif';
import tuskerCiderImage from '../assets/tcider.webp';
import guinessImage from '../assets/gs.jfif';
import baloziImage from '../assets/balozi.jfif';
import guaranaImage from '../assets/guarana.jfif';
import snapImage from '../assets/snap.jfif';


const Menu = () => {
  const publicUrl = process.env.PUBLIC_URL || '';
  const [menuItems] = useState([
    { _id: 1, category: 'Food', name: 'Fish Boil', description: 'Fresh fish boiled to perfection', price: 300, image: `${publicUrl}/images/fish-boil.jfif` },
    { _id: 2, category: 'Food', name: 'Fish Dry Fry', description: 'Crispy dry fried fish', price: 300, image: `${publicUrl}/images/fish-dry-fry.jfif` },
    { _id: 3, category: 'Food', name: 'Fish Wet Fry', description: 'Juicy wet fried fish', price: 300, image: samakiWetFry },
    { _id: 4, category: 'Food', name: 'Fish Plain', description: 'Extra large fish', price: 350, image: `${publicUrl}/images/fish-plain.jfif` },
    { _id: 5, category: 'Food', name: 'Mbuzi choma 1/4', description: 'Choma roasted to perfection', price: 350, image: mbuziChoma },
    { _id: 6, category: 'Food', name: 'Mbuzi Dry Fry 1/4', description: 'Crispy fried to perfection', price: 350, image: dielDryFryImage },
    { _id: 7, category: 'Food', name: 'Mbuzi Wet Fry', description: 'Crispy wet fried mbuzi', price: 300, image: mbuziWetFry },
    { _id: 8, category: 'Food', name: 'Chicken Wet Fry 1/4', description: 'Grilled chicken dish', price: 350, image: `${publicUrl}/images/chicken-wet-fry.jfif` },
    { _id: 9, category: 'Food', name: 'Chicken Dry Fry', description: 'African Special Fried dish', price: 400, image: dryFryImage },
    { _id: 10, category: 'Food', name: 'Chicken Full', description: 'Grilled chicken dish', price: 1600, image: kukuFull },
    { _id: 11, category: 'Food', name: 'Beef Stew', description: 'Rich beef stew with vegetables', price: 300, image: `${publicUrl}/images/beef-stew.jpg` },
    { _id: 12, category: 'Food', name: 'Beef Special Fry 1/4', description: 'Rich beef Dry Fried', price: 300, image: beefDryFryImage },
    { _id: 13, category: 'Food', name: 'Ugali plain', description: 'Traditional maize meal', price: 50, image: ugaliPlain },
    { _id: 14, category: 'Food', name: 'Chapati', description: 'Fluffy flatbread', price: 50, image: `${publicUrl}/images/chapo.jfif` },
    { _id: 15, category: 'Food', name: 'Chips', description: 'Plain fried chips', price: 150, image: chipsPlain },
    { _id: 16, category: 'Food', name: 'Matumbo', description: 'Spiced Fresh Matumbo', price: 200, image: tumboPlain },
    { _id: 17, category: 'Soft Drinks', name: 'Delmonte', description: 'Cold seasonal fresh juice', price: 400, image: delmonteMango },
    { _id: 18, category: 'Soft Drinks', name: 'Minute Maid 400Ml', description: 'Chilled Local Minute Maid', price: 100, image: minutemaid },
    { _id: 19, category: 'Soft Drinks', name: 'Minute Maid 1L', description: 'Cold', price: 250, image: mmImage },
    { _id: 20, category: 'Soft Drinks', name: 'Soda 500Ml', description: 'Cold soda', price: 100, image: sodaImage },
    { _id: 21, category: 'Soft Drinks', name: 'Afia', description: 'Fresh Juice', price: 100, image: afiaImage },
    { _id: 22, category: 'Soft Drinks', name: 'Monster', description: 'Energy drink', price: 300, image: monsterImage },
    { _id: 23, category: 'Soft Drinks', name: 'RedBull', description: 'Energy drink', price: 300, image: redbullImage },
    { _id: 24, category: 'Soft Drinks', name: 'Dasani 500Ml', description: 'Pure Bottled water', price: 50, image: dasaniWaterImage },
    { _id: 25, category: 'Soft Drinks', name: 'Dasani 1L', description: 'Pure bottled water', price: 100, image: dasaniImage },
    { _id: 26, category: 'Soft Drinks', name: 'Keringet 500Ml', description: 'Chilled mineral water', price: 100, image: keringetImage },
    { _id: 27, category: 'Soft Drinks', name: 'Keringet 1L', description: 'Pure bottled water', price: 150, image: keringet1LImage },
    { _id: 28, category: 'Wines and Beers', name: 'Robertson 750Ml', description: 'Smooth red wine', price: 1800, image: robertsonImage },
    { _id: 29, category: 'Wines and Beers', name: 'Four Cousins', description: 'Red', price: 1300, image: frImage },
    { _id: 30, category: 'Wines and Beers', name: 'Four Cousins', description: 'White', price: 1300, image: fwImage },
    { _id: 31, category: 'Wines and Beers', name: 'Fourth Street', description: 'Red', price: 1300, image: fourRedImage },
    { _id: 32, category: 'Wines and Beers', name: 'Fourth Street', description: 'White', price: 1300, image: fourWhiteImage },
    { _id: 33, category: 'Wines and Beers', name: 'Cellar Cask', description: 'Red', price: 1400, image: cellarRedImage },
    { _id: 34, category: 'Wines and Beers', name: 'Cellar Cask', description: 'White', price: 1400, image: cellarWhiteImage },
    { _id: 35, category: 'Wines and Beers', name: 'Caprice', description: 'Red', price: 1300, image: capriceRedImage },
    { _id: 36, category: 'Wines and Beers', name: 'Caprice', description: 'White', price: 1300, image: capriceWhiteImage },
    { _id: 37, category: 'Wines and Beers', name: 'Drostdy Hof', description: 'Red Wine', price: 1400, image: drostdyImage },
    { _id: 38, category: 'Wines and Beers', name: 'Tusker Lite', description: 'Local craft beer Can', price: 300, image: tuskerLiteImage },
    { _id: 39, category: 'Wines and Beers', name: 'Tusker Lager', description: 'Local craft beer Can', price: 300, image: tuskerLagerImage },
    { _id: 40, category: 'Wines and Beers', name: 'WhiteCap', description: 'Local craft beer Can', price: 300, image: whitecapImage },
    { _id: 41, category: 'Wines and Beers', name: 'Tusker Cider', description: 'Local craft beer Can', price: 300, image: tuskerCiderImage },
    { _id: 42, category: 'Wines and Beers', name: 'Guiness', description: 'Local craft beer Can', price: 300, image: guinessImage },
    { _id: 43, category: 'Wines and Beers', name: 'Balozi', description: 'Local craft beer Can', price: 300, image: baloziImage },
    { _id: 44, category: 'Wines and Beers', name: 'Smirnof Guarana', description: 'Local craft beer Can', price: 300, image: guaranaImage },
    { _id: 45, category: 'Wines and Beers', name: 'Snap', description: 'Local craft beer Can', price: 300, image: snapImage },
  ]);

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success('Added to cart');
  };

  // Commented out API fetch for now
  // useEffect(() => {
  //   const fetchMenu = async () => {
  //     try {
  //       const response = await api.get('/menus');
  //       setMenuItems(response.data);
  //     } catch (error) {
  //       console.error('Error fetching menu:', error);
  //     }
  //   };
  //   fetchMenu();
  // }, []);

  const categories = ['Food', 'Soft Drinks', 'Wines and Beers'];
  const groupedMenuItems = categories.map((category) => ({
    category,
    items: menuItems.filter((item) => item.category === category),
  }));

  const formatImageUrl = (url) => encodeURI(url);

  return (
    <div className="menu">
      <h1>Menu</h1>
      {groupedMenuItems.map(({ category, items }) => (
        <div key={category} className="menu-category-section">
          <h2 className="menu-category-title">{category}</h2>
          <div className="menu-items">
            {items.map((item) => (
              <div key={item._id} className="menu-item">
                <img src={formatImageUrl(item.image)} alt={item.name} />
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>Ksh {item.price}</p>
                <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;