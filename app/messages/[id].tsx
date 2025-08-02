import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Send, User } from "lucide-react-native";
import { useMessaging } from "@/contexts/messaging-context";
import { useAuth } from "@/contexts/auth-context";
import { colors } from "@/constants/colors";
import { Message } from "@/types";
import { mockUsers } from "@/mocks/data";

export default function MessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getChannelById, getChannelMessages, sendMessage, markChannelAsRead } = useMessaging();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  
  const channel = getChannelById(id);
  const messages = getChannelMessages(id);
  
  useEffect(() => {
    if (channel) {
      markChannelAsRead(channel.id);
    }
  }, [channel]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  if (!channel || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  const handleSendMessage = async () => {
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      await sendMessage(channel.id, text, isAnonymous);
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === user.id;
    const messageUser = mockUsers.find(u => u.id === item.senderId);
    
    return (
      <View
        style={[
          styles.messageItem,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        {!isCurrentUser && !item.isAnonymous && messageUser?.avatar && (
          <Image
            source={{ uri: messageUser.avatar }}
            style={styles.messageAvatar}
          />
        )}
        
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          {!isCurrentUser && (
            <Text style={styles.messageSender}>
              {item.isAnonymous ? "Anonymous" : item.senderName}
            </Text>
          )}
          
          <Text style={styles.messageText}>{item.text}</Text>
          
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start the conversation by sending a message
            </Text>
          </View>
        }
      />
      
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[
            styles.anonymousToggle,
            isAnonymous && styles.anonymousToggleActive,
          ]}
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <User
            size={16}
            color={isAnonymous ? colors.card : colors.textSecondary}
          />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={text}
          onChangeText={setText}
          multiline
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            !text.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!text.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.card} />
          ) : (
            <Send size={20} color={colors.card} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  messageItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  currentUserMessage: {
    justifyContent: "flex-end",
  },
  otherUserMessage: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },
  currentUserBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textSecondary,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: "center",
  },
  anonymousToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  anonymousToggleActive: {
    backgroundColor: colors.primary,
  },
  input: {
    flex: 1,
    backgroundColor: colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});