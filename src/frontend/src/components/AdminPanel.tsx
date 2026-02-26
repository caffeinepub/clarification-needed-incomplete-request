import { useState, useRef } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Upload, Crown, Reply } from "lucide-react";
import { toast } from "sonner";
import { ExternalBlob, OrderStatus } from "@/backend";
import {
  useGetWatches,
  useAddWatch,
  useUpdateWatch,
  useDeleteWatch,
  useGetOrders,
  useUpdateOrderStatus,
  useGetAllMessages,
  useReplyToMessage,
} from "@/hooks/useQueries";

function formatPrice(price: bigint): string {
  return "$" + (Number(price) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]:   "border-gold-dim text-gold-muted",
  [OrderStatus.confirmed]: "border-blue-500/50 text-blue-400",
  [OrderStatus.completed]: "border-green-500/50 text-green-400",
  [OrderStatus.cancelled]: "border-red-500/50 text-red-400",
};

// ── Add Watch Form ─────────────────────────────────────────────────────────────

function AddWatchForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: addWatch, isPending } = useAddWatch();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !priceInput || !imageFile) {
      toast.error("Please fill in all required fields and select an image.");
      return;
    }
    const priceDollars = parseFloat(priceInput);
    if (isNaN(priceDollars) || priceDollars <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    const priceCents = BigInt(Math.round(priceDollars * 100));
    const bytes = new Uint8Array(await imageFile.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => setUploadProgress(pct));

    try {
      await addWatch({ name: name.trim(), description: description.trim(), price: priceCents, image: blob });
      setName("");
      setDescription("");
      setPriceInput("");
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setUploadProgress(0);
      toast.success("Watch added successfully!");
    } catch {
      toast.error("Failed to add watch. Please try again.");
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 card-luxury rounded-xl">
      <h3 className="font-display text-xl text-gold mb-4">Add New Timepiece</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Royal Tourbillon"
            className="bg-muted border-gold-dim focus:border-gold"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs tracking-widest uppercase text-muted-foreground">Price (USD) *</Label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="e.g. 1299.00"
            className="bg-muted border-gold-dim focus:border-gold"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs tracking-widest uppercase text-muted-foreground">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this timepiece..."
          rows={3}
          className="bg-muted border-gold-dim focus:border-gold resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs tracking-widest uppercase text-muted-foreground">Watch Photo *</Label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-gold-dim rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-gold transition-colors"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Watch preview" className="w-32 h-32 object-cover rounded-lg border border-gold-dim" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gold-muted" />
              <p className="text-sm text-muted-foreground">Click to select watch photo</p>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="gold-gradient h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gold-gradient text-background font-semibold tracking-widest uppercase text-xs py-3 hover:opacity-90"
      >
        {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : "Add Watch"}
      </Button>
    </form>
  );
}

// ── Watches Tab ───────────────────────────────────────────────────────────────

