import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, Mic, X } from "lucide-react-native";
import { useComplaints } from "@/contexts/complaints-context";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { mockCategories, mockUsers } from "@/mocks/data";

export default function NewComplaintScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { submitComplaint } = useComplaints();
  const { user } = useAuth();
  const router = useRouter();
  
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  const handleRemoveImage = () => {
    setImage(null);
  };
  
  const handleToggleUserTag = (userId: string) => {
    if (taggedUsers.includes(userId)) {
      setTaggedUsers(taggedUsers.filter(id => id !== userId));
    } else {
      setTaggedUsers([...taggedUsers, userId]);
    }
  };
  
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const newComplaint = await submitComplaint({
        title,
        description,
        category,
        status: "open",
        isAnonymous,
        submitterId: user.id,
        taggedUsers,
      });
      
      Alert.alert("Success", "Complaint submitted successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to submit complaint:", error);
      Alert.alert("Error", "Failed to submit complaint");
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
            placeholder="Enter complaint title"
            value={title}
            onChangeText={setTitle}
            testID="title-input"
          />
          
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoriesContainer}>
            {mockCategories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  category === cat.id && styles.categoryItemSelected,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.id && styles.categoryTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Input
            label="Description *"
            placeholder="Describe your complaint in detail"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
            testID="description-input"
          />
          
          <View style={styles.attachmentsContainer}>
            <Text style={styles.label}>Attachments</Text>
            <View style={styles.attachmentButtons}>
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={handlePickImage}
              >
                <Camera size={20} color={colors.primary} />
                <Text style={styles.attachmentButtonText}>Add Image</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachmentButton}>
                <Mic size={20} color={colors.primary} />
                <Text style={styles.attachmentButtonText}>Add Audio</Text>
              </TouchableOpacity>
            </View>
            
            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <X size={16} color={colors.card} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.taggedUsersContainer}>
            <Text style={styles.label}>Tag Users</Text>
            <Text style={styles.taggedUsersDescription}>
              Tag users who should be notified about this complaint
            </Text>
            
            <View style={styles.usersList}>
              {mockUsers
                .filter(u => u.id !== user?.id)
                .map(u => (
                  <TouchableOpacity
                    key={u.id}
                    style={[
                      styles.userItem,
                      taggedUsers.includes(u.id) && styles.userItemSelected,
                    ]}
                    onPress={() => handleToggleUserTag(u.id)}
                  >
                    {u.avatar ? (
                      <Image source={{ uri: u.avatar }} style={styles.userAvatar} />
                    ) : (
                      <View style={styles.userAvatarPlaceholder}>
                        <Text style={styles.userAvatarText}>{u.name.charAt(0)}</Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.userName,
                        taggedUsers.includes(u.id) && styles.userNameSelected,
                      ]}
                    >
                      {u.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
          
          <View style={styles.anonymousContainer}>
            <View>
              <Text style={styles.label}>Submit Anonymously</Text>
              <Text style={styles.anonymousDescription}>
                Your identity will not be revealed to tagged users
              </Text>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: colors.borderLight, true: `${colors.primary}80` }}
              thumbColor={isAnonymous ? colors.primary : colors.textLight}
              testID="anonymous-switch"
            />
          </View>
          
          <Button
            title="Submit Complaint"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !title || !description || !category}
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
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryItemSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.card,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  attachmentsContainer: {
    marginBottom: 16,
  },
  attachmentButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  attachmentButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: `${colors.primary}15`,
    marginRight: 12,
  },
  attachmentButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: "relative",
    alignSelf: "flex-start",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  taggedUsersContainer: {
    marginBottom: 16,
  },
  taggedUsersDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  usersList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    marginRight: 8,
    marginBottom: 8,
  },
  userItemSelected: {
    backgroundColor: `${colors.primary}30`,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  userAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.card,
  },
  userName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userNameSelected: {
    color: colors.primary,
  },
  anonymousContainer: {
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
  anonymousDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});