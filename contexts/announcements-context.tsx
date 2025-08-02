import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Announcement } from "@/types";
import { mockAnnouncements } from "@/mocks/data";
import { useAuth } from "./auth-context";

interface AnnouncementsState {
  announcements: Announcement[];
  isLoading: boolean;
  createAnnouncement: (title: string, content: string, isImportant: boolean) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

export const [AnnouncementsProvider, useAnnouncements] = createContextHook<AnnouncementsState>(() => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, isAdmin } = useAuth();
  
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const storedAnnouncements = await AsyncStorage.getItem("announcements");
        if (storedAnnouncements) {
          setAnnouncements(JSON.parse(storedAnnouncements));
        } else {
          // Initialize with mock data for demo
          setAnnouncements(mockAnnouncements);
          await AsyncStorage.setItem("announcements", JSON.stringify(mockAnnouncements));
        }
      } catch (error) {
        console.error("Failed to load announcements:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnnouncements();
  }, []);
  
  const saveAnnouncements = async (updatedAnnouncements: Announcement[]) => {
    try {
      await AsyncStorage.setItem("announcements", JSON.stringify(updatedAnnouncements));
      setAnnouncements(updatedAnnouncements);
    } catch (error) {
      console.error("Failed to save announcements:", error);
    }
  };
  
  const createAnnouncement = async (title: string, content: string, isImportant: boolean): Promise<Announcement> => {
    if (!user || !isAdmin) throw new Error("Unauthorized");
    
    try {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        createdBy: user.id,
        isImportant,
      };
      
      const updatedAnnouncements = [...announcements, newAnnouncement];
      await saveAnnouncements(updatedAnnouncements);
      return newAnnouncement;
    } catch (error) {
      console.error("Failed to create announcement:", error);
      throw error;
    }
  };
  
  const deleteAnnouncement = async (id: string): Promise<void> => {
    if (!isAdmin) throw new Error("Unauthorized");
    
    try {
      const updatedAnnouncements = announcements.filter(announcement => announcement.id !== id);
      await saveAnnouncements(updatedAnnouncements);
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      throw error;
    }
  };
  
  return {
    announcements,
    isLoading,
    createAnnouncement,
    deleteAnnouncement,
  };
});