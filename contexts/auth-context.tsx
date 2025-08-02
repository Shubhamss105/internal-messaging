import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { User, UserRole } from "@/types";
import { mockUsers } from "@/mocks/data";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // For demo purposes, we're using mock data
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser) {
        setUser(foundUser);
        await AsyncStorage.setItem("user", JSON.stringify(foundUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    isAdmin: user?.role === "admin",
  };
});