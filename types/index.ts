export type UserRole = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type ComplaintStatus = "open" | "in_progress" | "closed";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  submitterId: string;
  taggedUsers: string[];
  attachments?: Attachment[];
  responses: ComplaintResponse[];
}

export interface ComplaintResponse {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  isAnonymous: boolean;
}

export interface Attachment {
  id: string;
  type: "image" | "audio";
  uri: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isAnonymous: boolean;
  createdAt: string;
  channelId: string;
  attachments?: Attachment[];
}

export interface Channel {
  id: string;
  name: string;
  type: "direct" | "group" | "department";
  participants: string[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  isImportant: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Department {
  id: string;
  name: string;
}