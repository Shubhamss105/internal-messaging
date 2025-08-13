import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { User, UserRole } from "@/types";

// Client for regular operations (using anon key)
const supabase = createClient(
  "https://jqripjjibevckaiojfbf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcmlwamppYmV2Y2thaW9qZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTM3MDEsImV4cCI6MjA2OTM4OTcwMX0.w4rU1qpXRuJNblJPQ41G3DTtoKf8LTLqi2oTYWRuI3U"
);

// Client for admin operations (using service role key)
const supabaseAdmin = createClient(
  "https://jqripjjibevckaiojfbf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcmlwamppYmV2Y2thaW9qZmJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgxMzcwMSwiZXhwIjoyMDY5Mzg5NzAxfQ.Aik4IieUtzNZZkbzQYrUoUpKiX8Z1J24x0QbXT311vc",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isHR: boolean;
  createUser: (email: string, password: string, role: UserRole, name: string, department: string) => Promise<boolean>;
  getAllUsers: () => Promise<User[]>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;

          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            name: profile.name,
            role: profile.role || "employee",
            department: profile.department || "",
            avatar: profile.avatar || "",
          };
          setUser(userData);
          await AsyncStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        loadUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        AsyncStorage.removeItem("user");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        return false;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) throw profileError;

        const userData: User = {
          id: data.user.id,
          email: data.user.email || "",
          name: profile.name,
          role: profile.role || "employee",
          department: profile.department || "",
          avatar: profile.avatar || "",
        };
        setUser(userData);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (
    email: string,
    password: string,
    role: UserRole,
    name: string,
    department: string
  ): Promise<boolean> => {
    if (!user || !["admin"].includes(user.role)) {
      throw new Error("Only admins can create users");
    }

    if (!email || !password || !name || !department) {
      throw new Error("All fields are required");
    }

    try {
      // Use admin client for creating user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { role, name, department },
      });

      if (error) throw error;

      if (data.user) {
        // Use regular client for profile insertion (RLS applies)
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          name,
          role,
          department,
        });

        if (profileError) {
          // Roll back user creation if profile insertion fails
          await supabaseAdmin.auth.admin.deleteUser(data.user.id);
          throw profileError;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    if (!user || !["admin", "hr"].includes(user.role)) {
      throw new Error("Only admins and HR can view all users");
    }

    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;

      return data.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        department: profile.department,
        avatar: profile.avatar || "",
      }));
    } catch (error) {
      console.error("Get users error:", error);
      return [];
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    isAdmin: user?.role === "admin",
    isHR: user?.role === "hr",
    createUser,
    getAllUsers,
  };
});