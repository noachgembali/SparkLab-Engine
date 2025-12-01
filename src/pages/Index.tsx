import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Sparkles, 
  Image, 
  Video, 
  ArrowRight, 
  Check, 
  Layers, 
  Sliders, 
  Rocket,
  UserPlus,
  Wand2,
  History
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Mock Workspace Preview Component
function WorkspaceMockPreview() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-60" />
      
      {/* Mock window */}
      <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
        {/* Window header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 font-mono">SparkLab Workspace</span>
        </div>
        
        {/* Mock content */}
        <div className="p-4 space-y-4">
          {/* Mock prompt input */}
          <div className="bg-background/50 rounded-lg p-3 border border-border/30">
            <p className="text-xs text-muted-foreground mb-2">Prompt</p>
            <p className="text-sm text-foreground/80">A futuristic city skyline at sunset, cyberpunk style, neon lights...</p>
          </div>
          
          {/* Mock controls */}
          <div className="flex gap-2">
            <div className="flex-1 bg-primary/10 rounded-lg p-2 border border-primary/20">
              <p className="text-xs text-primary">Engine</p>
              <p className="text-xs text-foreground/70">Flux Pro</p>
            </div>
            <div className="flex-1 bg-accent/10 rounded-lg p-2 border border-accent/20">
              <p className="text-xs text-accent">Ratio</p>
              <p className="text-xs text-foreground/70">16:9</p>
            </div>
            <div className="flex-1 bg-secondary/20 rounded-lg p-2 border border-secondary/20">
              <p className="text-xs text-secondary">Style</p>
              <p className="text-xs text-foreground/70">Cinematic</p>
            </div>
          </div>
          
          {/* Mock image preview */}
          <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-lg border border-border/30 flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-primary/20 flex items-center justify-center">
                <Image className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Generated Preview</p>
            </div>
          </div>
          
          {/* Mock generate button */}
          <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-3 text-center">
            <span className="text-sm font-medium text-primary-foreground">Generate</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  gradient: string;
}) {
  return (
    <div className="group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/70 hover:border-primary/30 transition-all duration-300">
      <div className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Step Card Component
function StepCard({ 
  number, 
  title, 
  description, 
  icon: Icon 
}: { 
  number: number; 
  title: string; 
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex-1 text-center p-6">
      <div className="relative inline-flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
          {number}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

// Pricing Card Component
function PricingCard({ 
  title, 
  price, 
  features, 
  cta, 
  highlighted,
  onCtaClick
}: { 
  title: string; 
  price: string; 
  features: string[]; 
  cta: string;
  highlighted?: boolean;
  onCtaClick: () => void;
}) {
  return (
    <div className={`p-8 rounded-2xl backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
      highlighted 
        ? 'bg-gradient-to-br from-primary/15 to-accent/15 border-2 border-primary/40' 
        : 'bg-card/50 border border-border/50'
    }`}>
      {highlighted && (
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
            Popular
          </span>
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-3xl font-bold mb-6 text-foreground">{price}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-success flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Button 
        variant={highlighted ? "glow" : "outline"} 
        className="w-full"
        onClick={onCtaClick}
      >
        {cta}
      </Button>
    </div>
  );
}

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const handleLaunchWorkspace = () => {
    if (user) {
      navigate("/workspace");
    } else {
      navigate("/auth");
    }
  };

  const handleDashboard = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Header / Navigation */}
      <header className="relative z-10 border-b border-border/30 bg-background/50 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-gradient">SparkLab</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/workspace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Workspace
            </Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Account
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="glow" size="sm" onClick={() => navigate("/workspace")}>
                  Workspace
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="glow" size="sm">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Creation Studio</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-up">
              SparkLab — Your
              <br />
              <span className="text-gradient">Unified AI Creation</span>
              <br />
              Studio
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Generate images and videos with multiple AI engines, all inside one seamless workspace. No switching tools, no complexity.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="glow" size="xl" onClick={handleLaunchWorkspace}>
                <Rocket className="w-5 h-5" />
                Launch Workspace
              </Button>
              <Button variant="outline" size="xl" onClick={handleDashboard}>
                {user ? "View Dashboard" : "Sign in"}
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>5 free generations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>No credit card</span>
              </div>
            </div>
          </div>

          {/* Right: Mock Preview */}
          <div className="animate-fade-up lg:animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <WorkspaceMockPreview />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why creators use <span className="text-gradient">SparkLab</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to bring your creative vision to life, powered by the best AI engines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Layers}
              title="Unified Engines, One Workspace"
              description="Use multiple AI engines behind the scenes, while SparkLab keeps the experience unified and simple."
              gradient="bg-gradient-to-br from-primary/20 to-primary/5"
            />
            <FeatureCard
              icon={Sliders}
              title="Pro-Grade Controls"
              description="Adjust aspect ratios, steps, prompt strength, styles, and reference images — without touching any code."
              gradient="bg-gradient-to-br from-accent/20 to-accent/5"
            />
            <FeatureCard
              icon={Video}
              title="Images & Video Together"
              description="Switch between image and video generation in the same interface. No extra tools, no confusion."
              gradient="bg-gradient-to-br from-secondary/30 to-secondary/10"
            />
            <FeatureCard
              icon={Zap}
              title="Simple, Honest Pricing"
              description="Start with 5 free generations. Upgrade once and unlock unlimited creations."
              gradient="bg-gradient-to-br from-success/20 to-success/5"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24 border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              How <span className="text-gradient">SparkLab</span> works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From idea to creation in three simple steps.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
            <StepCard
              number={1}
              icon={UserPlus}
              title="Sign up"
              description="Create your SparkLab account in seconds. No credit card required."
            />
            <StepCard
              number={2}
              icon={Wand2}
              title="Create in the Workspace"
              description="Choose an engine, write your prompt, and adjust advanced settings."
            />
            <StepCard
              number={3}
              icon={History}
              title="Generate & iterate"
              description="SparkLab remembers your history and lets you refine and re-run your ideas."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-24 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <PricingCard
              title="Free Trial"
              price="₹0"
              features={[
                "5 total generations",
                "All AI engines available",
                "Full workspace access",
                "Generation history",
                "Perfect for testing SparkLab"
              ]}
              cta="Get Started Free"
              onCtaClick={() => navigate("/auth")}
            />
            <PricingCard
              title="Pro"
              price="₹149/mo"
              features={[
                "Unlimited generations",
                "Priority processing",
                "All AI engines + future engines",
                "Advanced controls",
                "Premium support"
              ]}
              cta="Join Waitlist"
              highlighted
              onCtaClick={() => setUpgradeModalOpen(true)}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Ready to create?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of creators using SparkLab to bring their ideas to life with AI.
              </p>
              <Button variant="glow" size="xl" onClick={handleLaunchWorkspace}>
                <Rocket className="w-5 h-5" />
                Launch Workspace
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-bold text-gradient">SparkLab</span>
            </div>
            
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link to="/workspace" className="hover:text-foreground transition-colors">Workspace</Link>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SparkLab. AI Creation Studio.
            </p>
          </div>
        </div>
      </footer>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Pro Plan Coming Soon
            </DialogTitle>
            <DialogDescription className="pt-4">
              We're working hard to bring you unlimited generations with the Pro plan. 
              Stay tuned — upgrades will be available very soon!
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-sm text-muted-foreground">
              In the meantime, enjoy your <span className="text-primary font-medium">5 free generations</span> and 
              explore everything SparkLab has to offer.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="glow" onClick={() => setUpgradeModalOpen(false)}>
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
