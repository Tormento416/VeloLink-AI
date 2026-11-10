import { SAMPLE_PHOTOS } from "./sample-photos";
import { planSite, Site, THEMES, type ImageRef, type Package, type SectionType, type Template } from "@velolink/core";

/** Sample photos live in public/samples/<name>.jpg. Missing ones fall back to artwork. */
function photo(name: string, alt: string): ImageRef | undefined {
  return SAMPLE_PHOTOS.has(name) ? { assetId: `sample:${name}`, alt } : undefined;
}

/** Resolves preview asset ids: sample photos are served from /samples. */
export function demoAsset(id: string): string {
  return id.startsWith("sample:") ? `/samples/${encodeURIComponent(id.slice(7))}.jpg` : `/assets/${encodeURIComponent(id)}`;
}

const TEL = "tel:+15125550142";

/** Sample content used to preview a template before any client data exists. */
export function demoSiteFor(template: Template, pkg: Package): Site {
  const theme = THEMES[template.themeId];
  if (!theme) throw new Error(`Unknown theme ${template.themeId}`);
  const services = pkg === "single_page" ? "#services" : "/services";
  return Site.parse({
    business: {
      name: "Smith Plumbing",
      phone: "(512) 555-0142",
      email: "hello@smithplumbing.example",
      address: "2201 E Cesar Chavez St, Austin, TX",
      serviceArea: "Austin, TX",
      serviceAreas: ["Downtown Austin", "East Austin", "Round Rock", "Pflugerville", "Cedar Park", "Georgetown", "Del Valle", "Manor"],
      tagline: "Licensed, family-owned plumbers serving Austin homes and businesses since 2009.",
      hours: [
        { days: "Mon–Fri", time: "7am–6pm" },
        { days: "Saturday", time: "8am–2pm" },
        { days: "Emergencies", time: "24/7" },
      ],
      social: [
        { network: "facebook", href: "https://facebook.com/" },
        { network: "instagram", href: "https://instagram.com/" },
        { network: "google", href: "https://google.com/" },
      ],
    },
    theme,
    templateId: template.id,
    templateVersion: template.version,
    package: pkg,
    pages: planSite(template, pkg).map((p) => ({
      slug: p.slug,
      title: p.title,
      sections: p.sections.flatMap((s) => {
        const sample = sampleSection(s.type, services, p.slug);
        return sample ? [{ ...sample, ...(s.variant ? { variant: s.variant } : {}) }] : [];
      }),
    })),
  });
}

