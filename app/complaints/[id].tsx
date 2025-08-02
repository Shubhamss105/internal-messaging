import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Send, User } from "lucide-react-native";
import { useComplaints } from "@/contexts/complaints-context";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import { ComplaintStatus } from "@/types";
import { mockCategories, mockUsers } from "@/mocks/data";

export default function ComplaintDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getComplaintById, addResponse, updateComplaintStatus } = useComplaints();
  const { user, isAdmin } = useAuth();
  const [response, setResponse] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const complaint = getComplaintById(id);
  
  if (!complaint || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  const category = mockCategories.find(c => c.id === complaint.category)?.name || "Other";
  
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const handleSendResponse = async () => {
    if (!response.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addResponse(complaint.id, {
        text: response,
        userId: user.id,
        userName: user.name,
        isAdmin,
        isAnonymous,
      });
      
      setResponse("");
    } catch (error) {
      console.error("Failed to send response:", error);
      Alert.alert("Error", "Failed to send response");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateStatus = async (status: ComplaintStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateComplaintStatus(complaint.id, status);
      Alert.alert("Success", `Complaint status updated to ${status}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      Alert.alert("Error", "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  const renderResponseItem = (response: typeof complaint.responses[0], index: number) => {
    const isCurrentUser = response.userId === user.id;
    const responseUser = mockUsers.find(u => u.id === response.userId);
    
    return (
      <View
        key={response.id}
        style={[
          styles.responseItem,
          isCurrentUser ? styles.currentUserResponse : styles.otherUserResponse,
        ]}
      >
        <View style={styles.responseHeader}>
          {response.isAnonymous ? (
            <Text style={styles.responseName}>Anonymous</Text>
          ) : (
            <Text style={styles.responseName}>
              {response.userName}
              {response.isAdmin && " (Admin)"}
            </Text>
          )}
          <Text style={styles.responseTime}>
            {new Date(response.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        
        <Text style={styles.responseText}>{response.text}</Text>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{complaint.title}</Text>
          <StatusBadge status={complaint.status} />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Text style={styles.infoValue}>{category}</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Submitted:</Text>
          <Text style={styles.infoValue}>{formattedDate}</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Submitted by:</Text>
          <Text style={styles.infoValue}>
            {complaint.isAnonymous ? "Anonymous" : mockUsers.find(u => u.id === complaint.submitterId)?.name || "Unknown"}
          </Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.description}>{complaint.description}</Text>
        </View>
        
        {isAdmin && complaint.status !== "closed" && (
          <View style={styles.adminActions}>
            <Text style={styles.adminActionsTitle}>Admin Actions:</Text>
            <View style={styles.statusButtons}>
              {complaint.status !== "in_progress" && (
                <Button
                  title="Mark In Progress"
                  onPress={() => handleUpdateStatus("in_progress")}
                  variant="secondary"
                  size="small"
                  loading={isUpdatingStatus}
                  disabled={isUpdatingStatus}
                  testID="mark-in-progress-button"
                />
              )}
              
              <Button
                title="Close Complaint"
                onPress={() => handleUpdateStatus("closed")}
                variant="outline"
                size="small"
                loading={isUpdatingStatus}
                disabled={isUpdatingStatus}
                testID="close-complaint-button"
              />
            </View>
          </View>
        )}
        
        <View style={styles.responsesContainer}>
          <Text style={styles.responsesTitle}>Responses:</Text>
          {complaint.responses.length === 0 ? (
            <Text style={styles.noResponses}>No responses yet</Text>
          ) : (
            complaint.responses.map(renderResponseItem)
          )}
        </View>
      </ScrollView>
      
      {complaint.status !== "closed" && (
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[
              styles.anonymousToggle,
              isAnonymous && styles.anonymousToggleActive,
            ]}
            onPress={() => setIsAnonymous(!isAnonymous)}
          >
            <User
              size={16}
              color={isAnonymous ? colors.card : colors.textSecondary}
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type your response..."
            value={response}
            onChangeText={setResponse}
            multiline
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              !response.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendResponse}
            disabled={!response.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.card} />
            ) : (
              <Send size={20} color={colors.card} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  adminActions: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  adminActionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: "row",
    gap: 12,
  },
  responsesContainer: {
    padding: 16,
    backgroundColor: colors.card,
  },
  responsesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  noResponses: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  responseItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  currentUserResponse: {
    backgroundColor: `${colors.primary}15`,
    marginLeft: 40,
  },
  otherUserResponse: {
    backgroundColor: colors.borderLight,
    marginRight: 40,
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  responseName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  responseTime: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  responseText: {
    fontSize: 14,
    color: colors.text,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: "center",
  },
  anonymousToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  anonymousToggleActive: {
    backgroundColor: colors.primary,
  },
  input: {
    flex: 1,
    backgroundColor: colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});