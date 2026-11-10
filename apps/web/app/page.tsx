import { Package, TEMPLATES } from "@velolink/core";

const PACKAGE_LABEL: Record<Package, string> = { single_page: "Single page", five_page: "5 page", seven_plus_page: "7+ page" };

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>VeloLink Builder</h1>
      <h2>Templates</h2>
      <ul>
        {TEMPLATES.map((t) => (
          <li key={t.id} style={{ marginBottom: 12 }}>
            <strong>{t.name}</strong> (v{t.version}): {t.description}
            <br />
            Preview:{" "}
            {Package.options.map((pkg, i) => (
              <span key={pkg}>
                {i > 0 && " · "}
                <a href={`/preview/${t.id}/${pkg}`}>{PACKAGE_LABEL[pkg]}</a>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </main>
  );
}
