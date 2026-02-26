import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { usePlaceOrder } from "@/hooks/useQueries";
import type { Watch } from "@/backend";

function formatPrice(price: bigint): string {
  return "$" + (Number(price) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

interface OrderModalProps {
  watch: Watch | null;
  open: boolean;
  onClose: () => void;
}

export default function OrderModal({ watch, open, onClose }: OrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [note, setNote] = useState("");
  const [orderId, setOrderId] = useState<bigint | null>(null);

  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();

  const handleClose = () => {
    setCustomerName("");
    setContactInfo("");
    setNote("");
    setOrderId(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watch) return;
    if (!customerName.trim() || !contactInfo.trim()) {
      toast.error("Please fill in your name and contact information.");
      return;
    }
    try {
      const id = await placeOrder({
        customerName: customerName.trim(),
        contactInfo: contactInfo.trim(),
        watchId: watch.id,
        note: note.trim(),
      });
      setOrderId(id);
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-card border border-gold-dim max-w-md shadow-gold-lg">
        {orderId !== null ? (
          /* Success state */
          <div className="flex flex-col items-center py-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center animate-pulse-gold">
              <CheckCircle2 className="w-8 h-8 text-gold" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-gold mb-2">Order Confirmed</h3>
              <p className="text-muted-foreground text-sm">
                Your order has been placed successfully.
              </p>
              <p className="text-xs text-gold-muted mt-3 font-mono">
                Order ID: #{orderId.toString()}
              </p>
            </div>
            <p className="text-sm text-muted-foreground font-light max-w-xs">
              We'll contact you at <span className="text-foreground font-medium">{contactInfo}</span> shortly to confirm your order.
            </p>
            <Button
              type="button"
              onClick={handleClose}
              className="gold-gradient text-background font-semibold tracking-widest uppercase text-xs px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-1 pb-2">
              <div className="ornament mb-2">
                <span className="text-xs text-gold-muted tracking-widest uppercase">Place Order</span>
              </div>
              <DialogTitle className="font-display text-2xl text-foreground">
                {watch?.name}
              </DialogTitle>
              {watch && (
                <p className="font-display text-xl text-gold">{formatPrice(watch.price)}</p>
              )}
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="order-name" className="text-xs tracking-widest uppercase text-muted-foreground">
                  Your Name *
                </Label>
                <Input
                  id="order-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. James Whitmore"
                  className="bg-muted border-gold-dim focus:border-gold text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-contact" className="text-xs tracking-widest uppercase text-muted-foreground">
                  Email or Phone *
                </Label>
                <Input
                  id="order-contact"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="email@example.com or +1 234 567 8900"
                  className="bg-muted border-gold-dim focus:border-gold text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-note" className="text-xs tracking-widest uppercase text-muted-foreground">
                  Special Instructions (optional)
                </Label>
                <Textarea
                  id="order-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any special requests or notes..."
                  rows={3}
                  className="bg-muted border-gold-dim focus:border-gold text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-gold-dim text-muted-foreground hover:border-gold hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 gold-gradient text-background font-semibold tracking-widest uppercase text-xs hover:opacity-90 transition-opacity"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
