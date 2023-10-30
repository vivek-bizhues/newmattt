import { createSlice } from '@reduxjs/toolkit';


const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    const storedCart = localStorage.getItem('cart');
    return JSON.parse(storedCart) || [];
  }
  return [];
};

const initialCart = getInitialCart();

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCart,
  reducers: {
    addToCart: (state, action) => {
      state.push(action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(state));
      }
    },
    removeFromCart: (state, action) => {
      const productId = action.payload.id;
      state = state.filter((product) => product.id !== productId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(state));
      }
      return state;
    },
    clearCart: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
      return [];
    },
  },
});
  
  export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
  
  export default cartSlice.reducer;
  