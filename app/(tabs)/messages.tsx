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
import { useMessaging } from "@/contexts/messaging-context";
import { colors } from "@/constants/colors";
import ChannelItem from "@/components/ChannelItem";

export default function MessagesScreen() {
  const { channels, isLoading } = useMessaging();
  const router = useRouter();
  
  const handleNewChannel = () => {
    // In a real app, this would navigate to a new channel creation screen
    // For this demo, we'll just show a placeholder
    console.log("Create new channel");
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
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChannelItem channel={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a new conversation to begin messaging
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewChannel}
        testID="new-channel-button"
      >
        <Plus size={24} color={colors.card} />
      </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 100,
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