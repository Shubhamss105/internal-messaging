import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Filter, Plus } from "lucide-react-native";
import { useComplaints } from "@/contexts/complaints-context";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";
import ComplaintCard from "@/components/ComplaintCard";
import { ComplaintStatus } from "@/types";

export default function ComplaintsScreen() {
  const { complaints, isLoading } = useComplaints();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  
  const filteredComplaints = statusFilter === "all"
    ? complaints
    : complaints.filter(complaint => complaint.status === statusFilter);
  
  const handleNewComplaint = () => {
    router.push("/complaints/new");
  };
  
  const renderFilterButton = (status: ComplaintStatus | "all", label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        statusFilter === status && styles.activeFilterButton,
      ]}
      onPress={() => setStatusFilter(status)}
    >
      <Text
        style={[
          styles.filterButtonText,
          statusFilter === status && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <Filter size={18} color={colors.textSecondary} />
          <Text style={styles.filterText}>Filter:</Text>
          {renderFilterButton("all", "All")}
          {renderFilterButton("open", "Open")}
          {renderFilterButton("in_progress", "In Progress")}
          {renderFilterButton("closed", "Closed")}
        </View>
      </View>
      
      <FlatList
        data={filteredComplaints}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ComplaintCard complaint={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No complaints found</Text>
            <Text style={styles.emptySubtext}>
              {statusFilter !== "all"
                ? `Try changing the filter or create a new complaint`
                : `Create a new complaint to get started`}
            </Text>
          </View>
        }
      />
      
      {!isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewComplaint}
          testID="new-complaint-button"
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
  header: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    marginRight: 8,
    marginBottom: 4,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeFilterButtonText: {
    color: colors.card,
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