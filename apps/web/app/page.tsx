import { TEMPLATES } from "@velolink/core";

const PACKAGE_LABEL = { single_page: "Single page", five_page: "5 page", seven_plus_page: "7+ page" } as const;

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>VeloLink Builder</h1>
      <h2>Templates</h2>
      <ul>
        {TEMPLATES.map((t) => (
          <li key={t.id}>
            <a href={`/preview/${t.id}`}>{t.name}</a> · {PACKAGE_LABEL[t.package]} · v{t.version}
          </li>
        ))}
      </ul>
    </main>
  );
}
