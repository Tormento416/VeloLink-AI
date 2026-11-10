import type { ReactElement, ReactNode } from "react";
import type { ImageRef, Section } from "../sections/schemas";
import { Icon } from "./icon";

export type AssetResolver = (assetId: string) => string;

type Props<T extends Section["type"]> = {
  section: Extract<Section, { type: T }>;
  asset: AssetResolver;
};

function Img({ image, asset, className, eager }: { image: ImageRef; asset: AssetResolver; className?: string; eager?: boolean }) {
  return <img className={className} src={asset(image.assetId)} alt={image.alt} loading={eager ? "eager" : "lazy"} decoding="async" />;
}

/** Shown where a photo would go when the client hasn't supplied one yet. */
function ArtPanel({ className }: { className?: string }) {
  return <div className={`vl-art ${className ?? ""}`} aria-hidden="true"><span /><span /><span /></div>;
}

function Head({ eyebrow, heading, intro, center }: { eyebrow?: string; heading: string; intro?: string; center?: boolean }) {
  return (
    <header className={`vl-head${center ? " vl-head--center" : ""}`}>
      {eyebrow && <p className="vl-eyebrow">{eyebrow}</p>}
      <h2>{heading}</h2>
      {intro && <p className="vl-intro">{intro}</p>}
    </header>
  );
}

function Wrap({ id, className, children }: { id?: string; className: string; children: ReactNode }) {
  return (
    <section id={id} className={className}>
      <div className="vl-wrap">{children}</div>
    </section>
  );
}

function Hero({ section, asset }: Props<"hero">) {
  const p = section.props;
  const bg = section.variant === "full-bleed" && p.image;
  return (
    <section id="top" className={`vl-hero vl-hero--${section.variant}${bg ? " vl-hero--photo" : ""}`}>
      {bg && <Img image={p.image!} asset={asset} className="vl-hero__bg" eager />}
      <div className="vl-wrap vl-hero__inner">
        <div className="vl-hero__text">
          {p.eyebrow && <p className="vl-eyebrow">{p.eyebrow}</p>}
          <h1>{p.headline}</h1>
          {p.subheadline && <p className="vl-hero__sub">{p.subheadline}</p>}
          <div className="vl-actions">
            <a className="vl-button" href={p.ctaHref}>{p.ctaLabel}</a>
            {p.secondaryCtaLabel && p.secondaryCtaHref && (
              <a className="vl-button vl-button--ghost" href={p.secondaryCtaHref}>{p.secondaryCtaLabel}</a>
            )}
          </div>
        </div>
        {section.variant === "split" && (
          <div className="vl-hero__media">
            {p.image ? <Img image={p.image} asset={asset} eager /> : <ArtPanel />}
          </div>
        )}
        {section.variant === "centered" && p.image && (
          <div className="vl-hero__media vl-hero__media--wide"><Img image={p.image} asset={asset} eager /></div>
        )}
      </div>
    </section>
  );
}

