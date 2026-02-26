import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Paperclip, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExternalBlob } from "@/backend";
import { useSendMessage } from "@/hooks/useQueries";

interface LocalMessage {
  id: string;
  senderName: string;
  message: string;
  imageUrl?: string;
  timestamp: Date;
  isOwn: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState<string>(() => {
    return localStorage.getItem("castle_imperior_chat_name") || "";
  });
  const [nameInput, setNameInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: sendMessage, isPending } = useSendMessage();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  const handleSaveName = () => {
    const name = nameInput.trim();
    if (!name) return;
    setSenderName(name);
    localStorage.setItem("castle_imperior_chat_name", name);
    setNameInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSend = async () => {
    if (!senderName) return;
    const text = messageInput.trim();
    if (!text && !selectedFile) {
      toast.error("Please type a message or attach an image.");
      return;
    }

    let imageBlob: ExternalBlob | null = null;
    if (selectedFile) {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      imageBlob = ExternalBlob.fromBytes(bytes);
    }

    // Optimistic local message
    const localMsg: LocalMessage = {
      id: Date.now().toString(),
      senderName,
      message: text,
      imageUrl: previewUrl ?? undefined,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, localMsg]);
    setMessageInput("");
    clearFile();

    try {
      await sendMessage({ senderName, message: text, image: imageBlob });
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gold-gradient flex items-center justify-center shadow-gold-lg hover:opacity-90 transition-all duration-300 animate-pulse-gold"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-background" />
        ) : (
          <MessageCircle className="w-5 h-5 text-background" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 rounded-2xl border border-gold-dim bg-card shadow-gold-lg overflow-hidden flex flex-col"
          style={{ maxHeight: "min(520px, calc(100vh - 8rem))" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gold-dim bg-muted/50">
            <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center">
              <Crown className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="font-display text-sm text-foreground font-medium">Castle Imperior Support</p>
              <p className="text-xs text-muted-foreground">Ask us anything or send a photo</p>
            </div>
          </div>

          {/* Name prompt */}
          {!senderName && (
            <div className="px-4 py-3 bg-muted/30 border-b border-gold-dim">
              <p className="text-xs text-muted-foreground mb-2">Please introduce yourself to start chatting:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  placeholder="Your name"
                  className="flex-1 px-3 py-1.5 text-sm bg-background border border-gold-dim rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="px-3 py-1.5 gold-gradient text-background text-xs font-semibold rounded-lg hover:opacity-90"
                >
                  Set
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-luxury">
            {messages.length === 0 && senderName && (
              <div className="text-center py-6">
                <Crown className="w-8 h-8 text-gold-dim mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-light">
                  Hello, {senderName}! How can we assist you today?
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1 items-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 bg-primary/20 border border-gold-dim">
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Attachment from customer"
                      className="rounded-lg mb-2 max-w-full object-cover"
                    />
                  )}
                  {msg.message && (
                    <p className="text-sm text-foreground">{msg.message}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {previewUrl && (
            <div className="px-4 py-2 border-t border-gold-dim flex items-center gap-2">
              <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gold-dim" />
              <p className="text-xs text-muted-foreground flex-1 truncate">{selectedFile?.name}</p>
              <button
                type="button"
                onClick={clearFile}
                aria-label="Remove image"
                className="w-6 h-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/40 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gold-dim bg-muted/30 flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach photo"
              disabled={!senderName}
              className="shrink-0 w-9 h-9 rounded-full border border-gold-dim hover:border-gold flex items-center justify-center text-muted-foreground hover:text-gold transition-colors disabled:opacity-40"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={senderName ? "Type your message..." : "Enter your name first"}
              disabled={!senderName || isPending}
              rows={1}
              className="flex-1 resize-none px-3 py-2 text-sm bg-background border border-gold-dim rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold disabled:opacity-40 max-h-24 scrollbar-luxury"
              style={{ overflowY: "auto" }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!senderName || isPending || (!messageInput.trim() && !selectedFile)}
              aria-label="Send message"
              className="shrink-0 w-9 h-9 rounded-full gold-gradient flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 text-background animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-background" />
              )}
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
