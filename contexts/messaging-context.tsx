import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Channel, Message } from "@/types";
import { mockChannels, mockMessages } from "@/mocks/data";
import { useAuth } from "./auth-context";

interface MessagingState {
  channels: Channel[];
  isLoading: boolean;
  getChannelMessages: (channelId: string) => Message[];
  sendMessage: (channelId: string, text: string, isAnonymous: boolean) => Promise<void>;
  createChannel: (name: string, type: Channel["type"], participants: string[]) => Promise<Channel>;
  getChannelById: (id: string) => Channel | undefined;
  markChannelAsRead: (channelId: string) => Promise<void>;
}

export const [MessagingProvider, useMessaging] = createContextHook<MessagingState>(() => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadMessaging = async () => {
      try {
        const storedChannels = await AsyncStorage.getItem("channels");
        const storedMessages = await AsyncStorage.getItem("messages");
        
        if (storedChannels && storedMessages) {
          setChannels(JSON.parse(storedChannels));
          setMessages(JSON.parse(storedMessages));
        } else {
          // Initialize with mock data for demo
          setChannels(mockChannels);
          setMessages(mockMessages);
          await AsyncStorage.setItem("channels", JSON.stringify(mockChannels));
          await AsyncStorage.setItem("messages", JSON.stringify(mockMessages));
        }
      } catch (error) {
        console.error("Failed to load messaging data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessaging();
  }, []);
  
  const saveChannels = async (updatedChannels: Channel[]) => {
    try {
      await AsyncStorage.setItem("channels", JSON.stringify(updatedChannels));
      setChannels(updatedChannels);
    } catch (error) {
      console.error("Failed to save channels:", error);
    }
  };
  
  const saveMessages = async (updatedMessages: Record<string, Message[]>) => {
    try {
      await AsyncStorage.setItem("messages", JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to save messages:", error);
    }
  };
  
  const getChannelMessages = (channelId: string): Message[] => {
    return messages[channelId] || [];
  };
  
  const sendMessage = async (channelId: string, text: string, isAnonymous: boolean): Promise<void> => {
    if (!user) return;
    
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        senderId: user.id,
        senderName: user.name,
        isAnonymous,
        createdAt: new Date().toISOString(),
        channelId,
      };
      
      // Update messages
      const channelMessages = messages[channelId] || [];
      const updatedMessages = {
        ...messages,
        [channelId]: [...channelMessages, newMessage],
      };
      
      // Update channel with last message
      const updatedChannels = channels.map(channel => {
        if (channel.id === channelId) {
          return {
            ...channel,
            lastMessage: newMessage,
            unreadCount: 0, // Reset for sender
          };
        }
        return channel;
      });
      
      await saveMessages(updatedMessages);
      await saveChannels(updatedChannels);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };
  
  const createChannel = async (name: string, type: Channel["type"], participants: string[]): Promise<Channel> => {
    try {
      const newChannel: Channel = {
        id: Date.now().toString(),
        name,
        type,
        participants,
        unreadCount: 0,
      };
      
      const updatedChannels = [...channels, newChannel];
      await saveChannels(updatedChannels);
      
      // Initialize empty message array for this channel
      const updatedMessages = {
        ...messages,
        [newChannel.id]: [],
      };
      await saveMessages(updatedMessages);
      
      return newChannel;
    } catch (error) {
      console.error("Failed to create channel:", error);
      throw error;
    }
  };
  
  const getChannelById = (id: string): Channel | undefined => {
    return channels.find(channel => channel.id === id);
  };
  
  const markChannelAsRead = async (channelId: string): Promise<void> => {
    try {
      const updatedChannels = channels.map(channel => {
        if (channel.id === channelId) {
          return {
            ...channel,
            unreadCount: 0,
          };
        }
        return channel;
      });
      
      await saveChannels(updatedChannels);
    } catch (error) {
      console.error("Failed to mark channel as read:", error);
      throw error;
    }
  };
  
  return {
    channels: user ? channels.filter(channel => channel.participants.includes(user.id)) : [],
    isLoading,
    getChannelMessages,
    sendMessage,
    createChannel,
    getChannelById,
    markChannelAsRead,
  };
});