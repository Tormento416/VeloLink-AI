import { Link } from "@tanstack/react-router";
import { ArrowRight, Globe, Layers, PhoneCall, Search, Film, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { websiteRevamp, websiteAddOns, formatStartingPrice } from "@/lib/offers";

const icons = [Layers, PhoneCall, Search, Film, Images];

export function StandaloneOffer() {

  return (
    <div>
      <div className="grid gap-8 border-b pb-10 md:grid-cols-[1.5fr_1fr] md:items-center">
        <div>
          <Globe className="mb-4 h-7 w-7 text-accent" />
          <p className="eyebrow">Standalone website</p>
          <h2 className="mt-3 text-3xl font-bold">{websiteRevamp.name}</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">Refresh your online presence with a focused one-page site. Start with the website alone and add only what your business needs.</p>
        </div>
        <div className="md:border-l md:pl-10">
          <p className="text-sm text-muted-foreground">Starting at</p>
          <p className="mt-1 font-display text-5xl font-bold">{formatStartingPrice(websiteRevamp.startingPrice)}</p>
          <p className="mt-3 text-sm text-muted-foreground">Website revamp only. AI and other add-ons are optional.</p>
          <Button asChild variant="hero" className="mt-5"><Link to="/demos">AI Web Builder <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
      <div className="mt-10">
        <p className="eyebrow">À la carte</p>
        <h3 className="mt-3 text-3xl font-bold">Optional website add-ons.</h3>
        <p className="mt-3 text-muted-foreground">Explore the extras available through your VeloLinkAI representative.</p>
        <p className="mt-2 text-sm text-muted-foreground">Each add-on is quoted separately based on your project.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {websiteAddOns.map((addOn, index) => {
            const Icon = icons[index] ?? Layers;
            return (
              <div key={addOn.id} className="flex items-start gap-3 rounded-lg border bg-card p-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{addOn.name}</span>
                  <span className="mt-2 block text-sm text-muted-foreground">{addOn.description}</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-8 grid gap-8 border-t pt-8 lg:grid-cols-2">
          <div>
            <h4 className="text-xl font-semibold">Configured by your representative</h4>
            <p className="mt-4 text-sm text-muted-foreground">Website scope, add-ons, and final pricing are prepared by an authorized VeloLinkAI representative.</p>
            <Button asChild variant="hero" className="mt-5"><Link to="/demos">AI Web Builder <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="border-t pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="eyebrow">More together</p>
            <h4 className="mt-3 text-xl font-semibold">Could a package save you more?</h4>
            <p className="mt-3 text-sm text-muted-foreground">Launch, Momentum, and Scale combine a website, AI receptionist, and ongoing maintenance. We'll compare your custom quote with the packages to find the better value.</p>
            <p className="mt-3 text-sm text-muted-foreground">Savings depend on your chosen services and final quote.</p>
            <Button asChild variant="outline" className="mt-5"><Link to="/packages" hash="bundles">Compare Packages <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}