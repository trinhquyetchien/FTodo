"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Hash, 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  Users, 
  Bell, 
  Pin, 
  Circle, 
  Sparkles, 
  Phone, 
  Video, 
  Info, 
  MessageCircle, 
  ChevronLeft,
  Plus,
  Trash2,
  UserPlus,
  UserMinus,
  Lock,
  Shield,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProject } from "../project-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface Message {
  id: string;
  sender: {
    id?: string;
    name: string;
    role: string;
    avatar: string;
    isCurrentUser?: boolean;
  };
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; users: string[] }[];
  attachment?: { name: string; size: string; type: string };
  isSystem?: boolean;
}

interface ChannelMemberInfo {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  };
}

interface Channel {
  id: string;
  name: string;
  description: string;
  isPrivate?: boolean;
  unreadCount?: number;
  members?: ChannelMemberInfo[];
  _count?: {
    messages: number;
    members: number;
  };
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: "online" | "busy" | "offline";
  avatar: string;
  email: string;
  unreadCount?: number;
}

type ActiveChatTarget = 
  | { type: "channel"; id: string }
  | { type: "dm"; id: string };

export default function ProjectChatPage() {
  const { project } = useProject();
  const { user } = useAuth();
  
  // Channels and Team Members state
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChatTarget>({ type: "channel", id: "" });
  const [mobileTab, setMobileTab] = useState<"list" | "chat">("chat");
  
  // Messages state
  const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({});
  const [dmMessages, setDmMessages] = useState<Record<string, Message[]>>({});
  const [inputMessage, setInputMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Channel Members State for Active Channel
  const [activeChannelMembers, setActiveChannelMembers] = useState<ChannelMemberInfo[]>([]);

  // Dialog State: Create Channel
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [isChannelPrivate, setIsChannelPrivate] = useState(false);
  const [selectedInitialMembers, setSelectedInitialMembers] = useState<string[]>([]);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [channelError, setChannelError] = useState("");

  // Dialog State: Add Member to Channel
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Dialog State: Delete Channel Confirmation
  const [isDeleteChannelOpen, setIsDeleteChannelOpen] = useState(false);
  const [isDeletingChannel, setIsDeletingChannel] = useState(false);

  // Helper to format backend Message response to UI Message
  const formatMessage = useCallback((m: any): Message => {
    const isMe = m.user?.id === user?.id || m.user?.email === user?.email || m.userId === user?.id;
    return {
      id: m.id,
      sender: {
        id: m.user?.id || m.userId,
        name: m.user?.name || (isMe ? (user?.name || "Bạn") : "Thành viên"),
        role: (m.user?.id === project?.ownerId || m.userId === project?.ownerId) ? "Product Owner" : "Thành viên",
        avatar: m.user?.avatar || (m.user?.name ? m.user.name.slice(0, 2).toUpperCase() : (isMe ? (user?.avatar || "ME") : "US")),
        isCurrentUser: isMe,
      },
      content: m.content,
      timestamp: m.createdAt 
        ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reactions: Array.isArray(m.reactions) ? m.reactions : [],
      attachment: m.attachment ? { name: m.attachment, size: "1.2 MB", type: "file" } : undefined,
    };
  }, [user?.id, user?.email, user?.name, user?.avatar, project?.ownerId]);

  // Load channels and members for this project
  const loadChannelsAndMembers = useCallback(async () => {
    if (!project?.id) return;
    try {
      const [channelsRes, membersRes] = await Promise.allSettled([
        api.chat.getChannels(project.id),
        api.members.getMembers(project.id),
      ]);

      if (channelsRes.status === "fulfilled" && Array.isArray(channelsRes.value)) {
        const loadedChannels: Channel[] = channelsRes.value.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || "",
          isPrivate: !!c.isPrivate,
          unreadCount: 0,
          members: c.members || [],
          _count: c._count,
        }));
        setChannels(loadedChannels);

        // Auto select first channel if no active chat
        setActiveChat((prev) => {
          if (prev.id && (loadedChannels.some(c => c.id === prev.id) || prev.type === "dm")) {
            return prev;
          }
          if (loadedChannels.length > 0) {
            return { type: "channel", id: loadedChannels[0].id };
          }
          return { type: "channel", id: "" };
        });
      }

      if (membersRes.status === "fulfilled" && Array.isArray(membersRes.value)) {
        const mappedMembers: TeamMember[] = membersRes.value.map((m: any) => ({
          id: m.userId || m.id,
          name: m.name || m.user?.name || "Thành viên",
          role: m.roleGroup?.name || "DEV",
          status: "online",
          avatar: m.avatar || m.user?.avatar || (m.name ? m.name.slice(0, 2).toUpperCase() : "US"),
          email: m.email || m.user?.email || "",
        }));
        setMembers(mappedMembers);
      }
    } catch (err) {
      console.warn("Lỗi tải thông tin kênh và thành viên:", err);
    }
  }, [project?.id]);

  useEffect(() => {
    loadChannelsAndMembers();
  }, [loadChannelsAndMembers]);

  // Load members of the active channel
  const loadActiveChannelMembers = useCallback(async () => {
    if (activeChat.type !== "channel" || !activeChat.id) {
      setActiveChannelMembers([]);
      return;
    }
    try {
      const membersData = await api.chat.getChannelMembers(activeChat.id);
      if (Array.isArray(membersData)) {
        setActiveChannelMembers(membersData);
      }
    } catch {
      // Fallback to channel object members if available
      const current = channels.find((c) => c.id === activeChat.id);
      if (current?.members) {
        setActiveChannelMembers(current.members);
      }
    }
  }, [activeChat.id, activeChat.type, channels]);

  useEffect(() => {
    loadActiveChannelMembers();
  }, [loadActiveChannelMembers]);

  // Load messages and start polling every 2.5s for real-time live chat
  useEffect(() => {
    let isMounted = true;
    if (!activeChat.id) return;

    const fetchLiveMessages = async () => {
      try {
        if (activeChat.type === "channel") {
          const data = await api.chat.getMessages(activeChat.id);
          if (isMounted && Array.isArray(data)) {
            const mapped = data.map((m: any) => formatMessage(m));
            setChannelMessages((prev) => ({
              ...prev,
              [activeChat.id]: mapped,
            }));
          }
        } else if (activeChat.type === "dm" && project?.id) {
          const data = await api.chat.getDirectMessages(project.id, activeChat.id);
          if (isMounted && Array.isArray(data)) {
            const mapped = data.map((m: any) => formatMessage(m));
            setDmMessages((prev) => ({
              ...prev,
              [activeChat.id]: mapped,
            }));
          }
        }
      } catch {
        // Handled silently
      }
    };

    fetchLiveMessages();
    const timer = setInterval(fetchLiveMessages, 2500);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [activeChat.id, activeChat.type, project?.id, formatMessage]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages, dmMessages, activeChat]);

  // Active chat metadata
  const isChannel = activeChat.type === "channel";
  const currentChannel = isChannel 
    ? channels.find((c) => c.id === activeChat.id) || channels[0]
    : null;
  const currentMember = !isChannel
    ? members.find((m) => m.id === activeChat.id) || members[0]
    : null;

  const currentMessages = isChannel
    ? (channelMessages[activeChat.id] || [])
    : (dmMessages[activeChat.id] || []);

  const filteredMessages = currentMessages.filter((m) =>
    m.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Send message handler (both Channel & DM)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat.id) return;

    const trimmed = inputMessage.trim();
    setInputMessage("");

    // Optimistic message
    const tempId = "temp-" + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender: {
        id: user?.id,
        name: user?.name || "Bạn",
        role: user?.role === "owner" ? "Chủ dự án" : "Thành viên",
        avatar: user?.avatar || "QC",
        isCurrentUser: true,
      },
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
    };

    if (isChannel) {
      setChannelMessages((prev) => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), optimisticMsg],
      }));

      try {
        const saved = await api.chat.sendMessage(activeChat.id, { content: trimmed });
        if (saved && saved.id) {
          const realMsg = formatMessage(saved);
          setChannelMessages((prev) => ({
            ...prev,
            [activeChat.id]: (prev[activeChat.id] || []).map((m) =>
              m.id === tempId ? realMsg : m
            ),
          }));
        }
      } catch (err) {
        console.warn("Lỗi khi gửi tin nhắn vào kênh:", err);
      }
    } else {
      if (!project?.id) return;
      setDmMessages((prev) => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), optimisticMsg],
      }));

      try {
        const saved = await api.chat.sendDirectMessage(project.id, activeChat.id, { content: trimmed });
        if (saved && saved.id) {
          const realMsg = formatMessage(saved);
          setDmMessages((prev) => ({
            ...prev,
            [activeChat.id]: (prev[activeChat.id] || []).map((m) =>
              m.id === tempId ? realMsg : m
            ),
          }));
        }
      } catch (err) {
        console.warn("Lỗi khi gửi tin nhắn trực tiếp:", err);
      }
    }
  };

  // Create Channel Action
  const handleCreateChannel = async () => {
    if (!project?.id || !newChannelName.trim()) return;
    setChannelError("");
    setIsCreatingChannel(true);

    try {
      const created = await api.chat.createChannel(project.id, {
        name: newChannelName.trim(),
        description: newChannelDesc.trim(),
        isPrivate: isChannelPrivate,
        memberIds: selectedInitialMembers,
      });

      if (created) {
        const newChan: Channel = {
          id: created.id,
          name: created.name,
          description: created.description || "",
          isPrivate: !!created.isPrivate,
          unreadCount: 0,
          members: created.members || [],
          _count: created._count,
        };

        setChannels((prev) => [...prev, newChan]);
        setActiveChat({ type: "channel", id: newChan.id });
        setIsCreateChannelOpen(false);
        setNewChannelName("");
        setNewChannelDesc("");
        setIsChannelPrivate(false);
        setSelectedInitialMembers([]);
        await loadChannelsAndMembers();
      }
    } catch (err: any) {
      setChannelError(err?.message || "Không thể tạo kênh. Tên kênh có thể đã tồn tại.");
    } finally {
      setIsCreatingChannel(false);
    }
  };

  // Add Member to Current Channel Action
  const handleAddMemberToChannel = async () => {
    if (!activeChat.id || !selectedUserToAdd) return;
    setIsAddingMember(true);
    try {
      await api.chat.addChannelMember(activeChat.id, {
        userId: selectedUserToAdd,
        role: "MEMBER",
      });
      setIsAddMemberOpen(false);
      setSelectedUserToAdd("");
      await loadActiveChannelMembers();
      await loadChannelsAndMembers();
    } catch (err: any) {
      alert(err?.message || "Không thể thêm thành viên vào kênh.");
    } finally {
      setIsAddingMember(false);
    }
  };

  // Remove Member from Channel Action
  const handleRemoveMemberFromChannel = async (targetUserId: string, targetName: string) => {
    if (!activeChat.id) return;
    if (!confirm(`Bạn có chắc muốn xóa "${targetName}" khỏi kênh #${currentChannel?.name}?`)) {
      return;
    }
    try {
      await api.chat.removeChannelMember(activeChat.id, targetUserId);
      await loadActiveChannelMembers();
      await loadChannelsAndMembers();
    } catch (err: any) {
      alert(err?.message || "Không thể xóa thành viên khỏi kênh.");
    }
  };

  // Delete Channel Action
  const handleDeleteChannel = async () => {
    if (!project?.id || !currentChannel?.id) return;
    if (currentChannel.name === "chung") {
      alert("Không thể xóa kênh chung mặc định!");
      return;
    }
    setIsDeletingChannel(true);
    try {
      await api.chat.deleteChannel(project.id, currentChannel.id);
      setIsDeleteChannelOpen(false);
      
      // Remove channel from list and switch to 'chung'
      const remaining = channels.filter((c) => c.id !== currentChannel.id);
      setChannels(remaining);
      if (remaining.length > 0) {
        setActiveChat({ type: "channel", id: remaining[0].id });
      }
    } catch (err: any) {
      alert(err?.message || "Không thể xóa kênh.");
    } finally {
      setIsDeletingChannel(false);
    }
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    const updateList = (messagesList: Message[]) => {
      return messagesList.map((msg) => {
        if (msg.id !== msgId) return msg;

        const currentReaction = msg.reactions.find((r) => r.emoji === emoji);
        let newReactions = [...msg.reactions];

        if (currentReaction) {
          if (currentReaction.users.includes("me")) {
            const newUsers = currentReaction.users.filter((u) => u !== "me");
            if (newUsers.length === 0) {
              newReactions = newReactions.filter((r) => r.emoji !== emoji);
            } else {
              newReactions = newReactions.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count - 1, users: newUsers } : r
              );
            }
          } else {
            newReactions = newReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, "me"] } : r
            );
          }
        } else {
          newReactions.push({ emoji, count: 1, users: ["me"] });
        }

        return { ...msg, reactions: newReactions };
      });
    };

    if (isChannel) {
      setChannelMessages((prev) => ({
        ...prev,
        [activeChat.id]: updateList(prev[activeChat.id] || []),
      }));
    } else {
      setDmMessages((prev) => ({
        ...prev,
        [activeChat.id]: updateList(prev[activeChat.id] || []),
      }));
    }
  };

  // Non-channel members of project for "Add Member" modal
  const candidateMembersToAdd = members.filter(
    (m) => !activeChannelMembers.some((cm) => cm.userId === m.id || cm.user?.id === m.id)
  );

  return (
    <div className="flex h-full w-full min-h-0 overflow-hidden bg-background">
      {/* ============================================================== */}
      {/* 1. LEFT COLUMN: CHANNELS & DIRECT MESSAGES                     */}
      {/* ============================================================== */}
      <div className={`w-full md:w-64 border-r bg-slate-50/70 dark:bg-slate-900/40 flex-col shrink-0 select-none h-full min-h-0 overflow-hidden ${
        mobileTab === "list" ? "flex" : "hidden md:flex"
      }`}>
        {/* Header */}
        <div className="p-3.5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm tracking-tight">Kênh & Tin nhắn</span>
          </div>
          <Badge variant="outline" className="text-[11px] bg-background">Scrum Room</Badge>
        </div>

        {/* Scrollable list */}
        <ScrollArea className="flex-1 p-2">
          {/* SECTION 1: CHANNELS */}
          <div className="space-y-1 mb-5">
            <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Kênh Dự án ({channels.length})</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setChannelError("");
                  setIsCreateChannelOpen(true);
                }}
                className="h-5 w-5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-foreground"
                title="Tạo kênh mới"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {channels.map((channel) => {
              const isActive = activeChat.type === "channel" && activeChat.id === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setActiveChat({ type: "channel", id: channel.id });
                    setMobileTab("chat");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-foreground/80 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {channel.isPrivate ? (
                      <Lock className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary-foreground" : "text-amber-500"}`} />
                    ) : (
                      <Hash className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    )}
                    <span className="truncate">{channel.name}</span>
                  </div>
                  {channel.unreadCount && channel.unreadCount > 0 ? (
                    <Badge variant={isActive ? "secondary" : "default"} className="h-4.5 px-1.5 text-[10px]">
                      {channel.unreadCount}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* SECTION 2: DIRECT MESSAGES (CÁ NHÂN CHAT) */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Cá nhân chat ({members.length})</span>
              <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            {members.map((member) => {
              const isActive = activeChat.type === "dm" && activeChat.id === member.id;
              const isMe = member.id === user?.id || member.email === user?.email;
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    setActiveChat({ type: "dm", id: member.id });
                    setMobileTab("chat");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-foreground/80 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-7 w-7 text-[10px]">
                      <AvatarFallback className={isActive ? "bg-white/20 text-white" : ""}>
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ${
                        isActive ? "ring-primary" : "ring-background"
                      } ${
                        member.status === "online"
                          ? "bg-emerald-500"
                          : member.status === "busy"
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate leading-tight">
                      {member.name} {isMe ? "(Bạn)" : ""}
                    </div>
                    <div className={`text-[10px] truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {member.role}
                    </div>
                  </div>
                  {member.unreadCount && member.unreadCount > 0 ? (
                    <Badge variant={isActive ? "secondary" : "default"} className="h-4.5 px-1.5 text-[10px]">
                      {member.unreadCount}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* ============================================================== */}
      {/* 2. CHAT MAIN AREA                                             */}
      {/* ============================================================== */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden bg-background ${
        mobileTab === "chat" ? "flex" : "hidden md:flex"
      }`}>
        {/* Top Header */}
        <div className="h-14 border-b px-3 sm:px-5 flex items-center justify-between bg-card/50 backdrop-blur-xs shrink-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileTab("list")}
            className="md:hidden h-8 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0 -ml-1 mr-1 gap-1 rounded-lg"
            title="Quay lại danh sách kênh & cá nhân"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-[11px] font-medium">Kênh</span>
          </Button>

          {isChannel ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-muted text-foreground">
                {currentChannel?.isPrivate ? (
                  <Lock className="h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <Hash className="h-4 w-4 shrink-0 text-primary" />
                )}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm leading-tight truncate">#{currentChannel?.name || "chung"}</span>
                  {currentChannel?.isPrivate && (
                    <Badge variant="outline" className="text-[10px] h-4 text-amber-600 border-amber-300">Riêng tư</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{currentChannel?.description || "Kênh trao đổi dự án"}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8 text-xs font-bold">
                  <AvatarFallback className="bg-primary/10 text-primary">{currentMember?.avatar}</AvatarFallback>
                </Avatar>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background ${
                    currentMember?.status === "online"
                      ? "bg-emerald-500"
                      : currentMember?.status === "busy"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm leading-tight truncate">{currentMember?.name}</span>
                  <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 py-0 font-normal">
                    {currentMember?.role}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                  <Circle className={`h-1.5 w-1.5 ${
                    currentMember?.status === "online" 
                      ? "fill-emerald-500 text-emerald-500" 
                      : currentMember?.status === "busy" 
                      ? "fill-amber-500 text-amber-500" 
                      : "fill-slate-400 text-slate-400"
                  }`} />
                  {currentMember?.status === "online" ? "Đang trực tuyến" : currentMember?.status === "busy" ? "Đang bận" : "Ngoại tuyến"}
                  <span className="text-muted-foreground/60">•</span>
                  <span>{currentMember?.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-48 hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm tin nhắn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs bg-slate-50 dark:bg-slate-900 rounded-lg"
              />
            </div>
            
            {!isChannel && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Gọi thoại">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Gọi video">
                  <Video className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${showRightSidebar ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              title={isChannel ? "Thông tin & Thành viên kênh" : "Thông tin cá nhân"}
            >
              {isChannel ? <Users className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <ScrollArea className="h-full w-full p-4 sm:p-5">
            <div className="space-y-4 max-w-4xl mx-auto pb-2">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
                <p>Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
                <p className="text-xs text-muted-foreground/70">Hãy là người đầu tiên gửi tin nhắn chào mọi người!</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex items-center gap-3 py-2">
                      <div className="h-[1px] flex-1 bg-border" />
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs">
                        <Bell className="h-3 w-3 text-primary" />
                        <span>{msg.content}</span>
                        <span className="text-[10px] text-muted-foreground">({msg.timestamp})</span>
                      </div>
                      <div className="h-[1px] flex-1 bg-border" />
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 group ${
                      msg.sender.isCurrentUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[11px] font-semibold">{msg.sender.avatar}</AvatarFallback>
                    </Avatar>

                    <div
                      className={`flex flex-col max-w-[75%] ${
                        msg.sender.isCurrentUser ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender Info */}
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-semibold">{msg.sender.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 font-normal">
                          {msg.sender.role}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                          msg.sender.isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-tr-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-foreground rounded-tl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* Attachment */}
                        {msg.attachment && (
                          <div className="mt-2.5 p-2 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-between gap-3 text-xs border border-white/10">
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate font-medium">{msg.attachment.name}</span>
                            </div>
                            <span className="text-[10px] opacity-80 shrink-0 font-mono">{msg.attachment.size}</span>
                          </div>
                        )}
                      </div>

                      {/* Reactions & Actions */}
                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        {msg.reactions.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => handleToggleReaction(msg.id, r.emoji)}
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                              r.users.includes("me")
                                ? "bg-primary/10 border-primary text-primary font-medium"
                                : "bg-card border-border hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span>{r.emoji}</span>
                            <span className="text-[10px]">{r.count}</span>
                          </button>
                        ))}

                        {/* Quick Reaction Buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                          {["👍", "❤️", "🚀", "🔥"].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className="text-xs hover:scale-125 transition-transform p-0.5"
                              title={`Thả cảm xúc ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          </ScrollArea>
        </div>

        {/* Message Input Box */}
        <div className="p-3.5 border-t bg-card/80 backdrop-blur-xs shrink-0 z-10 mt-auto">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Input
                placeholder={
                  isChannel
                    ? `Nhắn tin vào #${currentChannel?.name || "kênh"}...`
                    : `Nhắn tin riêng cho ${currentMember?.name || "thành viên"}...`
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="pr-20 py-5 text-sm bg-slate-50/70 dark:bg-slate-900/60 focus-visible:ring-primary rounded-xl"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Đính kèm tệp"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Biểu tượng cảm xúc"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10 shrink-0 rounded-xl shadow-sm" 
              disabled={!inputMessage.trim() || !activeChat.id}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1.5 mt-2">
            <span>Nhấn <strong>Enter</strong> để gửi tin nhắn</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse" />
              Kết nối Live Database đang hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. RIGHT SIDEBAR: CONTEXTUAL INFO & MEMBER MANAGEMENT          */}
      {/* ============================================================== */}
      {showRightSidebar && (
        <div className="w-72 border-l bg-slate-50/50 dark:bg-slate-900/30 p-4 hidden xl:flex flex-col shrink-0 select-none h-full min-h-0 overflow-y-auto">
          {isChannel ? (
            <>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Thông tin kênh
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-card border shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {currentChannel?.isPrivate ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Hash className="h-4 w-4 text-primary" />}
                      #{currentChannel?.name}
                    </div>
                    {currentChannel?.name !== "chung" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                        onClick={() => setIsDeleteChannelOpen(true)}
                        title="Xóa kênh này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{currentChannel?.description || "Không có mô tả"}</p>
                </div>

                {/* SPRINT PIN */}
                <div className="p-3 rounded-xl bg-card border shadow-2xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Pin className="h-3.5 w-3.5 text-primary" />
                    <span>Ghim Scrum</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Kênh trao đổi chính thức của dự án. Mọi thông báo và cập nhật tiến độ đều được lưu trữ tại đây.
                  </p>
                </div>

                {/* CHANNEL MEMBERS MANAGEMENT */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Thành viên kênh ({activeChannelMembers.length})
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddMemberOpen(true)}
                      className="h-6 px-2 text-[11px] text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-md"
                    >
                      <UserPlus className="h-3 w-3" />
                      Thêm
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    {activeChannelMembers.map((cm) => {
                      const isOwner = cm.userId === project?.ownerId;
                      const isAdmin = cm.role === "ADMIN" || isOwner;
                      const isMe = cm.userId === user?.id || cm.user?.email === user?.email;
                      return (
                        <div key={cm.id || cm.userId} className="flex items-center justify-between p-2 rounded-lg bg-card/60 border text-xs group hover:bg-card transition-colors">
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <Avatar className="h-6 w-6 text-[10px] shrink-0">
                              <AvatarFallback>{cm.user?.avatar || (cm.user?.name ? cm.user.name.slice(0, 2).toUpperCase() : "US")}</AvatarFallback>
                            </Avatar>
                            <div className="truncate">
                              <div className="font-medium truncate flex items-center gap-1">
                                <span>{cm.user?.name || "Thành viên"}</span>
                                {isMe && <span className="text-[10px] text-muted-foreground font-normal">(Bạn)</span>}
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate">{cm.user?.email}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {isAdmin ? (
                              <Badge variant="secondary" className="text-[9px] h-4 px-1 py-0 bg-primary/10 text-primary border-0">
                                <Shield className="h-2.5 w-2.5 mr-0.5" />
                                Admin
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Thành viên</span>
                            )}
                            
                            {/* Remove member button (only if not project owner and not deleting oneself if owner) */}
                            {!isOwner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-sm transition-opacity"
                                onClick={() => handleRemoveMemberFromChannel(cm.userId, cm.user?.name || "thành viên")}
                                title="Xóa khỏi kênh"
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Hồ sơ cá nhân
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border shadow-2xs mb-3">
                <div className="relative mb-2">
                  <Avatar className="h-16 w-16 text-lg font-bold">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentMember?.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-4 w-4 rounded-full ring-2 ring-card ${
                      currentMember?.status === "online"
                        ? "bg-emerald-500"
                        : currentMember?.status === "busy"
                        ? "bg-amber-500"
                        : "bg-slate-400"
                    }`}
                  />
                </div>
                <div className="font-bold text-sm">{currentMember?.name}</div>
                <Badge variant="outline" className="text-[10px] mt-1 mb-2">
                  {currentMember?.role}
                </Badge>
                <div className="text-xs text-muted-foreground">{currentMember?.email}</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-card border shadow-2xs">
                  <div className="text-muted-foreground font-medium mb-1">Trạng thái làm việc</div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Circle className={`h-2 w-2 ${
                      currentMember?.status === "online" 
                        ? "fill-emerald-500 text-emerald-500" 
                        : currentMember?.status === "busy" 
                        ? "fill-amber-500 text-amber-500" 
                        : "fill-slate-400 text-slate-400"
                    }`} />
                    {currentMember?.status === "online" ? "Sẵn sàng nhận việc" : currentMember?.status === "busy" ? "Đang tập trung Sprint" : "Offline"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border shadow-2xs">
                  <div className="text-muted-foreground font-medium mb-1">Quyền hạn trong dự án</div>
                  <div className="font-semibold text-primary">
                    {currentMember?.id === project?.ownerId ? "Project Owner (Toàn quyền)" : "Thành viên cộng tác"}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* DIALOG 1: TẠO KÊNH THẢO LUẬN MỚI                               */}
      {/* ============================================================== */}
      <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Hash className="h-5 w-5 text-primary" />
              Tạo kênh thảo luận mới
            </DialogTitle>
            <DialogDescription className="text-xs">
              Kênh là không gian trò chuyện tập trung theo tính năng, chủ đề hoặc nhóm công việc trong dự án.
            </DialogDescription>
          </DialogHeader>

          {channelError && (
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{channelError}</span>
            </div>
          )}

          <div className="space-y-3.5 py-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Tên kênh <span className="text-destructive">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">#</span>
                <Input
                  value={newChannelName}
                  onChange={(e) => {
                    setChannelError("");
                    setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  placeholder="ten-kenh-moi (vd: design-ui, dev-backend, bugs)"
                  className="pl-7 text-xs h-9 font-medium"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Tên viết thường không dấu, dùng dấu gạch ngang phân cách.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Mô tả kênh (tùy chọn)</label>
              <Input
                value={newChannelDesc}
                onChange={(e) => setNewChannelDesc(e.target.value)}
                placeholder="Mục đích của kênh thảo luận này..."
                className="text-xs h-9"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1 pb-1">
              <Checkbox
                id="isPrivate"
                checked={isChannelPrivate}
                onCheckedChange={(checked) => setIsChannelPrivate(!!checked)}
              />
              <label htmlFor="isPrivate" className="text-xs font-medium cursor-pointer leading-tight">
                Đặt làm kênh riêng tư (Chỉ thành viên được mời mới nhìn thấy kênh)
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Chọn thành viên tham gia kênh</label>
              <div className="max-h-36 overflow-y-auto space-y-1 border rounded-lg p-2 bg-slate-50/50 dark:bg-slate-900/50">
                {members.map((m) => {
                  const isSelected = selectedInitialMembers.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedInitialMembers((prev) =>
                          isSelected ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                        );
                      }}
                      className={`flex items-center justify-between p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10 font-medium" : "hover:bg-slate-200/50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Avatar className="h-5 w-5 text-[9px] shrink-0"><AvatarFallback>{m.avatar}</AvatarFallback></Avatar>
                        <span className="truncate">{m.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate">({m.email})</span>
                      </div>
                      <Checkbox checked={isSelected} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsCreateChannelOpen(false)}>
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleCreateChannel}
              disabled={!newChannelName.trim() || isCreatingChannel}
            >
              {isCreatingChannel ? "Đang tạo kênh..." : "Tạo kênh"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* DIALOG 2: THÊM THÀNH VIÊN VÀO KÊNH                             */}
      {/* ============================================================== */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5 text-primary" />
              Thêm thành viên vào kênh #{currentChannel?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Chọn một thành viên từ dự án để thêm vào kênh trò chuyện này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {candidateMembersToAdd.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Tất cả thành viên trong dự án hiện đã tham gia kênh này rồi.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-1.5 border rounded-lg p-2 bg-slate-50/50 dark:bg-slate-900/50">
                {candidateMembersToAdd.map((m) => {
                  const isSelected = selectedUserToAdd === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedUserToAdd(m.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary font-medium" 
                          : "bg-card border-border hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Avatar className="h-6 w-6 text-[10px] shrink-0">
                          <AvatarFallback className={isSelected ? "bg-white/20 text-white" : ""}>
                            {m.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="truncate">
                          <div className="font-medium truncate">{m.name}</div>
                          <div className={`text-[10px] truncate ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {m.email}
                          </div>
                        </div>
                      </div>
                      <Badge variant={isSelected ? "secondary" : "outline"} className="text-[10px]">
                        {m.role}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsAddMemberOpen(false)}>
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleAddMemberToChannel}
              disabled={!selectedUserToAdd || isAddingMember}
            >
              {isAddingMember ? "Đang thêm..." : "Thêm vào kênh"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* DIALOG 3: XÁC NHẬN XÓA KÊNH                                    */}
      {/* ============================================================== */}
      <Dialog open={isDeleteChannelOpen} onOpenChange={setIsDeleteChannelOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-destructive">
              <Trash2 className="h-5 w-5 text-destructive" />
              Xóa kênh #{currentChannel?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Hành động này sẽ xóa vĩnh viễn kênh này cùng toàn bộ lịch sử tin nhắn trong kênh. Thao tác không thể hoàn tác!
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteChannelOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteChannel}
              disabled={isDeletingChannel}
            >
              {isDeletingChannel ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