function sampleSection(type: SectionType, servicesHref: string, slug: string) {
  switch (type) {
    case "hero":
      return {
        type,
        props: {
          eyebrow: "Austin's family plumbers",
          headline: "Fast, honest plumbing for Austin homes",
          subheadline: "Licensed plumbers at your door the same day, with upfront pricing and work we stand behind.",
          ctaLabel: "Call (512) 555-0142",
          ctaHref: TEL,
          secondaryCtaLabel: "Our services",
          secondaryCtaHref: servicesHref,
          image: photo("hero", "A Smith Plumbing technician repairing a kitchen sink"),
        },
      };
    case "services":
      return {
        type,
        props: {
          heading: "Plumbing services, done right the first time",
          intro: "From a dripping tap to a full repipe, one call gets it handled.",
          items: [
            { name: "Leak detection & repair", description: "We find hidden leaks fast and fix them before they damage floors and walls.", icon: "droplets", image: photo("service-leak", "Fixing a leaking pipe") },
            { name: "Water heaters", description: "Repair and installation of tank and tankless heaters, often the same day.", icon: "flame", image: photo("service-heater", "A new water heater") },
            { name: "Drain cleaning", description: "Clear stubborn clogs with camera inspection and hydro-jetting.", icon: "wrench", image: photo("service-drain", "Drain cleaning equipment") },
            { name: "Fixture installation", description: "Faucets, toilets, showers and disposals fitted neatly and to code.", icon: "home" },
            { name: "Emergency service", description: "Burst pipe at 2am? We answer the phone around the clock.", icon: "clock" },
            { name: "Repiping", description: "Whole-home repipes with PEX or copper, planned around your schedule.", icon: "hammer" },
          ],
        },
      };
    case "about":
      return slug === "service-area"
        ? { type, props: { eyebrow: "Local to Austin", heading: "Plumbers who live where you live", body: "Our trucks are based in East Austin, so we reach most of the metro in under an hour.\n\nWe know the older homes in Hyde Park and the new builds in Round Rock, and we price the same way everywhere: upfront, before work starts." } }
        : {
            type,
            props: {
              eyebrow: "About Smith Plumbing",
              heading: "Family owned and Austin proud since 2009",
              body: "Mike Smith started the company with one truck and a simple rule: treat every home like your own.\n\nToday our team of licensed plumbers still follows it. We show up on time, explain the options, and leave your home cleaner than we found it.",
              points: ["Licensed and insured", "Upfront pricing", "Same-day appointments", "1-year labor warranty"],
              image: photo("about", "The Smith Plumbing team in front of their van"),
            },
          };
    case "reviews":
      return {
        type,
        props: {
          heading: "What Austin homeowners say",
          items: [
            { author: "Dana Ruiz", quote: "Showed up within the hour, found the leak behind the wall and had it fixed before dinner. Fair price, too.", rating: 5 },
            { author: "Marcus Lee", quote: "They replaced our water heater the same day and hauled the old one away. Professional from start to finish.", rating: 5 },
            { author: "Priya Shah", quote: "Clear quote up front, no surprises on the bill. Our go-to plumber now.", rating: 5 },
          ],
        },
      };
    case "faq":
      return {
        type,
        props: {
          heading: "Questions we hear a lot",
          intro: "Can't find your answer? Call us and a real person will pick up.",
          items: [
            { question: "Do you offer emergency service?", answer: "Yes. We answer around the clock and can usually be there within the hour across Austin." },
            { question: "How much does a visit cost?", answer: "We quote a flat price before any work starts, so you know the cost up front." },
            { question: "Are you licensed and insured?", answer: "Yes. Every plumber on our team is licensed in Texas and we carry full liability insurance." },
            { question: "Do you warranty your work?", answer: "All labor comes with a one-year warranty, and parts carry the manufacturer's warranty." },
          ],
        },
      };
    case "contact":
      return { type, props: { heading: "Get in touch", intro: "Call, email or stop by. We usually reply within the hour.", phone: "(512) 555-0142", email: "hello@smithplumbing.example", address: "2201 E Cesar Chavez St, Austin, TX", hours: [{ days: "Mon–Fri", time: "7am–6pm" }, { days: "Saturday", time: "8am–2pm" }, { days: "Emergencies", time: "24/7" }] } };
    case "highlights":
      return { type, props: { items: ["Licensed and insured", "Same-day service", "Upfront pricing", "Family owned since 2009"] } };
    case "steps":
      return { type, props: { heading: "How it works", items: [{ title: "Call or book online", description: "Tell us what's going on and pick a time that suits you." }, { title: "We come to you", description: "A licensed plumber arrives on time with the right parts." }, { title: "Clear, upfront quote", description: "You approve the price before any work starts." }, { title: "Fixed right", description: "We clean up and check the work with you before we leave." }] } };
    case "community":
      return {
        type,
        props: {
          heading: "Proud to be part of Austin",
          items: [
            { title: "Sponsoring the Eastside Tigers", summary: "Our team has backed the Eastside Tigers little league since 2019, from uniforms to the end-of-season cookout.", date: "Spring 2026", image: photo("community-1", "Little league team photo") },
            { title: "Free winter pipe clinic", summary: "Bring your questions to our free clinic on keeping pipes from freezing.", date: "Dec 2026", image: photo("community-2", "Plumber talking to neighbours") },
            { title: "Habitat for Humanity build", summary: "Six of our plumbers volunteered on a Habitat home in Del Valle.", date: "Oct 2026", image: photo("community-3", "Volunteers at a build site") },
          ],
        },
      };
    case "gallery": {
      const images = ["work-1", "work-2", "work-3", "work-4", "work-5"].map((n, i) => photo(n, `Recent job ${i + 1}`)).filter((x): x is ImageRef => x !== undefined);
      // Like a real site, the gallery is left out until there are photos.
      return images.length ? { type, props: { heading: "Recent work", images } } : null;
    }
    case "areas":
      return { type, props: { heading: "Areas we serve", intro: "Based in East Austin and on the road across the metro every day.", areas: ["Downtown Austin", "East Austin", "Round Rock", "Pflugerville", "Cedar Park", "Georgetown", "Del Valle", "Manor"] } };
    case "cta":
      return { type, props: { heading: "Need a plumber today?", subheading: "Call now and we can usually be there within the hour.", ctaLabel: "Call (512) 555-0142", ctaHref: TEL, image: photo("cta", "A tidy finished bathroom") } };
  }
}
