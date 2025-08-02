import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Complaint, ComplaintResponse, ComplaintStatus } from "@/types";
import { mockComplaints } from "@/mocks/data";
import { useAuth } from "./auth-context";

interface ComplaintsState {
  complaints: Complaint[];
  isLoading: boolean;
  submitComplaint: (complaint: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "responses">) => Promise<Complaint>;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => Promise<void>;
  addResponse: (complaintId: string, response: Omit<ComplaintResponse, "id" | "createdAt">) => Promise<void>;
  getComplaintById: (id: string) => Complaint | undefined;
  getUserComplaints: () => Complaint[];
  getTaggedComplaints: () => Complaint[];
}

export const [ComplaintsProvider, useComplaints] = createContextHook<ComplaintsState>(() => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, isAdmin } = useAuth();
  
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const storedComplaints = await AsyncStorage.getItem("complaints");
        if (storedComplaints) {
          setComplaints(JSON.parse(storedComplaints));
        } else {
          // Initialize with mock data for demo
          setComplaints(mockComplaints);
          await AsyncStorage.setItem("complaints", JSON.stringify(mockComplaints));
        }
      } catch (error) {
        console.error("Failed to load complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadComplaints();
  }, []);
  
  const saveComplaints = async (updatedComplaints: Complaint[]) => {
    try {
      await AsyncStorage.setItem("complaints", JSON.stringify(updatedComplaints));
      setComplaints(updatedComplaints);
    } catch (error) {
      console.error("Failed to save complaints:", error);
    }
  };
  
  const submitComplaint = async (complaint: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "responses">): Promise<Complaint> => {
    try {
      const now = new Date().toISOString();
      const newComplaint: Complaint = {
        ...complaint,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
        responses: [],
      };
      
      const updatedComplaints = [...complaints, newComplaint];
      await saveComplaints(updatedComplaints);
      return newComplaint;
    } catch (error) {
      console.error("Failed to submit complaint:", error);
      throw error;
    }
  };
  
  const updateComplaintStatus = async (id: string, status: ComplaintStatus): Promise<void> => {
    try {
      const updatedComplaints = complaints.map(complaint => {
        if (complaint.id === id) {
          return {
            ...complaint,
            status,
            updatedAt: new Date().toISOString(),
          };
        }
        return complaint;
      });
      
      await saveComplaints(updatedComplaints);
    } catch (error) {
      console.error("Failed to update complaint status:", error);
      throw error;
    }
  };
  
  const addResponse = async (complaintId: string, response: Omit<ComplaintResponse, "id" | "createdAt">): Promise<void> => {
    try {
      const updatedComplaints = complaints.map(complaint => {
        if (complaint.id === complaintId) {
          const newResponse: ComplaintResponse = {
            ...response,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };
          
          return {
            ...complaint,
            responses: [...complaint.responses, newResponse],
            updatedAt: new Date().toISOString(),
          };
        }
        return complaint;
      });
      
      await saveComplaints(updatedComplaints);
    } catch (error) {
      console.error("Failed to add response:", error);
      throw error;
    }
  };
  
  const getComplaintById = (id: string): Complaint | undefined => {
    return complaints.find(complaint => complaint.id === id);
  };
  
  const getUserComplaints = (): Complaint[] => {
    if (!user) return [];
    return complaints.filter(complaint => complaint.submitterId === user.id);
  };
  
  const getTaggedComplaints = (): Complaint[] => {
    if (!user) return [];
    return complaints.filter(complaint => 
      complaint.taggedUsers.includes(user.id) && complaint.submitterId !== user.id
    );
  };
  
  return {
    complaints: isAdmin ? complaints : [...getUserComplaints(), ...getTaggedComplaints()],
    isLoading,
    submitComplaint,
    updateComplaintStatus,
    addResponse,
    getComplaintById,
    getUserComplaints,
    getTaggedComplaints,
  };
});