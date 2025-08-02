import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Briefcase, Mail, User } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";

export default function ProfileScreen() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
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
            {user.role === "admin" ? "Admin" : "Employee"}
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
            {user.role === "admin" ? "Administrator" : "Employee"}
          </Text>
        </View>
      </View>
      
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
});