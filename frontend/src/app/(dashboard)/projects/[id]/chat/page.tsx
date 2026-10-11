"use client";

import React, { useState } from "react";
import { 
  Hash, 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  Users, 
  Bell, 
  Pin, 
  MoreVertical, 
  Check, 
  Circle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const initialChannels: Channel[] = [
  { id: "general", name: "chung", description: "Kênh thảo luận chung cho toàn bộ dự án", unreadCount: 0 },
  { id: "dev", name: "phat-trien", description: "Thảo luận kỹ thuật, PR, backend và frontend", unreadCount: 2 },
  { id: "sprint-1", name: "sprint-1-goals", description: "Bàn luận mục tiêu và tiến độ Sprint 1", unreadCount: 0 },
  { id: "announcements", name: "thong-bao", description: "Thông báo chính thức từ Product Owner & Scrum Master", unreadCount: 1 },
];

const teamMembers = [
  { id: "u1", name: "Trịnh Quyết Chiến", role: "Product Owner", status: "online", avatar: "QC" },
  { id: "u2", name: "Nguyễn Văn An", role: "Scrum Master", status: "online", avatar: "VA" },
  { id: "u3", name: "Trần Thị Bình", role: "Senior Dev", status: "busy", avatar: "TB" },
  { id: "u4", name: "Lê Hoàng Dũng", role: "Frontend Dev", status: "offline", avatar: "HD" },
  { id: "u5", name: "Phạm Minh Trang", role: "QA Engineer", status: "online", avatar: "MT" },
];

const initialMessages: Record<string, Message[]> = {
  general: [
    {
      id: "m1",
      sender: { name: "Hệ thống", role: "BOT", avatar: "BOT" },
      content: "Sprint 1 đã chính thức bắt đầu với 14 User Stories được chọn vào Backlog.",
      timestamp: "09:00",
      reactions: [{ emoji: "🚀", count: 4, users: ["u1", "u2", "u3", "u5"] }],
      isSystem: true,
    },
    {
      id: "m2",
      sender: { name: "Trịnh Quyết Chiến", role: "Product Owner", avatar: "QC", isCurrentUser: true },
      content: "Chào cả team! Mục tiêu tuần này là hoàn thiện luồng Xác thực JWT và Bảng Scrum kéo thả nhé.",
      timestamp: "09:05",
      reactions: [
        { emoji: "👍", count: 3, users: ["u2", "u3", "u5"] },
        { emoji: "🔥", count: 2, users: ["u2", "u4"] },
      ],
    },
    {
      id: "m3",
      sender: { name: "Nguyễn Văn An", role: "Scrum Master", avatar: "VA" },
      content: "Daily Scrum sẽ diễn ra vào 9:30 hàng ngày trên Google Meet. Các bạn chuẩn bị cập nhật 3 câu hỏi nhé!",
      timestamp: "09:12",
      reactions: [{ emoji: "🙌", count: 3, users: ["u1", "u3", "u4"] }],
    },
    {
      id: "m4",
      sender: { name: "Trần Thị Bình", role: "Senior Dev", avatar: "TB" },
      content: "API specs cho module Auth và Projects đã cập nhật xong trên Swagger. Mọi người có thể xem tài liệu đính kèm bên dưới:",
      timestamp: "09:20",
      reactions: [{ emoji: "❤️", count: 2, users: ["u1", "u4"] }],
      attachment: { name: "API_Swagger_v1.1.pdf", size: "1.4 MB", type: "pdf" },
    },
  ],
  dev: [
    {
      id: "d1",
      sender: { name: "Lê Hoàng Dũng", role: "Frontend Dev", avatar: "HD" },
      content: "Phần UI phân quyền nhóm và cấp quyền tab đã chạy mượt trên Next.js 15 rồi nhé!",
      timestamp: "10:15",
      reactions: [{ emoji: "🎉", count: 3, users: ["u1", "u2", "u3"] }],
    },
    {
      id: "d2",
      sender: { name: "Trần Thị Bình", role: "Senior Dev", avatar: "TB" },
      content: "Nhớ dùng TanStack Query để cache permissions ở frontend nhé, tránh fetch lặp lại nhiều lần.",
      timestamp: "10:18",
      reactions: [{ emoji: "👌", count: 2, users: ["u4", "u1"] }],
    },
  ],
  "sprint-1": [
    {
      id: "s1",
      sender: { name: "Nguyễn Văn An", role: "Scrum Master", avatar: "VA" },
      content: "Burndown chart hôm nay đang đi đúng tiến độ. Cố gắng giữ velocity 28 points nhé mọi người!",
      timestamp: "08:45",
      reactions: [{ emoji: "💪", count: 4, users: ["u1", "u2", "u3", "u4"] }],
    },
  ],
  announcements: [
    {
      id: "a1",
      sender: { name: "Trịnh Quyết Chiến", role: "Product Owner", avatar: "QC", isCurrentUser: true },
      content: "📢 Dự kiến Demo Sprint Review vào chiều thứ Sáu lúc 15:30. Khách hàng sẽ tham gia để nghiệm thu luồng Quản lý Dự án.",
      timestamp: "08:00",
      reactions: [{ emoji: "👀", count: 5, users: ["u1", "u2", "u3", "u4", "u5"] }],
    },
  ],
};

export default function ProjectChatPage() {
  const [channels] = useState<Channel[]>(initialChannels);
  const [currentChannelId, setCurrentChannelId] = useState<string>("general");
  const [messagesState, setMessagesState] = useState<Record<string, Message[]>>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMembers, setShowMembers] = useState(true);

  const currentChannel = channels.find((c) => c.id === currentChannelId) || channels[0];
  const channelMessages = messagesState[currentChannelId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: Message = {
      id: "msg-" + Date.now(),
      sender: {
        name: "Trịnh Quyết Chiến",
        role: "Product Owner",
        avatar: "QC",
        isCurrentUser: true,
      },
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
    };

    setMessagesState((prev) => ({
      ...prev,
      [currentChannelId]: [...(prev[currentChannelId] || []), newMsg],
    }));

    setInputMessage("");
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessagesState((prev) => {
      const channelMsgs = prev[currentChannelId] || [];
      const updated = channelMsgs.map((msg) => {
        if (msg.id !== msgId) return msg;

        const currentReaction = msg.reactions.find((r) => r.emoji === emoji);
        let newReactions = [...msg.reactions];

        if (currentReaction) {
          if (currentReaction.users.includes("me")) {
            // Remove user reaction
            const newUsers = currentReaction.users.filter((u) => u !== "me");
            if (newUsers.length === 0) {
              newReactions = newReactions.filter((r) => r.emoji !== emoji);
            } else {
              newReactions = newReactions.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count - 1, users: newUsers } : r
              );
            }
          } else {
            // Add user reaction
            newReactions = newReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, "me"] } : r
            );
          }
        } else {
          newReactions.push({ emoji, count: 1, users: ["me"] });
        }

        return { ...msg, reactions: newReactions };
      });

      return { ...prev, [currentChannelId]: updated };
    });
  };

  const filteredMessages = channelMessages.filter((m) =>
    m.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[550px] border rounded-xl overflow-hidden bg-background shadow-sm">
      {/* 1. Left Sidebar: Channels & Direct Messages */}
      <div className="w-64 border-r bg-slate-50/60 dark:bg-slate-900/40 flex flex-col shrink-0">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Kênh trao đổi nhóm</span>
          </div>
          <Badge variant="outline" className="text-xs">Scrum Room</Badge>
        </div>

        <ScrollArea className="flex-1 p-2">
          {/* Channels Section */}
          <div className="space-y-1 mb-4">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Kênh Dự án
            </div>
            {channels.map((channel) => {
              const isActive = channel.id === currentChannelId;
              return (
                <button
                  key={channel.id}
                  onClick={() => setCurrentChannelId(channel.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-slate-400"}`} />
                    <span className="truncate">{channel.name}</span>
                  </div>
                  {channel.unreadCount && channel.unreadCount > 0 ? (
                    <Badge variant={isActive ? "secondary" : "default"} className="h-5 px-1.5 text-xs">
                      {channel.unreadCount}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Members / Online Status */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Thành viên ({teamMembers.length})</span>
            </div>
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <div className="relative">
                  <Avatar className="h-6 w-6 text-[10px]">
                    <AvatarFallback>{member.avatar}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-background ${
                      member.status === "online"
                        ? "bg-emerald-500"
                        : member.status === "busy"
                        ? "bg-amber-500"
                        : "bg-slate-400"
                    }`}
                  />
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-medium truncate">{member.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 2. Chat Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header */}
        <div className="h-14 border-b px-4 flex items-center justify-between bg-card/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <Hash className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-sm leading-tight truncate">{currentChannel.name}</div>
              <div className="text-xs text-muted-foreground truncate">{currentChannel.description}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-44 hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm tin nhắn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500"
              onClick={() => setShowMembers(!showMembers)}
              title="Danh sách thành viên"
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Message Feed */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Chưa có tin nhắn nào trong kênh này. Hãy là người đầu tiên bắt đầu cuộc trò chuyện!
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
                      <AvatarFallback>{msg.sender.avatar}</AvatarFallback>
                    </Avatar>

                    <div
                      className={`flex flex-col max-w-[75%] ${
                        msg.sender.isCurrentUser ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender Info */}
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-semibold">{msg.sender.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">
                          {msg.sender.role}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          msg.sender.isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-tr-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-foreground rounded-tl-xs"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                        {/* Attachment */}
                        {msg.attachment && (
                          <div className="mt-2.5 p-2 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate font-medium">{msg.attachment.name}</span>
                            </div>
                            <span className="text-[10px] opacity-80 shrink-0">{msg.attachment.size}</span>
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
          </div>
        </ScrollArea>

        {/* Message Input Box */}
        <div className="p-3 border-t bg-card/30">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder={`Nhắn tin vào #${currentChannel.name}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="pr-20 py-5 text-sm bg-slate-50/70 dark:bg-slate-900/60 focus-visible:ring-primary"
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
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 mt-1.5">
            <span>Nhấn <strong>Enter</strong> để gửi tin nhắn</span>
            <span className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
              Kết nối Real-time đang hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* 3. Right Sidebar: Channel Info & Pinned items */}
      {showMembers && (
        <div className="w-56 border-l bg-slate-50/40 dark:bg-slate-900/20 p-3 hidden lg:flex flex-col shrink-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Thông tin kênh
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-card border">
              <div className="font-semibold text-sm mb-1">#{currentChannel.name}</div>
              <p className="text-muted-foreground">{currentChannel.description}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-card border space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <Pin className="h-3.5 w-3.5 text-primary" />
                <span>Ghim Sprint 1</span>
              </div>
              <p className="text-muted-foreground">
                Sprint 1 dự kiến kết thúc vào ngày 24/10/2026. Tất cả PR cần merge trước 12:00 thứ Năm.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
