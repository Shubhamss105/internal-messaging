import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { 
  Bell, 
  MessageSquare, 
  FileText, 
  User, 
  LogOut,
  PlusCircle
} from "lucide-react-native";
import React from "react";
import { Alert, TouchableOpacity, StyleSheet, View } from "react-native";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";

export default function TabLayout() {
  const { isAdmin, logout } = useAuth();
  const router = useRouter();
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleNewComplaint = () => {
    router.push("/complaints/new");
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.borderLight,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "600",
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <LogOut size={22} color={colors.text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Complaints",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity onPress={handleNewComplaint} style={styles.newComplaintButton}>
                <PlusCircle size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
                <LogOut size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: "Announcements",
          tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  newComplaintButton: {
    marginRight: 16,
  },
});