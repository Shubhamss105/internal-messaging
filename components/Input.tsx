import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, TextInputProps, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  testID?: string;
}

export default function Input({
  label,
  error,
  leftIcon,
  isPassword = false,
  testID,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.error,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
          placeholderTextColor={colors.textLight}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity style={styles.rightIcon} onPress={togglePasswordVisibility}>
            {showPassword ? (
              <Eye
                size={20}
                color={colors.textSecondary}
              />
            ) : (
              <EyeOff
                size={20}
                color={colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  focused: {
    borderColor: colors.primary,
  },
  error: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});