import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useAnnouncements } from "@/contexts/announcements-context";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";
import AnnouncementCard from "@/components/AnnouncementCard";

export default function AnnouncementsScreen() {
  const { announcements, isLoading } = useAnnouncements();
  const { isAdmin } = useAuth();
  const router = useRouter();
  
  const handleNewAnnouncement = () => {
    router.push("/announcements/new");
  };
  
  const handleAnnouncementPress = (id: string) => {
    router.push(`/announcements/${id}`);
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnnouncementCard
            announcement={item}
            onPress={() => handleAnnouncementPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No announcements yet</Text>
            {isAdmin && (
              <Text style={styles.emptySubtext}>
                Create a new announcement to keep your team informed
              </Text>
            )}
          </View>
        }
      />
      
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewAnnouncement}
          testID="new-announcement-button"
        >
          <Plus size={24} color={colors.card} />
        </TouchableOpacity>
      )}
    </View>
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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});