import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ComplaintStatus } from "@/types";
import { colors } from "@/constants/colors";

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: "small" | "medium" | "large";
}

export default function StatusBadge({ status, size = "medium" }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case "open":
        return colors.statusOpen;
      case "in_progress":
        return colors.statusInProgress;
      case "closed":
        return colors.statusClosed;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "open":
        return "Open";
      case "in_progress":
        return "In Progress";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container: { paddingVertical: 2, paddingHorizontal: 6 },
          text: { fontSize: 10 },
        };
      case "large":
        return {
          container: { paddingVertical: 6, paddingHorizontal: 12 },
          text: { fontSize: 14 },
        };
      default:
        return {
          container: { paddingVertical: 4, paddingHorizontal: 8 },
          text: { fontSize: 12 },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const statusColor = getStatusColor();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: `${statusColor}20` },
        sizeStyles.container,
      ]}
      testID="status-badge"
    >
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.text, { color: statusColor }, sizeStyles.text]}>
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    fontWeight: "600",
  },
});