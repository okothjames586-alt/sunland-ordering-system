import { create } from 'zustand';

const getCartItemKey = (product) => (product.variant ? `${product._id}-${product.variant}` : String(product._id));

const useCartStore = create((set) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  addToCart: (product) =>
    set((state) => {
      const cartItemKey = getCartItemKey(product);
      const exists = state.items.find((i) => (i.cartItemKey || i._id) === cartItemKey);
      let items;
      if (exists) {
        items = state.items.map((i) =>
          (i.cartItemKey || i._id) === cartItemKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        items = [...state.items, { ...product, quantity: 1, cartItemKey }];
      }
      localStorage.setItem('cart', JSON.stringify(items));
      return { items };
    }),
  removeFromCart: (id) =>
    set((state) => {
      const items = state.items.filter((i) => (i.cartItemKey || i._id) !== id);
      localStorage.setItem('cart', JSON.stringify(items));
      return { items };
    }),
  updateQuantity: (id, qty) =>
    set((state) => {
      const items = state.items.map((i) =>
        (i.cartItemKey || i._id) === id ? { ...i, quantity: Math.max(1, qty) } : i
      );
      localStorage.setItem('cart', JSON.stringify(items));
      return { items };
    }),
  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },
}));

export { useCartStore };
