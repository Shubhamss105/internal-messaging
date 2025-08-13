import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Briefcase, Mail, User } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function ProfileScreen() {
  const { user, isAdmin, createUser } = useAuth();
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserDepartment, setNewUserDepartment] = useState("");
  const [newUserRole, setNewUserRole] = useState<"employee" | "hr">("employee");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  if (!user) {
    return null;
  }

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserName || !newUserDepartment) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!newUserEmail.includes("@") || newUserPassword.length < 6) {
      Alert.alert("Error", "Please enter a valid email and a password with at least 6 characters");
      return;
    }

    setIsCreatingUser(true);
    try {
      const success = await createUser(
        newUserEmail,
        newUserPassword,
        newUserRole,
        newUserName,
        newUserDepartment
      );
      if (success) {
        Alert.alert("Success", "Employee account created successfully. They can now log in with the provided credentials.");
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserName("");
        setNewUserDepartment("");
        setNewUserRole("employee");
      } else {
        Alert.alert("Error", "Failed to create employee account");
      }
    } catch (error: any) {
      console.error("Create user error:", error);
      Alert.alert("Error", `Failed to create employee: ${error.message}`);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
        )}
        
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user.role === "admin" ? "Admin" : user.role === "hr" ? "HR" : "Employee"}
          </Text>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Mail size={20} color={colors.textSecondary} />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Briefcase size={20} color={colors.textSecondary} />
          <Text style={styles.infoText}>{user.department}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <User size={20} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {user.role === "admin" ? "Administrator" : user.role === "hr" ? "HR" : "Employee"}
          </Text>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Employee</Text>
          <View style={styles.form}>
            <Input
              label="Email *"
              placeholder="Enter employee email"
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="new-user-email-input"
            />
            <Input
              label="Password *"
              placeholder="Enter employee password"
              value={newUserPassword}
              onChangeText={setNewUserPassword}
              isPassword
              testID="new-user-password-input"
            />
            <Input
              label="Name *"
              placeholder="Enter employee name"
              value={newUserName}
              onChangeText={setNewUserName}
              testID="new-user-name-input"
            />
            <Input
              label="Department *"
              placeholder="Enter employee department"
              value={newUserDepartment}
              onChangeText={setNewUserDepartment}
              testID="new-user-department-input"
            />
            <Text style={styles.label}>Role *</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  newUserRole === "employee" && styles.roleButtonSelected,
                ]}
                onPress={() => setNewUserRole("employee")}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    newUserRole === "employee" && styles.roleButtonTextSelected,
                  ]}
                >
                  Employee
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  newUserRole === "hr" && styles.roleButtonSelected,
                ]}
                onPress={() => setNewUserRole("hr")}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    newUserRole === "hr" && styles.roleButtonTextSelected,
                  ]}
                >
                  HR
                </Text>
              </TouchableOpacity>
            </View>
            <Button
              title="Create Employee"
              onPress={handleCreateUser}
              loading={isCreatingUser}
              disabled={isCreatingUser || !newUserEmail || !newUserPassword || !newUserName || !newUserDepartment}
              fullWidth
              testID="create-employee-button"
            />
          </View>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionText}>
          This is a demo profile for the internal messaging and complaint system.
          {"\n\n"}
          In a real application, this section would contain more detailed information about the user,
          such as their bio, contact information, and other relevant details.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.card,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: colors.card,
    padding: 16,
    marginTop: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  section: {
    padding: 16,
    marginTop: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: "center",
  },
  roleButtonSelected: {
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  roleButtonTextSelected: {
    color: colors.card,
  },
});