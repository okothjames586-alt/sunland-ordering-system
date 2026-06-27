import { create } from 'zustand';

const useCartStore = create((set) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  addToCart: (product) =>
    set((state) => {
      const exists = state.items.find((i) => i._id === product._id);
      let items;
      if (exists) {
        items = state.items.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        items = [...state.items, { ...product, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(items));
      return { items };
    }),
  removeFromCart: (id) =>
    set((state) => {
      const items = state.items.filter((i) => i._id !== id);
      localStorage.setItem('cart', JSON.stringify(items));
      return { items };
    }),
  updateQuantity: (id, qty) =>
    set((state) => {
      const items = state.items.map((i) =>
        i._id === id ? { ...i, quantity: Math.max(1, qty) } : i
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
