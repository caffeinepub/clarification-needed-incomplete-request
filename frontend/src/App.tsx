import { useState, useRef } from 'react';
import { Upload, User, Camera, Trash2, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10 MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    toast.success('Profile picture updated!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemove = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    toast('Profile picture removed.');
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'profile-picture.jpg';
    a.click();
  };

  const appId = encodeURIComponent(window.location.hostname || 'unknown-app');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster richColors position="top-center" />

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">PicMe</span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">Profile Picture Manager</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">

          {/* Hero text */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Add Your Profile Picture
            </h1>
            <p className="text-muted-foreground text-base">
              Upload, preview, and manage your profile photo with ease.
            </p>
          </div>

          {/* Avatar preview */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-36 h-36 rounded-full border-4 border-primary/30 overflow-hidden bg-muted flex items-center justify-center shadow-lg transition-all duration-300 group-hover:border-primary/60">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-muted-foreground/40" />
                )}
              </div>
              {imageUrl && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Upload area */}
          {!imageUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200
                ${isDragging
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/40'
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-primary/15' : 'bg-muted'}`}>
                  <Upload className={`w-6 h-6 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {isDragging ? 'Drop your image here' : 'Click or drag & drop'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG, GIF, WebP — up to 10 MB
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-1 pointer-events-none">
                  Browse files
                </Button>
              </div>
            </div>
          ) : (
            <Card className="rounded-2xl border border-border shadow-xs">
              <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-medium text-foreground">Profile picture set!</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Looking great. You can change or remove it anytime.</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Change
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    className="gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            {[
              { icon: '🖼️', title: 'Any format', desc: 'PNG, JPG, GIF, WebP' },
              { icon: '✂️', title: 'Auto-cropped', desc: 'Fits perfectly in circle' },
              { icon: '🔒', title: 'Private', desc: 'Stays on your device' },
            ].map((tip) => (
              <div key={tip.title} className="rounded-xl bg-muted/50 px-4 py-3 space-y-1">
                <span className="text-xl">{tip.icon}</span>
                <p className="text-sm font-medium text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} PicMe. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive mx-0.5" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
