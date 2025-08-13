import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Complaint, ComplaintResponse, ComplaintStatus } from "@/types";
import { useAuth } from "./auth-context";

interface ComplaintsState {
  complaints: Complaint[];
  isLoading: boolean;
  submitComplaint: (
    complaint: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "responses">
  ) => Promise<Complaint>;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => Promise<void>;
  addResponse: (
    complaintId: string,
    response: Omit<ComplaintResponse, "id" | "createdAt">
  ) => Promise<void>;
  getComplaintById: (id: string) => Complaint | undefined;
  getUserComplaints: () => Complaint[];
  getTaggedComplaints: () => Complaint[];
}

const supabase = createClient(
  "https://jqripjjibevckaiojfbf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcmlwamppYmV2Y2thaW9qZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTM3MDEsImV4cCI6MjA2OTM4OTcwMX0.w4rU1qpXRuJNblJPQ41G3DTtoKf8LTLqi2oTYWRuI3U"
);

export const [ComplaintsProvider, useComplaints] = createContextHook<ComplaintsState>(
  () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { user, isAdmin, isHR } = useAuth();

    useEffect(() => {
      const loadComplaints = async () => {
        try {
          const { data, error } = await supabase
            .from("complaints")
            .select("*, responses(*)")
            .order("created_at", { ascending: false });

          if (error) throw error;

          setComplaints(
            data.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              category: item.category,
              status: item.status,
              isAnonymous: item.is_anonymous,
              submitterId: item.submitter_id,
              taggedUsers: item.tagged_users || [],
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              responses: item.responses.map((res: any) => ({
                id: res.id,
                text: res.text,
                userId: res.user_id,
                userName: res.user_name,
                isAdmin: res.is_admin,
                isAnonymous: res.is_anonymous,
                createdAt: res.created_at,
              })),
            }))
          );
        } catch (error) {
          console.error("Failed to load complaints:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadComplaints();

      const channel = supabase
        .channel("complaints")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "complaints" },
          () => loadComplaints()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "responses" },
          () => loadComplaints()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, []);

    const submitComplaint = async (
      complaint: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "responses">
    ): Promise<Complaint> => {
      if (!user) throw new Error("User not authenticated");

      try {
        const now = new Date().toISOString();
        const newComplaint = {
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          status: "open",
          is_anonymous: complaint.isAnonymous,
          submitter_id: user.id,
          tagged_users: complaint.taggedUsers,
          created_at: now,
          updated_at: now,
        };

        const { data, error } = await supabase
          .from("complaints")
          .insert(newComplaint)
          .select()
          .single();

        if (error) throw error;

        const createdComplaint: Complaint = {
          ...complaint,
          id: data.id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          responses: [],
        };

        setComplaints([...complaints, createdComplaint]);
        return createdComplaint;
      } catch (error) {
        console.error("Failed to submit complaint:", error);
        throw error;
      }
    };

    const updateComplaintStatus = async (id: string, status: ComplaintStatus): Promise<void> => {
      if (!user || !isAdmin) throw new Error("Only admins can update complaint status");

      try {
        const { error } = await supabase
          .from("complaints")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;
      } catch (error) {
        console.error("Failed to update complaint status:", error);
        throw error;
      }
    };

    const addResponse = async (
      complaintId: string,
      response: Omit<ComplaintResponse, "id" | "createdAt">
    ): Promise<void> => {
      if (!user) throw new Error("User not authenticated");

      try {
        const newResponse = {
          complaint_id: complaintId,
          text: response.text,
          user_id: user.id,
          user_name: response.isAnonymous ? "Anonymous" : user.name,
          is_admin: isAdmin,
          is_anonymous: response.isAnonymous,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("responses").insert(newResponse);
        if (error) throw error;
      } catch (error) {
        console.error("Failed to add response:", error);
        throw error;
      }
    };

    const getComplaintById = (id: string): Complaint | undefined => {
      return complaints.find((complaint) => complaint.id === id);
    };

    const getUserComplaints = (): Complaint[] => {
      if (!user) return [];
      return complaints.filter((complaint) => complaint.submitterId === user.id);
    };

    const getTaggedComplaints = (): Complaint[] => {
      if (!user) return [];
      return complaints.filter(
        (complaint) =>
          complaint.taggedUsers.includes(user.id) && complaint.submitterId !== user.id
      );
    };

    return {
      complaints: isAdmin || isHR ? complaints : [...getUserComplaints(), ...getTaggedComplaints()],
      isLoading,
      submitComplaint,
      updateComplaintStatus,
      addResponse,
      getComplaintById,
      getUserComplaints,
      getTaggedComplaints,
    };
  }
);