import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AlertCircle, Clock } from "lucide-react-native";
import { Announcement } from "@/types";
import { colors } from "@/constants/colors";
import { mockUsers } from "@/mocks/data";

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress?: () => void;
}

export default function AnnouncementCard({ announcement, onPress }: AnnouncementCardProps) {
  const formattedDate = useMemo(() => {
    const date = new Date(announcement.createdAt);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [announcement.createdAt]);
  
  const createdBy = useMemo(() => {
    const user = mockUsers.find(u => u.id === announcement.createdBy);
    return user?.name || "Unknown";
  }, [announcement.createdBy]);
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        announcement.isImportant && styles.importantContainer,
      ]}
      onPress={onPress}
      disabled={!onPress}
      testID="announcement-card"
    >
      {announcement.isImportant && (
        <View style={styles.importantBadge}>
          <AlertCircle size={14} color={colors.card} />
          <Text style={styles.importantText}>Important</Text>
        </View>
      )}
      
      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.content} numberOfLines={3}>
        {announcement.content}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.footerText}>{formattedDate}</Text>
        </View>
        
        <Text style={styles.footerText}>By {createdBy}</Text>
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
  importantContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  importantBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  importantText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});