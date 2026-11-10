import type { ReactElement } from "react";
import type { Section } from "../sections/schemas";

export type AssetResolver = (assetId: string) => string;

type Props<T extends Section["type"]> = {
  section: Extract<Section, { type: T }>;
  asset: AssetResolver;
};

function Hero({ section, asset }: Props<"hero">) {
  const p = section.props;
  return (
    <section className={`vl-hero vl-hero--${section.variant}`}>
      <div className="vl-hero__text">
        <h1>{p.headline}</h1>
        {p.subheadline && <p>{p.subheadline}</p>}
        <a className="vl-button" href={p.ctaHref}>{p.ctaLabel}</a>
      </div>
      {p.image && <img src={asset(p.image.assetId)} alt={p.image.alt} />}
    </section>
  );
}

function Services({ section }: Props<"services">) {
  return (
    <section className={`vl-services vl-services--${section.variant}`}>
      <h2>{section.props.heading}</h2>
      <ul>
        {section.props.items.map((item, i) => (
          <li key={i}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function About({ section, asset }: Props<"about">) {
  const p = section.props;
  return (
    <section className={`vl-about vl-about--${section.variant}`}>
      {p.image && <img src={asset(p.image.assetId)} alt={p.image.alt} />}
      <div>
        <h2>{p.heading}</h2>
        {p.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </section>
  );
}

function Reviews({ section }: Props<"reviews">) {
  return (
    <section className="vl-reviews">
      <h2>{section.props.heading}</h2>
      <ul>
        {section.props.items.map((r, i) => (
          <li key={i}>
            <p aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}</p>
            <blockquote>{r.quote}</blockquote>
            <cite>{r.author}</cite>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Faq({ section }: Props<"faq">) {
  return (
    <section className="vl-faq">
      <h2>{section.props.heading}</h2>
      {section.props.items.map((f, i) => (
        <details key={i}>
          <summary>{f.question}</summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </section>
  );
}

function Contact({ section }: Props<"contact">) {
  const p = section.props;
  return (
    <section className="vl-contact" id="contact">
      <h2>{p.heading}</h2>
      <p><a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>{p.phone}</a></p>
      {p.email && <p><a href={`mailto:${p.email}`}>{p.email}</a></p>}
      {p.address && <address>{p.address}</address>}
      {p.hours.length > 0 && (
        <dl>
          {p.hours.map((h, i) => (
            <div key={i}><dt>{h.days}</dt><dd>{h.time}</dd></div>
          ))}
        </dl>
      )}
    </section>
  );
}

function Cta({ section }: Props<"cta">) {
  return (
    <section className="vl-cta">
      <h2>{section.props.heading}</h2>
      <a className="vl-button" href={section.props.ctaHref}>{section.props.ctaLabel}</a>
    </section>
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
  }
}
