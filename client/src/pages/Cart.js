import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../context/cartStore';
import './Cart.css';

const Cart = () => {
  const items = useCartStore((s) => s.items);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const total = items.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0);

  return (
    <div className="cart">
      <h1>Your Cart</h1>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item._id}>
              <img src={item.image} alt={item.name} />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>Ksh {item.price}</p>
                <div className="cart-item-controls">
                  <button onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}>-</button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}>+</button>
                  <button onClick={() => removeFromCart(item._id)}>Remove</button>
                </div>
              </div>
              <div className="cart-item-total">
                <strong>Ksh {item.price * (item.quantity || 1)}</strong>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <h3>Total: Ksh {total}</h3>
            <div className="cart-actions">
              <Link to="/checkout">
                <button disabled={items.length === 0}>Proceed to Checkout</button>
              </Link>
              <button onClick={clearCart}>Clear Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;