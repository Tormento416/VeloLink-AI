/** Base stylesheet shared by every generated site; themes only change the variables and wrapper classes. */
export const BASE_CSS = `
*{box-sizing:border-box}body{margin:0;background:var(--vl-bg);color:var(--vl-text);font-family:var(--vl-font-body);line-height:1.6}
.vl-site{min-height:100vh}
h1,h2,h3{font-family:var(--vl-font-heading);line-height:1.2}
section{max-width:1100px;margin:0 auto;padding:40px 20px}
img{max-width:100%;border-radius:var(--vl-radius)}
a{color:var(--vl-primary)}
.vl-button{display:inline-block;background:var(--vl-primary);color:var(--vl-on-primary);padding:12px 22px;border-radius:var(--vl-radius);text-decoration:none;font-weight:600}
.vl-hero{display:grid;gap:32px;align-items:center}.vl-hero--split{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}.vl-hero--centered{text-align:center}
.vl-hero--full-bleed{max-width:none;min-height:60vh;padding:96px max(20px,calc((100% - 1060px)/2))}
.vl-hero h1{font-size:clamp(2rem,5vw,3.2rem);margin:0 0 12px}.vl-hero p{color:var(--vl-muted);font-size:1.15rem}
.vl-hero-bg--tint .vl-hero{background:var(--vl-surface);border-radius:var(--vl-radius);margin-top:16px}
.vl-hero-bg--gradient .vl-hero{max-width:none;padding-left:max(20px,calc((100% - 1060px)/2));padding-right:max(20px,calc((100% - 1060px)/2));background:linear-gradient(135deg,var(--vl-surface),var(--vl-bg) 60%,color-mix(in srgb,var(--vl-accent) 25%,var(--vl-bg)))}
.vl-hero-bg--dark .vl-hero{max-width:none;padding-left:max(20px,calc((100% - 1060px)/2));padding-right:max(20px,calc((100% - 1060px)/2));background:var(--vl-primary);color:var(--vl-on-primary)}
.vl-hero-bg--dark .vl-hero p{color:inherit;opacity:.85}.vl-hero-bg--dark .vl-hero .vl-button{background:var(--vl-accent);color:var(--vl-on-accent)}
.vl-services ul,.vl-reviews ul,.vl-community ul{list-style:none;padding:0;display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.vl-services li,.vl-reviews li,.vl-community li,.vl-steps li{background:var(--vl-surface);padding:20px;border-radius:var(--vl-radius)}
.vl-cards--outline :is(.vl-services,.vl-reviews,.vl-community,.vl-steps) li{background:var(--vl-bg);border:1px solid color-mix(in srgb,var(--vl-text) 14%,transparent)}
.vl-cards--shadow :is(.vl-services,.vl-reviews,.vl-community,.vl-steps) li{background:var(--vl-bg);box-shadow:0 1px 2px rgb(0 0 0/.06),0 8px 24px rgb(0 0 0/.08)}
.vl-services--list ul{grid-template-columns:1fr}
.vl-about--image-left{display:grid;gap:32px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.vl-reviews blockquote{margin:8px 0}.vl-reviews cite{color:var(--vl-muted)}
.vl-faq details{border-bottom:1px solid var(--vl-surface);padding:12px 0}.vl-faq summary{cursor:pointer;font-weight:600}
.vl-contact dl div{display:flex;gap:12px}.vl-contact dt{font-weight:600;min-width:120px}
.vl-cta{text-align:center;background:var(--vl-surface);border-radius:var(--vl-radius)}
.vl-hero-bg--dark .vl-cta{background:linear-gradient(135deg,var(--vl-primary),color-mix(in srgb,var(--vl-primary) 70%,var(--vl-accent)));color:var(--vl-on-primary)}
.vl-hero-bg--dark .vl-cta .vl-button{background:var(--vl-accent);color:var(--vl-on-accent)}
.vl-highlights{padding-top:24px;padding-bottom:24px}
.vl-highlights ul{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.vl-highlights li{background:var(--vl-accent);color:var(--vl-on-accent);padding:8px 16px;border-radius:999px;font-weight:600;font-size:.95rem}
.vl-steps ol{list-style:none;padding:0;display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));counter-reset:vl-step}
.vl-steps li{counter-increment:vl-step}.vl-steps li::before{content:counter(vl-step);display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--vl-accent);color:var(--vl-on-accent);font-weight:700}
.vl-community__date{color:var(--vl-muted);font-size:.9rem;margin:0}.vl-community h3 a{color:inherit}
.vl-nav{display:flex;gap:16px;flex-wrap:wrap;max-width:1100px;margin:0 auto;padding:16px 20px;align-items:center}
.vl-motion--subtle .vl-nav{position:sticky;top:0;z-index:10;max-width:none;padding-left:max(20px,calc((100% - 1060px)/2));padding-right:max(20px,calc((100% - 1060px)/2));background:color-mix(in srgb,var(--vl-bg) 85%,transparent);backdrop-filter:blur(8px)}
.vl-nav strong{margin-right:auto}.vl-nav a{color:var(--vl-text);text-decoration:none}.vl-nav a[aria-current=page]{color:var(--vl-primary);font-weight:600}
footer{text-align:center;color:var(--vl-muted);padding:32px 20px}
.vl-social{list-style:none;padding:0;display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
@media (prefers-reduced-motion:no-preference){
.vl-motion--subtle main>section{animation:vl-rise .6s ease-out both}
.vl-motion--subtle :is(.vl-services,.vl-community) li,.vl-motion--subtle .vl-button{transition:transform .2s ease,box-shadow .2s ease}
.vl-motion--subtle :is(.vl-services,.vl-community) li:hover,.vl-motion--subtle .vl-button:hover{transform:translateY(-3px)}
@keyframes vl-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
}
`;
