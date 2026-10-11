"use client";

import React, { useState, useRef, useEffect } from "react";
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
  User,
  MessageCircle,
  FileText,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProject } from "../project-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface Message {
  id: string;
  sender: {
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

interface Channel {
  id: string;
  name: string;
  description: string;
  unreadCount?: number;
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
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChatTarget>({ type: "channel", id: "" });
  const [mobileTab, setMobileTab] = useState<"list" | "chat">("chat");
  
  const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({});
  const [dmMessages, setDmMessages] = useState<Record<string, Message[]>>({});
  
  const [inputMessage, setInputMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync channels and team members from PostgreSQL database
  useEffect(() => {
    let isMounted = true;
    const loadChatData = async () => {
      if (!project?.id) return;
      try {
        const [channelsRes, membersRes] = await Promise.allSettled([
          api.chat.getChannels(project.id),
          api.members.getMembers(project.id),
        ]);

        if (isMounted && channelsRes.status === "fulfilled" && Array.isArray(channelsRes.value)) {
          const mappedChannels: Channel[] = channelsRes.value.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description || "",
            unreadCount: 0,
          }));
          setChannels(mappedChannels);
          if (mappedChannels.length > 0) {
            setActiveChat((prev) => (prev.id ? prev : { type: "channel", id: mappedChannels[0].id }));
          }
        }

        if (isMounted && membersRes.status === "fulfilled" && Array.isArray(membersRes.value)) {
          const mappedMembers: TeamMember[] = membersRes.value.map((m: any) => ({
            id: m.userId || m.id,
            name: m.name || m.user?.name || "Thành viên",
            role: m.roleGroup?.name || "DEV",
            status: "online",
            avatar: m.avatar || m.user?.avatar || (m.name?.includes("Chiến") ? "QC" : m.name?.includes("An") ? "VA" : "US"),
            email: m.email || m.user?.email || "",
          }));
          setMembers(mappedMembers);
        }
      } catch (err) {
        // Backend error handled cleanly
      }
    };

    loadChatData();
    return () => {
      isMounted = false;
    };
  }, [project?.id]);

  // Load live messages for the active channel
  useEffect(() => {
    let isMounted = true;
    if (activeChat.type !== "channel" || !activeChat.id) return;

    const loadMessages = async () => {
      try {
        const data = await api.chat.getMessages(activeChat.id);
        if (isMounted && Array.isArray(data)) {
          const mapped: Message[] = data.map((m: any) => ({
            id: m.id,
            sender: {
              name: m.user?.name || "Thành viên",
              role: m.user?.id === project?.ownerId ? "Product Owner" : "Dev",
              avatar: m.user?.avatar || (m.user?.name?.includes("Chiến") ? "QC" : m.user?.name?.includes("An") ? "VA" : "US"),
              isCurrentUser: m.user?.id === user?.id || m.user?.email === user?.email,
            },
            content: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            reactions: Array.isArray(m.reactions) ? m.reactions : [],
            attachment: m.attachment ? { name: m.attachment, size: "1.2 MB", type: "file" } : undefined,
          }));

          setChannelMessages((prev) => ({
            ...prev,
            [activeChat.id]: mapped,
          }));
        }
      } catch {}
    };

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [activeChat.id, activeChat.type, project?.ownerId, user?.id, user?.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages, dmMessages, activeChat]);

  // Determine current active chat metadata
  const isChannel = activeChat.type === "channel";
  const currentChannel = isChannel 
    ? channels.find((c) => c.id === activeChat.id) || channels[0]
    : null;
  const currentMember = !isChannel
    ? members.find((m) => m.id === activeChat.id) || members[0]
    : null;

  // Messages for active chat
  const currentMessages = isChannel
    ? (channelMessages[activeChat.id] || [])
    : (dmMessages[activeChat.id] || []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const trimmed = inputMessage.trim();
    const newMsg: Message = {
      id: "msg-" + Date.now(),
      sender: {
        name: user?.name || "Trịnh Quyết Chiến",
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
        [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
      }));

      // Send to backend API
      try {
        await api.chat.sendMessage(activeChat.id, { content: trimmed });
      } catch (err) {
        console.warn("Lỗi khi gửi tin nhắn lên server:", err);
      }
    } else {
      setDmMessages((prev) => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
      }));
    }

    setInputMessage("");
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

  const filteredMessages = currentMessages.filter((m) =>
    m.content.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <Hash className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
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
                    <div className="font-medium truncate leading-tight">{member.name}</div>
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
          {/* Back button on mobile to return to Channel/DM list */}
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
                <Hash className="h-4 w-4 shrink-0 text-primary" />
              </div>
              <div className="truncate">
                <div className="font-bold text-sm leading-tight truncate">#{currentChannel?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{currentChannel?.description}</div>
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
                  {currentMember?.status === "online" ? "Đang trực tuyến" : currentMember?.status === "busy" ? "Đang bận họp" : "Ngoại tuyến"}
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
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Gọi thoại thoại">
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
              title={isChannel ? "Thông tin kênh" : "Thông tin cá nhân"}
            >
              {isChannel ? <Users className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Message Feed (Pinned scrollable area) */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <ScrollArea className="h-full w-full p-4 sm:p-5">
            <div className="space-y-4 max-w-4xl mx-auto pb-2">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
                <p>Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
                <p className="text-xs text-muted-foreground/70">Hãy là người đầu tiên bắt đầu cuộc trò chuyện!</p>
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

        {/* Message Input Box (Pinned permanently to bottom) */}
        <div className="p-3.5 border-t bg-card/80 backdrop-blur-xs shrink-0 z-10 mt-auto">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Input
                placeholder={
                  isChannel
                    ? `Nhắn tin vào #${currentChannel?.name}...`
                    : `Nhắn tin riêng cho ${currentMember?.name}...`
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
              disabled={!inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1.5 mt-2">
            <span>Nhấn <strong>Enter</strong> để gửi tin nhắn</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse" />
              Kết nối Real-time đang hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. RIGHT SIDEBAR: CONTEXTUAL INFO                              */}
      {/* ============================================================== */}
      {showRightSidebar && (
        <div className="w-64 border-l bg-slate-50/50 dark:bg-slate-900/30 p-4 hidden xl:flex flex-col shrink-0 select-none h-full min-h-0 overflow-y-auto">
          {isChannel ? (
            <>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Thông tin kênh
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-card border shadow-2xs space-y-1.5">
                  <div className="font-bold text-sm text-foreground">#{currentChannel?.name}</div>
                  <p className="text-muted-foreground leading-relaxed">{currentChannel?.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-card border shadow-2xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Pin className="h-3.5 w-3.5 text-primary" />
                    <span>Ghim Sprint 1</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Sprint 1 dự kiến kết thúc vào 24/10/2026. Tất cả PR cần merge trước 12:00 thứ Năm để QA nghiệm thu.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Thành viên kênh ({members.length + 1})
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 p-1.5 rounded-lg text-xs">
                      <Avatar className="h-5 w-5 text-[9px]"><AvatarFallback>{user?.avatar || "QC"}</AvatarFallback></Avatar>
                      <span className="font-medium truncate">{user?.name || "Bạn"} (Bạn)</span>
                    </div>
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 p-1.5 rounded-lg text-xs">
                        <Avatar className="h-5 w-5 text-[9px]"><AvatarFallback>{m.avatar}</AvatarFallback></Avatar>
                        <span className="truncate">{m.name}</span>
                      </div>
                    ))}
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
                  <div className="text-muted-foreground font-medium mb-1">Tài liệu chia sẻ</div>
                  <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">2 tệp đính kèm gần đây</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
