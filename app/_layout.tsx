import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/auth-context";
import { ComplaintsProvider } from "@/contexts/complaints-context";
import { MessagingProvider } from "@/contexts/messaging-context";
import { AnnouncementsProvider } from "@/contexts/announcements-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="complaints/[id]" options={{ title: "Complaint Details" }} />
      <Stack.Screen name="complaints/new" options={{ title: "New Complaint" }} />
      <Stack.Screen name="messages/[id]" options={{ title: "Messages" }} />
      <Stack.Screen name="announcements/new" options={{ title: "New Announcement" }} />
      <Stack.Screen name="announcements/[id]" options={{ title: "Announcement" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ComplaintsProvider>
            <MessagingProvider>
              <AnnouncementsProvider>
                <RootLayoutNav />
              </AnnouncementsProvider>
            </MessagingProvider>
          </ComplaintsProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}