function Services({ section, asset }: Props<"services">) {
  const p = section.props;
  return (
    <Wrap id="services" className={`vl-services vl-services--${section.variant}`}>
      <Head heading={p.heading} intro={p.intro} />
      <ul className="vl-cards">
        {p.items.map((item, i) => (
          <li key={i} className="vl-card">
            {item.image && <Img image={item.image} asset={asset} className="vl-card__img" />}
            <div className="vl-card__body">
              <span className="vl-icon">{<Icon name={item.icon ?? "check"} />}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

function About({ section, asset }: Props<"about">) {
  const p = section.props;
  return (
    <Wrap id="about" className={`vl-about vl-about--${section.variant}`}>
      <div className="vl-about__grid">
        {section.variant === "image-left" && (
          <div className="vl-about__media">{p.image ? <Img image={p.image} asset={asset} /> : <ArtPanel />}</div>
        )}
        <div className="vl-about__text">
          <Head eyebrow={p.eyebrow} heading={p.heading} />
          {p.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
          {p.points && p.points.length > 0 && (
            <ul className="vl-checks">
              {p.points.map((pt, i) => <li key={i}><Icon name="check" size={18} />{pt}</li>)}
            </ul>
          )}
        </div>
      </div>
    </Wrap>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="vl-stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => <span key={i} className={i < rating ? "on" : ""}>★</span>)}
    </span>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

function Reviews({ section }: Props<"reviews">) {
  const items = section.props.items;
  const avg = items.reduce((s, r) => s + r.rating, 0) / items.length;
  return (
    <Wrap id="reviews" className="vl-reviews">
      <div className="vl-reviews__top">
        <Head heading={section.props.heading} />
        <div className="vl-score">
          <strong>{avg.toFixed(1)}</strong>
          <div><Stars rating={Math.round(avg)} /><span>{items.length} {items.length === 1 ? "review" : "reviews"}</span></div>
        </div>
      </div>
      <ul className="vl-cards">
        {items.map((r, i) => (
          <li key={i} className="vl-card vl-review">
            <Stars rating={r.rating} />
            <blockquote>“{r.quote}”</blockquote>
            <footer><span className="vl-avatar" aria-hidden="true">{initials(r.author)}</span><cite>{r.author}</cite></footer>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

function Faq({ section }: Props<"faq">) {
  const p = section.props;
  return (
    <Wrap id="faq" className="vl-faq">
      <div className="vl-faq__grid">
        <Head heading={p.heading} intro={p.intro} />
        <div className="vl-faq__list">
          {p.items.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>{f.question}<span className="vl-faq__sign" aria-hidden="true" /></summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

function Contact({ section }: Props<"contact">) {
  const p = section.props;
  const where = p.address ?? p.serviceArea;
  return (
    <Wrap id="contact" className={`vl-contact vl-contact--${section.variant}`}>
      <div className="vl-contact__grid">
        <div className="vl-contact__card">
          <Head heading={p.heading} intro={p.intro} />
          <ul className="vl-contact__list">
            <li><span className="vl-icon"><Icon name="phone" /></span><div><small>Call</small><a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>{p.phone}</a></div></li>
            {p.email && <li><span className="vl-icon"><Icon name="mail" /></span><div><small>Email</small><a href={`mailto:${p.email}`}>{p.email}</a></div></li>}
            {where && <li><span className="vl-icon"><Icon name="map-pin" /></span><div><small>{p.address ? "Visit" : "Serving"}</small><address>{where}</address></div></li>}
          </ul>
          {p.hours.length > 0 && (
            <dl className="vl-hours">
              {p.hours.map((h, i) => <div key={i}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}
            </dl>
          )}
        </div>
        {section.variant === "details-map" && where && (
          <iframe
            className="vl-map"
            title={`Map of ${where}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(where)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>
    </Wrap>
  );
}

function Cta({ section, asset }: Props<"cta">) {
  const p = section.props;
  return (
    <section className={`vl-cta${p.image ? " vl-cta--photo" : ""}`}>
      <div className="vl-wrap">
        <div className="vl-cta__band">
          {p.image && <Img image={p.image} asset={asset} className="vl-cta__bg" />}
          <div className="vl-cta__text">
            <h2>{p.heading}</h2>
            {p.subheading && <p>{p.subheading}</p>}
          </div>
          <a className="vl-button vl-button--accent" href={p.ctaHref}>{p.ctaLabel}</a>
        </div>
      </div>
    </section>
  );
}

function Highlights({ section }: Props<"highlights">) {
  return (
    <section className="vl-highlights">
      <div className="vl-wrap">
        <ul>
          {section.props.items.map((h, i) => <li key={i}><Icon name={i % 3 === 0 ? "shield" : i % 3 === 1 ? "award" : "thumbs-up"} size={20} />{h}</li>)}
        </ul>
      </div>
    </section>
  );
}

function Steps({ section }: Props<"steps">) {
  return (
    <Wrap className="vl-steps">
      <Head heading={section.props.heading} center />
      <ol>
        {section.props.items.map((s, i) => (
          <li key={i}>
            <span className="vl-steps__n">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </li>
        ))}
      </ol>
    </Wrap>
  );
}

function Community({ section, asset }: Props<"community">) {
  return (
    <Wrap id="community" className="vl-community">
      <Head heading={section.props.heading} />
      <ul className="vl-cards">
        {section.props.items.map((c, i) => (
          <li key={i} className={`vl-card${i === 0 ? " vl-card--feature" : ""}`}>
            {c.image ? <Img image={c.image} asset={asset} className="vl-card__img" /> : <ArtPanel className="vl-card__img" />}
            <div className="vl-card__body">
              {c.date && <p className="vl-chip">{c.date}</p>}
              <h3>{c.href ? <a href={c.href}>{c.title}</a> : c.title}</h3>
              <p>{c.summary}</p>
            </div>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

function Gallery({ section, asset }: Props<"gallery">) {
  return (
    <Wrap id="gallery" className="vl-gallery">
      <Head heading={section.props.heading} />
      <ul>
        {section.props.images.map((img, i) => <li key={i}><Img image={img} asset={asset} /></li>)}
      </ul>
    </Wrap>
  );
}

function Areas({ section }: Props<"areas">) {
  const p = section.props;
  return (
    <Wrap id="areas" className="vl-areas">
      <Head heading={p.heading} intro={p.intro} center />
      <ul>{p.areas.map((a, i) => <li key={i}><Icon name="map-pin" size={16} />{a}</li>)}</ul>
    </Wrap>
  );
}

export function SectionView({ section, asset }: { section: Section; asset: AssetResolver }): ReactElement {
  switch (section.type) {
    case "hero": return <Hero section={section} asset={asset} />;
    case "services": return <Services section={section} asset={asset} />;
    case "about": return <About section={section} asset={asset} />;
    case "reviews": return <Reviews section={section} asset={asset} />;
    case "faq": return <Faq section={section} asset={asset} />;
    case "contact": return <Contact section={section} asset={asset} />;
    case "cta": return <Cta section={section} asset={asset} />;
    case "highlights": return <Highlights section={section} asset={asset} />;
    case "steps": return <Steps section={section} asset={asset} />;
    case "community": return <Community section={section} asset={asset} />;
    case "gallery": return <Gallery section={section} asset={asset} />;
    case "areas": return <Areas section={section} asset={asset} />;
  }
}
