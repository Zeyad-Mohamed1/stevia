import { create } from "zustand";
import { getUser } from "@/actions/auth";

interface Order {
  id?: string | number;
  date?: string;
  created_at?: string;
  status?: string;
  total?: number;
  price?: number;
  item_count?: number;
  phone?: string;
  email?: string;
  street?: string;
  country?: string;
  // Add other order properties as needed
}

interface User {
  id?: string | number;
  fname?: string;
  lname?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  orders?: Order[];
  // Add other user properties as needed
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUser();
      set({ user: response.user, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch user", isLoading: false });
      console.error("Error fetching user:", error);
    }
  },
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
