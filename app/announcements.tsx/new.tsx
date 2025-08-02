import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAnnouncements } from "@/contexts/announcements-context";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function NewAnnouncementScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createAnnouncement } = useAnnouncements();
  const { isAdmin } = useAuth();
  const router = useRouter();
  
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    
    if (!isAdmin) {
      Alert.alert("Error", "Only admins can create announcements");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createAnnouncement(title, content, isImportant);
      
      Alert.alert("Success", "Announcement created successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to create announcement:", error);
      Alert.alert("Error", "Failed to create announcement");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Input
            label="Title *"
            placeholder="Enter announcement title"
            value={title}
            onChangeText={setTitle}
            testID="title-input"
          />
          
          <Input
            label="Content *"
            placeholder="Enter announcement content"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            style={styles.contentInput}
            testID="content-input"
          />
          
          <View style={styles.importantContainer}>
            <View>
              <Text style={styles.label}>Mark as Important</Text>
              <Text style={styles.importantDescription}>
                Important announcements are highlighted and shown at the top
              </Text>
            </View>
            <Switch
              value={isImportant}
              onValueChange={setIsImportant}
              trackColor={{ false: colors.borderLight, true: `${colors.accent}80` }}
              thumbColor={isImportant ? colors.accent : colors.textLight}
              testID="important-switch"
            />
          </View>
          
          <Button
            title="Publish Announcement"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !title || !content}
            fullWidth
            testID="submit-button"
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
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 6,
  },
  contentInput: {
    height: 150,
    textAlignVertical: "top",
  },
  importantContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  importantDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});