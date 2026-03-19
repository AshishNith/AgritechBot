import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  deliveryAddress?: string;
}

interface MarketplaceState {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Favorites
  favorites: string[]; // product IDs
  toggleFavorite: (productId: string) => void;
  isFavorited: (productId: string) => boolean;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist<MarketplaceState, [], [], Partial<MarketplaceState>>(
    (set, get) => ({
      cart: [],
      orders: [],
      searchQuery: '',
      selectedCategory: 'All',
      favorites: [],

      addToCart: (product: Product, quantity = 1) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.product.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { product, quantity }] };
        }),

      removeFromCart: (productId: string) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        })),

      updateCartItemQuantity: (productId: string, quantity: number) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const state = get();
        return state.cart.reduce((total, item) => {
          return total + item.product.price * item.quantity;
        }, 0);
      },

      getCartItemsCount: () => {
        const state = get();
        return state.cart.reduce((count, item) => count + item.quantity, 0);
      },

      addOrder: (order: Order) =>
        set((state) => ({
          orders: [order, ...state.orders],
          cart: [],
        })),

      setSearchQuery: (query: string) =>
        set({
          searchQuery: query,
        }),

      setSelectedCategory: (category: string) =>
        set({
          selectedCategory: category,
        }),

      toggleFavorite: (productId: string) =>
        set((state) => ({
          favorites: state.favorites.includes(productId)
            ? state.favorites.filter((id) => id !== productId)
            : [...state.favorites, productId],
        })),

      isFavorited: (productId: string) => {
        const state = get();
        return state.favorites.includes(productId);
      },
    }),
    {
      name: 'marketplace-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        favorites: state.favorites,
      }),
    }
  )
);