function WatchesTab() {
  const { data: watches = [], isLoading } = useGetWatches();
  const { mutateAsync: updateWatch, isPending: isUpdating } = useUpdateWatch();
  const { mutateAsync: deleteWatch, isPending: isDeleting } = useDeleteWatch();

  const handleTogglePublish = async (watch: (typeof watches)[0]) => {
    try {
      await updateWatch({
        id: watch.id,
        name: watch.name,
        description: watch.description,
        price: watch.price,
        published: !watch.published,
      });
      toast.success(watch.published ? "Watch unpublished." : "Watch published!");
    } catch {
      toast.error("Failed to update watch.");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Are you sure you want to delete this watch?")) return;
    try {
      await deleteWatch(id);
      toast.success("Watch deleted.");
    } catch {
      toast.error("Failed to delete watch.");
    }
  };

  return (
    <div className="space-y-6">
      <AddWatchForm />

      <div className="space-y-3">
        <h3 className="font-display text-xl text-gold">All Timepieces</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : watches.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No watches added yet.</p>
        ) : (
          watches.map((watch) => (
            <div key={watch.id.toString()} className="card-luxury rounded-xl p-4 flex items-center gap-4">
              <img
                src={watch.image.getDirectURL()}
                alt={watch.name}
                className="w-16 h-16 rounded-lg object-cover border border-gold-dim shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg text-foreground truncate">{watch.name}</p>
                <p className="text-sm text-gold">{formatPrice(watch.price)}</p>
                <p className="text-xs text-muted-foreground truncate">{watch.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{watch.published ? "Live" : "Draft"}</span>
                  <Switch
                    checked={watch.published}
                    onCheckedChange={() => handleTogglePublish(watch)}
                    disabled={isUpdating}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(watch.id)}
                  disabled={isDeleting}
                  className="border-red-500/30 text-red-400 hover:border-red-500 hover:text-red-300 w-8 h-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────

function OrdersTab() {
  const { data: orders = [], isLoading } = useGetOrders();
  const { data: watches = [] } = useGetWatches();
  const { mutateAsync: updateStatus, isPending } = useUpdateOrderStatus();

  const watchMap = new Map(watches.map((w) => [w.id.toString(), w.name]));

  const handleStatusChange = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateStatus({ orderId, status });
      toast.success("Order status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-display text-xl text-gold mb-4">Orders</h3>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-6">No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id.toString()} className="card-luxury rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground font-mono">Order #{order.id.toString()}</p>
                <p className="font-display text-lg text-foreground">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.contactInfo}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className={STATUS_COLORS[order.status]}>
                  {order.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(order.timestamp)}</p>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                Watch: <span className="text-foreground">{watchMap.get(order.watchId.toString()) || "Unknown"}</span>
              </p>
              {order.note && (
                <p className="text-muted-foreground">
                  Note: <span className="text-foreground">{order.note}</span>
                </p>
              )}
            </div>
            <Select
              value={order.status}
              onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
              disabled={isPending}
            >
              <SelectTrigger className="w-40 bg-muted border-gold-dim text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-gold-dim">
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s} className="text-foreground">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))
      )}
    </div>
  );
}

// ── Messages Tab ──────────────────────────────────────────────────────────────

function MessagesTab() {
  const { data: messages = [], isLoading } = useGetAllMessages();
  const { mutateAsync: replyToMessage, isPending } = useReplyToMessage();
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const handleReply = async (messageId: bigint) => {
    const key = messageId.toString();
    const text = replyTexts[key]?.trim();
    if (!text) return;
    try {
      await replyToMessage({ messageId, replyText: text });
      setReplyTexts((prev) => ({ ...prev, [key]: "" }));
      toast.success("Reply sent.");
    } catch {
      toast.error("Failed to send reply.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl text-gold mb-4">Chat Messages</h3>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-6">No messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id.toString()} className="card-luxury rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-display text-base text-foreground">{msg.senderName}</p>
              <p className="text-xs text-muted-foreground">{formatTimestamp(msg.timestamp)}</p>
            </div>
            {msg.message && <p className="text-sm text-muted-foreground">{msg.message}</p>}
            {msg.image && (
              <img
                src={msg.image.getDirectURL()}
                alt="Attachment from customer"
                className="max-w-xs rounded-lg border border-gold-dim object-cover"
              />
            )}

            {/* Replies */}
            {msg.replies.length > 0 && (
              <div className="pl-4 border-l border-gold-dim space-y-2">
                {msg.replies.map((reply) => (
                  <div key={reply.id.toString()} className="text-sm space-y-0.5">
                    <p className="text-xs text-gold-muted font-medium">Castle Imperior</p>
                    <p className="text-muted-foreground">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={replyTexts[msg.id.toString()] ?? ""}
                onChange={(e) =>
                  setReplyTexts((prev) => ({ ...prev, [msg.id.toString()]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleReply(msg.id)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-1.5 text-sm bg-background border border-gold-dim rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold"
              />
              <Button
                type="button"
                size="sm"
                disabled={isPending || !replyTexts[msg.id.toString()]?.trim()}
                onClick={() => handleReply(msg.id)}
                className="gold-gradient text-background text-xs font-semibold hover:opacity-90 h-8 px-3"
              >
                <Reply className="w-3.5 h-3.5 mr-1" />
                Reply
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  return (
    <section id="admin" className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full border border-gold flex items-center justify-center">
              <Crown className="w-6 h-6 text-gold" />
            </div>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">Admin Panel</h2>
          <div className="ornament max-w-xs mx-auto">
            <span className="text-xs text-gold-muted tracking-widest uppercase">Restricted Access</span>
          </div>
        </div>

        <Tabs defaultValue="watches">
          <TabsList className="w-full bg-muted border border-gold-dim mb-6">
            <TabsTrigger value="watches" className="flex-1 data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
              Watches
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
              Orders
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-1 data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watches">
            <WatchesTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="messages">
            <MessagesTab />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
