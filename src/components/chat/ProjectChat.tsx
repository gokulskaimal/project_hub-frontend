import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { Send, Paperclip, MoreVertical, Trash2, Edit2, X, Check } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/utils/api";

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    type: 'TEXT' | 'FILE';
    fileUrl?: string;
}

interface ProjectChatProps {
    projectId: string;
}

export default function ProjectChat({ projectId }: ProjectChatProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const { socket } = useSocket();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chat/${projectId}`);
                if (res.data.success) {
                    setMessages(res.data.data);
                    scrollToBottom();
                }
            } catch (err) {
                console.error("Failed to load chat", err);
            }
        };
        fetchMessages();
    }, [projectId]);

    useEffect(() => {
        if (!socket) return;
        
        socket.emit("join-project", projectId);

        const handleMessage = (msg: ChatMessage) => {
             setMessages((prev) => [...prev, msg]);
             scrollToBottom();
        };

        const handleUpdate = (updatedMsg: ChatMessage) => {
            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        };

        const handleDelete = ({ messageId }: { messageId: string }) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
        };

        socket.on("chat:message", handleMessage);
        socket.on("chat:updated", handleUpdate);
        socket.on("chat:deleted", handleDelete);

        return () => {
            socket.off("chat:message", handleMessage);
            socket.off("chat:updated", handleUpdate);
            socket.off("chat:deleted", handleDelete);
            socket.emit("leave-project", projectId);
        };
    }, [socket, projectId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.post(`/chat/${projectId}`, {
                content: newMessage,
                type: 'TEXT'
            });
            setNewMessage("");
        } catch (err) {
            console.error("Failed to send", err);
        }
    };

    const handleEditClick = (msg: ChatMessage) => {
        setEditingId(msg.id);
        setEditContent(msg.content);
    };

    const handleSaveEdit = async (messageId: string) => {
        try {
            await api.put(`/chat/${messageId}`, { content: editContent });
            setEditingId(null);
        } catch (err) {
            console.error("Failed to edit", err);
        }
    };

    const handleDelete = async (messageId: string) => {
        if (!confirm("Delete this message?")) return;
        try {
            await api.delete(`/chat/${messageId}`);
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Team Chat</h3>
                <span className="text-xs text-gray-400">Live</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.id;
                    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4 group`}>
                            <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`relative px-4 py-2 shadow-sm ${
                                    isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none'
                                }`}>
                                    {!isMe && <p className="text-[10px] font-bold text-gray-500 mb-1">{msg.senderName}</p>}

                                    {editingId === msg.id ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                value={editContent} 
                                                onChange={e => setEditContent(e.target.value)}
                                                className="text-black text-sm px-2 py-1 rounded border border-gray-300 outline-none"
                                                autoFocus
                                            />
                                            <button onClick={() => handleSaveEdit(msg.id)} className="p-1 hover:bg-green-100 rounded-full text-green-600"><Check size={14} /></button>
                                            <button onClick={() => setEditingId(null)} className="p-1 hover:bg-red-100 rounded-full text-red-600"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <p className="text-sm break-words">{msg.content}</p>
                                    )}

                                    <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {time}
                                    </div>
                                </div>

                                {isMe && !editingId && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                        {(new Date().getTime() - new Date(msg.createdAt).getTime() < 5 * 60 * 1000) && (
                                            <>
                                                <button onClick={() => handleEditClick(msg)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                                    <Edit2 size={12} />
                                                </button>
                                                <button onClick={() => handleDelete(msg.id)} className="p-1 hover:bg-red-50 rounded text-red-500">
                                                    <Trash2 size={12} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <Paperclip className="w-5 h-5" />
                </button>
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border-0 rounded-full px-4 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 placeholder:text-gray-400"
                />
                <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    )
}