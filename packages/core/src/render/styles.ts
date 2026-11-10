/** Base stylesheet shared by every generated site; themes only change the variables. */
export const BASE_CSS = `
*{box-sizing:border-box}body{margin:0;background:var(--vl-bg);color:var(--vl-text);font-family:var(--vl-font-body);line-height:1.6}
h1,h2,h3{font-family:var(--vl-font-heading);line-height:1.2}
section{max-width:1100px;margin:0 auto;padding:56px 20px}
img{max-width:100%;border-radius:var(--vl-radius)}
.vl-button{display:inline-block;background:var(--vl-primary);color:var(--vl-on-primary);padding:12px 22px;border-radius:var(--vl-radius);text-decoration:none;font-weight:600}
.vl-hero{display:grid;gap:32px;align-items:center}.vl-hero--split{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}.vl-hero--centered{text-align:center}
.vl-hero h1{font-size:clamp(2rem,5vw,3.2rem);margin:0 0 12px}.vl-hero p{color:var(--vl-muted);font-size:1.15rem}
.vl-services ul,.vl-reviews ul{list-style:none;padding:0;display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.vl-services li,.vl-reviews li{background:var(--vl-surface);padding:20px;border-radius:var(--vl-radius)}
.vl-about--image-left{display:grid;gap:32px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.vl-reviews blockquote{margin:8px 0}.vl-reviews cite{color:var(--vl-muted)}
.vl-faq details{border-bottom:1px solid var(--vl-surface);padding:12px 0}.vl-faq summary{cursor:pointer;font-weight:600}
.vl-contact dl div{display:flex;gap:12px}.vl-contact dt{font-weight:600;min-width:120px}
.vl-cta{text-align:center;background:var(--vl-surface);border-radius:var(--vl-radius)}
.vl-nav{display:flex;gap:16px;flex-wrap:wrap;max-width:1100px;margin:0 auto;padding:16px 20px;align-items:center}
.vl-nav strong{margin-right:auto}.vl-nav a{color:var(--vl-text);text-decoration:none}
footer{text-align:center;color:var(--vl-muted);padding:32px 20px}
`;
