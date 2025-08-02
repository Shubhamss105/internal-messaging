import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  testID?: string;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  testID,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          container: {
            backgroundColor: colors.secondary,
          },
          text: {
            color: colors.card,
          },
        };
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.primary,
          },
          text: {
            color: colors.primary,
          },
        };
      case "danger":
        return {
          container: {
            backgroundColor: colors.error,
          },
          text: {
            color: colors.card,
          },
        };
      default:
        return {
          container: {
            backgroundColor: colors.primary,
          },
          text: {
            color: colors.card,
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container: {
            paddingVertical: 8,
            paddingHorizontal: 12,
          },
          text: {
            fontSize: 14,
          },
          icon: {
            marginRight: 6,
          },
        };
      case "large":
        return {
          container: {
            paddingVertical: 16,
            paddingHorizontal: 24,
          },
          text: {
            fontSize: 18,
          },
          icon: {
            marginRight: 10,
          },
        };
      default:
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 16,
          },
          text: {
            fontSize: 16,
          },
          icon: {
            marginRight: 8,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? colors.primary : colors.card}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={sizeStyles.icon}>{icon}</View>}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
});