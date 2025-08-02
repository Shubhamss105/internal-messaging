import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Channel } from "@/types";
import { colors } from "@/constants/colors";
import { mockUsers } from "@/mocks/data";
import { useAuth } from "@/contexts/auth-context";

interface ChannelItemProps {
  channel: Channel;
}

export default function ChannelItem({ channel }: ChannelItemProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const channelName = useMemo(() => {
    if (channel.type === "direct") {
      const otherParticipant = mockUsers.find(
        u => channel.participants.includes(u.id) && u.id !== user?.id
      );
      return otherParticipant?.name || channel.name;
    }
    return channel.name;
  }, [channel, user]);
  
  const channelAvatar = useMemo(() => {
    if (channel.type === "direct") {
      const otherParticipant = mockUsers.find(
        u => channel.participants.includes(u.id) && u.id !== user?.id
      );
      return otherParticipant?.avatar;
    }
    return null;
  }, [channel, user]);
  
  const formattedTime = useMemo(() => {
    if (!channel.lastMessage) return "";
    
    const date = new Date(channel.lastMessage.createdAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, [channel.lastMessage]);
  
  const handlePress = () => {
    router.push(`/messages/${channel.id}`);
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      testID="channel-item"
    >
      {channelAvatar ? (
        <Image source={{ uri: channelAvatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{channelName.charAt(0)}</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {channelName}
          </Text>
          {formattedTime ? (
            <Text style={styles.time}>{formattedTime}</Text>
          ) : null}
        </View>
        
        <View style={styles.messageRow}>
          {channel.lastMessage ? (
            <Text style={styles.message} numberOfLines={1}>
              {channel.lastMessage.isAnonymous
                ? "Anonymous: "
                : `${channel.lastMessage.senderName.split(" ")[0]}: `}
              {channel.lastMessage.text}
            </Text>
          ) : (
            <Text style={styles.noMessage}>No messages yet</Text>
          )}
          
          {(channel.unreadCount ?? 0) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {channel.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  noMessage: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: "italic",
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "bold",
  },
});