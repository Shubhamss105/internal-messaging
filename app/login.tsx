import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Mail, Lock } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Login Failed",
          "Invalid credentials. For demo, use admin@company.com or john@company.com"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            }}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Company Messenger</Text>
        <Text style={styles.subtitle}>
          Sign in to access your company's internal communication platform
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Mail size={20} color={colors.textSecondary} />}
            testID="email-input"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            leftIcon={<Lock size={20} color={colors.textSecondary} />}
            isPassword
            testID="password-input"
          />

          <Text style={styles.demoText}>
            Demo credentials:{"\n"}
            Admin: admin@company.com{"\n"}
            Employee: john@company.com{"\n"}
            (Any password will work)
          </Text>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            testID="login-button"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginVertical: 16,
    padding: 12,
    backgroundColor: `${colors.info}15`,
    borderRadius: 8,
  },
});