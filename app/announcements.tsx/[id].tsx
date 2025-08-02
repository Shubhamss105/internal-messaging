import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, Clock, Trash2 } from "lucide-react-native";
import { useAnnouncements } from "@/contexts/announcements-context";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import { mockUsers } from "@/mocks/data";

export default function AnnouncementDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { announcements, deleteAnnouncement } = useAnnouncements();
  const { isAdmin } = useAuth();
  const router = useRouter();
  
  const announcement = announcements.find(a => a.id === id);
  
  if (!announcement) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  const createdBy = mockUsers.find(u => u.id === announcement.createdBy)?.name || "Unknown";
  
  const formattedDate = new Date(announcement.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to delete this announcement?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnnouncement(announcement.id);
              router.back();
            } catch (error) {
              console.error("Failed to delete announcement:", error);
              Alert.alert("Error", "Failed to delete announcement");
            }
          },
        },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {announcement.isImportant && (
          <View style={styles.importantBadge}>
            <AlertCircle size={16} color={colors.card} />
            <Text style={styles.importantText}>Important</Text>
          </View>
        )}
        
        <Text style={styles.title}>{announcement.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>
          
          <Text style={styles.metaText}>By {createdBy}</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{announcement.content}</Text>
      </View>
      
      {isAdmin && (
        <View style={styles.adminActions}>
          <Button
            title="Delete Announcement"
            onPress={handleDelete}
            variant="danger"
            icon={<Trash2 size={18} color={colors.card} />}
            testID="delete-button"
          />
        </View>
      )}
    </ScrollView>
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
  header: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  importantBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  importantText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: colors.card,
    marginTop: 16,
  },
  content: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  adminActions: {
    padding: 16,
    marginTop: 16,
  },
});