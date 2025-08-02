import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Clock, MessageSquare, User } from "lucide-react-native";
import { Complaint } from "@/types";
import { colors } from "@/constants/colors";
import StatusBadge from "./StatusBadge";
import { mockCategories } from "@/mocks/data";

interface ComplaintCardProps {
  complaint: Complaint;
}

export default function ComplaintCard({ complaint }: ComplaintCardProps) {
  const router = useRouter();
  
  const category = useMemo(() => {
    return mockCategories.find(c => c.id === complaint.category)?.name || "Other";
  }, [complaint.category]);
  
  const formattedDate = useMemo(() => {
    const date = new Date(complaint.createdAt);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [complaint.createdAt]);
  
  const handlePress = () => {
    router.push(`/complaints/${complaint.id}`);
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      testID="complaint-card"
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {complaint.title}
        </Text>
        <StatusBadge status={complaint.status} size="small" />
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {complaint.description}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.footerText}>{formattedDate}</Text>
        </View>
        
        <View style={styles.footerItem}>
          <MessageSquare size={14} color={colors.textSecondary} />
          <Text style={styles.footerText}>{complaint.responses.length}</Text>
        </View>
        
        {complaint.isAnonymous ? (
          <View style={styles.footerItem}>
            <User size={14} color={colors.textSecondary} />
            <Text style={styles.footerText}>Anonymous</Text>
          </View>
        ) : null}
        
        <View style={styles.category}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  category: {
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: "500",
  },
});