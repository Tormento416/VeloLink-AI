/**
 * Stylesheet shared by every generated site. Themes set the variables;
 * the skin class (one per template) changes layout and ornament.
 */
const BASE = `
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--vl-bg);color:var(--vl-text);font-family:var(--vl-font-body);font-size:17px;line-height:1.65;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%;height:auto}
a{color:var(--vl-primary)}
h1,h2,h3{font-family:var(--vl-font-heading);line-height:1.12;letter-spacing:-.015em;margin:0 0 .5em;color:var(--vl-heading,var(--vl-text))}
h1{font-size:clamp(2.4rem,5.6vw,4.2rem)}h2{font-size:clamp(1.8rem,3.4vw,2.6rem)}h3{font-size:1.2rem}
p{margin:0 0 1em}
.vl-site{--vl-line:color-mix(in srgb,var(--vl-text) 12%,transparent);--vl-soft:color-mix(in srgb,var(--vl-primary) 8%,var(--vl-bg));min-height:100vh;overflow-x:clip}
.vl-wrap{max-width:1180px;margin:0 auto;padding:0 24px}
main>section{padding:96px 0}
.vl-skip{position:absolute;left:-999px}.vl-skip:focus{left:16px;top:16px;z-index:99;background:var(--vl-bg);padding:8px 12px}
:focus-visible{outline:3px solid var(--vl-accent);outline-offset:2px}

/* Buttons */
.vl-button{display:inline-flex;align-items:center;gap:10px;background:var(--vl-primary);color:var(--vl-on-primary);padding:15px 28px;border-radius:var(--vl-btn-radius,var(--vl-radius));text-decoration:none;font-weight:650;font-size:1rem;border:2px solid transparent;box-shadow:0 10px 24px -12px color-mix(in srgb,var(--vl-primary) 70%,transparent);transition:transform .2s ease,box-shadow .2s ease,background .2s ease}
.vl-button:hover{transform:translateY(-2px);box-shadow:0 16px 30px -14px color-mix(in srgb,var(--vl-primary) 80%,transparent)}
.vl-button--ghost{background:transparent;color:inherit;border-color:currentColor;box-shadow:none}
.vl-button--accent{background:var(--vl-accent);color:var(--vl-on-accent);box-shadow:none}
.vl-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:32px}
.vl-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:.8rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--vl-primary);margin-bottom:16px}
.vl-eyebrow::before{content:"";width:28px;height:2px;background:var(--vl-accent)}
.vl-head{max-width:680px;margin-bottom:48px}.vl-head h2{margin-bottom:12px}.vl-head--center{margin-left:auto;margin-right:auto;text-align:center}
.vl-intro{font-size:1.1rem;color:var(--vl-muted)}
.vl-icon{display:inline-grid;place-items:center;width:54px;height:54px;border-radius:calc(var(--vl-radius) + 4px);background:var(--vl-soft);color:var(--vl-primary);flex:none}
.vl-chip{display:inline-block;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--vl-accent);color:var(--vl-on-accent);padding:4px 10px;border-radius:999px;margin-bottom:12px}

/* Placeholder art where a photo will go */
.vl-art{position:relative;overflow:hidden;min-height:340px;height:100%;border-radius:var(--vl-radius);background:linear-gradient(140deg,var(--vl-primary),color-mix(in srgb,var(--vl-primary) 55%,var(--vl-accent)))}
.vl-art span{position:absolute;border-radius:50%;background:color-mix(in srgb,var(--vl-accent) 70%,transparent);filter:blur(2px)}
.vl-art span:nth-child(1){width:60%;aspect-ratio:1;right:-12%;top:-18%;opacity:.55}
.vl-art span:nth-child(2){width:38%;aspect-ratio:1;left:-8%;bottom:-10%;background:color-mix(in srgb,var(--vl-on-primary) 25%,transparent)}
.vl-art span:nth-child(3){width:18%;aspect-ratio:1;left:40%;top:38%;background:color-mix(in srgb,var(--vl-on-primary) 35%,transparent)}

/* Top bar and header */
.vl-topbar{background:var(--vl-primary);color:var(--vl-on-primary);font-size:.85rem}
.vl-topbar .vl-wrap{display:flex;flex-wrap:wrap;gap:8px 28px;padding-top:9px;padding-bottom:9px}
.vl-topbar span,.vl-topbar a{display:inline-flex;align-items:center;gap:7px;color:inherit;text-decoration:none;opacity:.92}
.vl-header{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--vl-bg) 88%,transparent);backdrop-filter:saturate(1.4) blur(12px);border-bottom:1px solid var(--vl-line)}
.vl-header__inner{display:flex;align-items:center;gap:32px;min-height:78px}
.vl-brand{text-decoration:none;color:var(--vl-text);margin-right:auto}
.vl-brand__name{font-family:var(--vl-font-heading);font-weight:800;font-size:1.35rem;letter-spacing:-.02em}
.vl-logo{max-height:48px;width:auto}
.vl-nav{display:flex;gap:28px}
.vl-nav a{color:var(--vl-text);text-decoration:none;font-weight:550;font-size:.97rem;position:relative;padding:6px 0}
.vl-nav a::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--vl-accent);transform:scaleX(0);transition:transform .2s ease}
.vl-nav a:hover::after,.vl-nav a[aria-current=page]::after{transform:scaleX(1)}
.vl-header__call{padding:11px 20px;font-size:.95rem}
.vl-menu{display:none}
.vl-menu summary{list-style:none;cursor:pointer;width:44px;height:44px;display:grid;place-content:center;gap:5px;border-radius:10px;border:1px solid var(--vl-line)}
.vl-menu summary::-webkit-details-marker{display:none}
.vl-menu summary span{display:block;width:20px;height:2px;background:var(--vl-text)}
.vl-menu nav{position:absolute;left:0;right:0;top:100%;background:var(--vl-bg);border-bottom:1px solid var(--vl-line);display:grid;gap:4px;padding:16px 24px 24px;box-shadow:0 20px 40px -20px rgb(0 0 0/.25)}
.vl-menu nav a{padding:12px 0;color:var(--vl-text);text-decoration:none;font-weight:600;border-bottom:1px solid var(--vl-line)}
.vl-menu nav .vl-button{justify-content:center;color:var(--vl-on-primary);margin-top:12px;border:0}

/* Hero */
.vl-hero{position:relative;padding:110px 0 120px;overflow:hidden}
.vl-hero__inner{display:grid;gap:56px;align-items:center;position:relative;z-index:1}
.vl-hero--split .vl-hero__inner{grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr)}
.vl-hero__inner>*,.vl-about__grid>*,.vl-faq__grid>*,.vl-contact__grid>*{min-width:0}
.vl-hero--centered .vl-hero__inner{text-align:center;justify-items:center}
.vl-hero--centered .vl-hero__text{max-width:820px}.vl-hero--centered .vl-actions{justify-content:center}
.vl-hero h1{margin-bottom:22px}
.vl-hero__sub{font-size:clamp(1.1rem,1.6vw,1.3rem);color:var(--vl-muted);max-width:600px}
.vl-hero--centered .vl-hero__sub{margin-left:auto;margin-right:auto}
.vl-hero__media{position:relative}
.vl-hero__media img,.vl-hero__media .vl-art{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:calc(var(--vl-radius) * 1.5);box-shadow:0 40px 80px -40px rgb(0 0 0/.45)}
.vl-hero__media--wide img{aspect-ratio:16/7}
.vl-hero--full-bleed{min-height:78vh;display:flex;align-items:center}
.vl-hero--full-bleed .vl-hero__inner{width:100%}
.vl-hero--full-bleed .vl-hero__text{max-width:720px}
.vl-hero__bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.vl-hero--photo{color:#fff}.vl-hero--photo::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(100deg,rgb(8 10 20/.82) 10%,rgb(8 10 20/.35) 75%)}
.vl-hero--photo h1,.vl-hero--photo .vl-hero__sub{color:#fff}.vl-hero--photo .vl-eyebrow{color:#fff}

/* Highlights strip */
.vl-highlights{padding:0!important;background:var(--vl-surface);border-top:1px solid var(--vl-line);border-bottom:1px solid var(--vl-line)}
.vl-highlights ul{list-style:none;margin:0;padding:22px 0;display:flex;flex-wrap:wrap;justify-content:space-around;gap:16px 40px}
.vl-highlights li{display:flex;align-items:center;gap:10px;font-weight:650}
.vl-highlights svg{color:var(--vl-primary)}

/* Cards */
.vl-cards{list-style:none;margin:0;padding:0;display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.vl-card{position:relative;display:flex;flex-direction:column;background:var(--vl-bg);border:1px solid var(--vl-line);border-radius:calc(var(--vl-radius) + 4px);overflow:hidden;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.vl-card:hover{transform:translateY(-4px);box-shadow:0 24px 48px -28px rgb(0 0 0/.35);border-color:transparent}
.vl-card__body{padding:30px}
.vl-card__img{width:100%;aspect-ratio:16/10;object-fit:cover;min-height:0;border-radius:0}
.vl-card .vl-icon{margin-bottom:22px}
.vl-card h3{margin-bottom:10px}.vl-card p{color:var(--vl-muted);margin:0}
.vl-services--list .vl-cards{grid-template-columns:1fr 1fr}
.vl-services--list .vl-card__body{display:grid;grid-template-columns:auto 1fr;column-gap:22px}
.vl-services--list .vl-card .vl-icon{grid-row:span 2;margin:0}

/* About */
.vl-about__grid{display:grid;gap:64px;align-items:center}
.vl-about--image-left .vl-about__grid{grid-template-columns:1fr 1fr}
.vl-about--text .vl-about__text{max-width:760px}
.vl-about__media img,.vl-about__media .vl-art{width:100%;aspect-ratio:5/6;object-fit:cover;border-radius:calc(var(--vl-radius) * 1.5)}
.vl-about__text>p{font-size:1.06rem}
.vl-checks{list-style:none;padding:0;margin:28px 0 0;display:grid;grid-template-columns:1fr 1fr;gap:14px 24px}
.vl-checks li{display:flex;gap:10px;align-items:flex-start;font-weight:600}
.vl-checks svg{flex:none;margin-top:3px;color:var(--vl-on-accent);background:var(--vl-accent);border-radius:50%;padding:3px;width:24px;height:24px}

/* Reviews */
.vl-reviews{background:var(--vl-surface)}
.vl-reviews__top{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:48px}
.vl-reviews__top .vl-head{margin:0}
.vl-score{display:flex;align-items:center;gap:16px;background:var(--vl-bg);padding:16px 22px;border-radius:calc(var(--vl-radius) + 4px);border:1px solid var(--vl-line)}
.vl-score strong{font-family:var(--vl-font-heading);font-size:2.6rem;line-height:1}
.vl-score span:last-child{display:block;font-size:.85rem;color:var(--vl-muted)}
.vl-stars{white-space:nowrap;color:color-mix(in srgb,var(--vl-text) 20%,transparent);letter-spacing:2px;font-size:1.05rem}.vl-stars .on{color:#f5a524}
.vl-review{padding:32px}
.vl-review blockquote{margin:16px 0 24px;font-size:1.08rem;line-height:1.6;color:var(--vl-text)}
.vl-review footer{display:flex;align-items:center;gap:12px;margin-top:auto}
.vl-avatar{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--vl-primary);color:var(--vl-on-primary);font-weight:700;font-size:.9rem}
.vl-review cite{font-style:normal;font-weight:700}

/* Steps */
.vl-steps ol{list-style:none;margin:0;padding:0;display:grid;gap:28px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));position:relative}
.vl-steps li{position:relative;padding:32px;border-radius:calc(var(--vl-radius) + 4px);background:var(--vl-surface)}
.vl-steps__n{display:block;font-family:var(--vl-font-heading);font-size:2.6rem;font-weight:800;line-height:1;color:var(--vl-primary);margin-bottom:18px;opacity:.9}
.vl-steps p{color:var(--vl-muted);margin:0}

/* FAQ */
.vl-faq__grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:64px;align-items:start}
.vl-faq__list{display:grid;gap:14px}
.vl-faq details{border:1px solid var(--vl-line);border-radius:calc(var(--vl-radius) + 2px);background:var(--vl-bg);padding:0 26px;transition:box-shadow .2s ease}
.vl-faq details[open]{box-shadow:0 18px 40px -28px rgb(0 0 0/.35)}
.vl-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:22px 0;font-weight:650;font-size:1.06rem}
.vl-faq summary::-webkit-details-marker{display:none}
.vl-faq__sign{position:relative;flex:none;width:28px;height:28px;border-radius:50%;background:var(--vl-soft)}
.vl-faq__sign::before,.vl-faq__sign::after{content:"";position:absolute;left:8px;right:8px;top:13px;height:2px;background:var(--vl-primary);transition:transform .2s ease}
.vl-faq__sign::after{transform:rotate(90deg)}.vl-faq details[open] .vl-faq__sign::after{transform:rotate(0)}
.vl-faq details p{color:var(--vl-muted);padding-bottom:22px;margin:0}

/* Contact */
.vl-contact__grid{display:grid;gap:32px;align-items:stretch}
.vl-contact--details-map .vl-contact__grid{grid-template-columns:1fr 1.1fr}
.vl-contact__card{background:var(--vl-surface);border-radius:calc(var(--vl-radius) * 1.5 + 4px);padding:48px}
.vl-contact__card .vl-head{margin-bottom:32px}
.vl-contact__list{list-style:none;padding:0;margin:0;display:grid;gap:22px}
.vl-contact__list li{display:flex;gap:16px;align-items:center}
.vl-contact__list small{display:block;font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--vl-muted)}
.vl-contact__list a,.vl-contact__list address{font-style:normal;font-size:1.15rem;font-weight:650;color:var(--vl-text);text-decoration:none}
.vl-hours{margin:32px 0 0;padding-top:24px;border-top:1px solid var(--vl-line);display:grid;gap:8px}
.vl-hours div{display:flex;justify-content:space-between;gap:16px}.vl-hours dt{font-weight:650}.vl-hours dd{margin:0;color:var(--vl-muted)}
.vl-map{width:100%;height:100%;min-height:420px;border:0;border-radius:calc(var(--vl-radius) * 1.5 + 4px)}

/* CTA band */
.vl-cta{padding:40px 0 96px!important}
.vl-cta__band{position:relative;overflow:hidden;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:28px;padding:64px;border-radius:calc(var(--vl-radius) * 2 + 4px);background:linear-gradient(120deg,var(--vl-primary),color-mix(in srgb,var(--vl-primary) 62%,var(--vl-accent)));color:var(--vl-on-primary)}
.vl-cta__band::after{content:"";position:absolute;width:420px;height:420px;right:-120px;top:-200px;border-radius:50%;background:color-mix(in srgb,var(--vl-on-primary) 10%,transparent)}
.vl-cta__band h2{color:inherit;margin-bottom:8px}.vl-cta__band p{margin:0;opacity:.9;font-size:1.1rem}
.vl-cta__text{position:relative;z-index:1;max-width:640px}.vl-cta__band .vl-button{position:relative;z-index:1}
.vl-cta__bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.22;mix-blend-mode:luminosity}

/* Community */
.vl-community .vl-cards{grid-template-columns:repeat(3,1fr)}
.vl-card--feature{grid-column:span 2;grid-row:span 2}
.vl-card--feature .vl-card__img{aspect-ratio:16/9;flex:1}
.vl-card--feature h3{font-size:1.6rem}

/* Gallery */
.vl-gallery ul{list-style:none;margin:0;padding:0;display:grid;gap:16px;grid-template-columns:repeat(4,1fr);grid-auto-rows:220px}
.vl-gallery li:nth-child(5n+1){grid-column:span 2;grid-row:span 2}
.vl-gallery img{width:100%;height:100%;object-fit:cover;border-radius:var(--vl-radius)}

/* Areas */
.vl-areas{background:var(--vl-surface)}
.vl-areas ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
.vl-areas li{display:inline-flex;align-items:center;gap:8px;background:var(--vl-bg);border:1px solid var(--vl-line);padding:10px 18px;border-radius:999px;font-weight:600}
.vl-areas svg{color:var(--vl-primary)}

/* Footer */
.vl-footer{background:var(--vl-footer-bg,color-mix(in srgb,var(--vl-text) 94%,var(--vl-primary)));color:var(--vl-footer-text,#e7e9ee);padding:80px 0 0;font-size:.95rem}
.vl-footer a{color:inherit;text-decoration:none;opacity:.85}.vl-footer a:hover{opacity:1;text-decoration:underline}
.vl-footer__grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:40px;padding-bottom:56px}
.vl-footer ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.vl-footer__brand{font-family:var(--vl-font-heading);font-size:1.5rem;font-weight:800;margin-bottom:12px;color:#fff}
.vl-footer__title{font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-size:.78rem;opacity:.7;margin-bottom:16px}
.vl-social{display:flex!important;flex-wrap:wrap;gap:10px!important;margin-top:20px!important}
.vl-social a{display:inline-block;padding:8px 14px;border:1px solid rgb(255 255 255/.25);border-radius:999px;opacity:1}
.vl-footer__base{border-top:1px solid rgb(255 255 255/.14);padding-top:24px;padding-bottom:28px;opacity:.7;font-size:.85rem}

/* Responsive */
@media (max-width:960px){
  .vl-nav,.vl-header__call{display:none}.vl-menu{display:block}.vl-header{position:sticky}.vl-header__inner{position:relative;min-height:68px}
  h1{overflow-wrap:break-word}
  .vl-hero--split .vl-hero__inner,.vl-about--image-left .vl-about__grid,.vl-faq__grid,.vl-contact--details-map .vl-contact__grid{grid-template-columns:1fr}
  .vl-footer__grid{grid-template-columns:1fr 1fr}
  .vl-community .vl-cards{grid-template-columns:1fr 1fr}
  .vl-services--list .vl-cards{grid-template-columns:1fr}
  .vl-gallery ul{grid-template-columns:repeat(2,1fr);grid-auto-rows:180px}
}
@media (max-width:640px){
  body{font-size:16px}main>section{padding:64px 0}.vl-hero{padding:64px 0 72px}
  .vl-topbar{display:none}.vl-cta__band,.vl-contact__card{padding:36px 26px}
  .vl-community .vl-cards,.vl-footer__grid,.vl-checks{grid-template-columns:1fr}.vl-card--feature{grid-column:auto;grid-row:auto}
  .vl-hero__media img,.vl-hero__media .vl-art{aspect-ratio:4/3}
}
@media (prefers-reduced-motion:no-preference){
  .vl-motion--subtle main>section{animation:vl-rise .7s cubic-bezier(.2,.7,.2,1) both}
  .vl-motion--subtle main>section:nth-child(2){animation-delay:.08s}
  @keyframes vl-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
`;

/** Per-template layout and ornament. Keyed by template id. */
const SKINS = `
/* Essential: editorial, square, quiet */
.vl-skin--essential{--vl-btn-radius:0;--vl-footer-bg:#1f1b18}
.vl-skin--essential .vl-topbar{background:var(--vl-surface);color:var(--vl-text)}
.vl-skin--essential .vl-header{background:var(--vl-bg)}
.vl-skin--essential .vl-hero{padding:140px 0 120px;border-bottom:1px solid var(--vl-line)}
.vl-skin--essential .vl-hero h1{font-size:clamp(2.8rem,7vw,5.4rem);font-weight:500;letter-spacing:-.03em}
.vl-skin--essential .vl-hero h1::after{content:"";display:block;width:84px;height:4px;background:var(--vl-primary);margin:32px auto 0}
.vl-skin--essential h2{font-weight:500}
.vl-skin--essential .vl-card{border:0;border-top:1px solid var(--vl-line);border-radius:0;background:transparent}
.vl-skin--essential .vl-card:hover{box-shadow:none;transform:none;border-color:var(--vl-primary)}
.vl-skin--essential .vl-card__body{padding:30px 0}
.vl-skin--essential .vl-icon{background:transparent;border:1px solid var(--vl-line);border-radius:0}
.vl-skin--essential .vl-reviews{background:var(--vl-bg)}
.vl-skin--essential .vl-review{background:var(--vl-surface);padding:36px}
.vl-skin--essential .vl-review blockquote{font-family:var(--vl-font-heading);font-size:1.3rem}
.vl-skin--essential .vl-cta__band{background:var(--vl-surface);color:var(--vl-text);border-radius:0;border-left:6px solid var(--vl-primary)}
.vl-skin--essential .vl-cta__band::after{display:none}
.vl-skin--essential .vl-cta__band .vl-button{background:var(--vl-primary);color:var(--vl-on-primary)}
.vl-skin--essential .vl-steps li{background:transparent;border-top:2px solid var(--vl-text);border-radius:0;padding:28px 0}

/* Momentum: dark, energetic, lime */
.vl-skin--momentum{--vl-btn-radius:999px;--vl-footer-bg:#071426}
.vl-skin--momentum .vl-topbar{background:#071426}
.vl-skin--momentum .vl-hero{background:var(--vl-primary);color:var(--vl-on-primary);padding:120px 0 140px}
.vl-skin--momentum .vl-hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgb(255 255 255/.05) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255/.05) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse at 70% 40%,#000 20%,transparent 75%)}
.vl-skin--momentum .vl-hero::after{content:"";position:absolute;width:520px;height:520px;right:-120px;top:-160px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--vl-accent) 55%,transparent),transparent 65%)}
.vl-skin--momentum .vl-hero h1{color:#fff;font-weight:700;text-transform:none}
.vl-skin--momentum .vl-hero .vl-hero__sub{color:rgb(255 255 255/.78)}
.vl-skin--momentum .vl-hero .vl-eyebrow{color:var(--vl-accent)}
.vl-skin--momentum .vl-hero .vl-button{background:var(--vl-accent);color:var(--vl-on-accent)}
.vl-skin--momentum .vl-hero .vl-button--ghost{background:transparent;color:#fff;border-color:rgb(255 255 255/.4)}
.vl-skin--momentum .vl-hero__media img,.vl-skin--momentum .vl-hero__media .vl-art{transform:rotate(2deg);border:6px solid rgb(255 255 255/.08)}
.vl-skin--momentum .vl-highlights{background:var(--vl-accent);color:var(--vl-on-accent);border:0}
.vl-skin--momentum .vl-highlights svg{color:var(--vl-on-accent)}
.vl-skin--momentum .vl-card{border:0;box-shadow:0 2px 4px rgb(11 31 58/.04),0 18px 40px -24px rgb(11 31 58/.3)}
.vl-skin--momentum .vl-card::before{content:"";position:absolute;left:0;top:0;height:4px;width:100%;background:var(--vl-accent);transform:scaleX(.18);transform-origin:left;transition:transform .3s ease}
.vl-skin--momentum .vl-card:hover::before{transform:scaleX(1)}
.vl-skin--momentum .vl-icon{background:var(--vl-primary);color:var(--vl-accent)}
.vl-skin--momentum h2{font-weight:700;letter-spacing:-.03em}
.vl-skin--momentum .vl-cta__band{background:var(--vl-primary)}
.vl-skin--momentum .vl-cta__band::after{background:radial-gradient(circle,color-mix(in srgb,var(--vl-accent) 45%,transparent),transparent 70%)}
.vl-skin--momentum .vl-steps__n{color:var(--vl-accent);-webkit-text-stroke:1px var(--vl-primary)}

/* Flow: soft gradients, rounded, airy */
.vl-skin--flow{--vl-btn-radius:999px;--vl-footer-bg:#14213d}
.vl-skin--flow .vl-topbar{background:linear-gradient(90deg,var(--vl-primary),color-mix(in srgb,var(--vl-primary) 70%,var(--vl-accent)))}
.vl-skin--flow .vl-hero{background:radial-gradient(1000px 500px at 85% 10%,color-mix(in srgb,var(--vl-accent) 28%,transparent),transparent 60%),radial-gradient(900px 600px at 0% 100%,color-mix(in srgb,var(--vl-primary) 16%,transparent),transparent 60%),var(--vl-surface);padding-bottom:160px}
.vl-skin--flow .vl-hero::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:90px;background:var(--vl-bg);clip-path:ellipse(75% 100% at 50% 100%)}
.vl-skin--flow .vl-card{border:0;background:var(--vl-bg);box-shadow:0 1px 2px rgb(20 33 61/.05),0 20px 50px -30px rgb(20 33 61/.35)}
.vl-skin--flow .vl-icon{border-radius:50%;background:linear-gradient(135deg,var(--vl-soft),color-mix(in srgb,var(--vl-accent) 20%,var(--vl-bg)))}
.vl-skin--flow .vl-steps ol::before{content:"";position:absolute;left:8%;right:8%;top:58px;height:2px;background:repeating-linear-gradient(90deg,var(--vl-accent) 0 10px,transparent 10px 18px)}
.vl-skin--flow .vl-steps li{background:var(--vl-bg);text-align:center;box-shadow:0 20px 50px -30px rgb(20 33 61/.35)}
.vl-skin--flow .vl-steps__n{display:inline-grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--vl-accent);color:var(--vl-on-accent);font-size:1.3rem;position:relative}
.vl-skin--flow .vl-reviews{background:linear-gradient(180deg,var(--vl-bg),var(--vl-surface))}
.vl-skin--flow .vl-hero__media img,.vl-skin--flow .vl-hero__media .vl-art{border-radius:200px 200px 32px 32px}

/* Signature: refined, gold rules, serif */
.vl-skin--signature{--vl-btn-radius:2px;--vl-footer-bg:#1d1a40}
.vl-skin--signature .vl-topbar{background:#1d1a40;letter-spacing:.04em}
.vl-skin--signature .vl-hero{background:var(--vl-primary);color:var(--vl-on-primary)}
.vl-skin--signature .vl-hero:not(.vl-hero--photo)::before{content:"";position:absolute;inset:24px;border:1px solid color-mix(in srgb,var(--vl-accent) 55%,transparent);pointer-events:none}
.vl-skin--signature .vl-hero h1{color:#fff;font-weight:500;font-style:italic}
.vl-skin--signature .vl-hero .vl-hero__sub{color:rgb(255 255 255/.8)}
.vl-skin--signature .vl-hero .vl-eyebrow,.vl-skin--signature .vl-eyebrow{color:var(--vl-accent);letter-spacing:.3em}
.vl-skin--signature .vl-hero .vl-button{background:var(--vl-accent);color:var(--vl-on-accent)}
.vl-skin--signature .vl-hero .vl-button--ghost{background:transparent;color:#fff;border-color:var(--vl-accent)}
.vl-skin--signature h2{font-weight:500}
.vl-skin--signature .vl-head h2::after{content:"";display:block;width:56px;height:1px;background:var(--vl-accent);margin-top:20px}
.vl-skin--signature .vl-head--center h2::after{margin-left:auto;margin-right:auto}
.vl-skin--signature .vl-card{border-color:color-mix(in srgb,var(--vl-accent) 40%,transparent)}
.vl-skin--signature .vl-icon{background:transparent;border:1px solid var(--vl-accent);color:var(--vl-accent);border-radius:50%}
.vl-skin--signature .vl-highlights{background:var(--vl-bg)}
.vl-skin--signature .vl-highlights svg{color:var(--vl-accent)}
.vl-skin--signature .vl-review blockquote{font-family:var(--vl-font-heading);font-style:italic;font-size:1.25rem}
.vl-skin--signature .vl-cta__band{background:var(--vl-primary);border:1px solid var(--vl-accent)}
.vl-skin--signature .vl-cta__band::after{display:none}
.vl-skin--signature .vl-about__media img,.vl-skin--signature .vl-about__media .vl-art{box-shadow:24px 24px 0 -1px var(--vl-surface),24px 24px 0 0 var(--vl-accent)}

/* Hometown: bold, friendly, community */
.vl-skin--hometown{--vl-btn-radius:12px;--vl-footer-bg:#0f1b3d}
.vl-skin--hometown .vl-hero{background:var(--vl-surface)}
.vl-skin--hometown .vl-hero h1{font-weight:800;letter-spacing:-.035em}
.vl-skin--hometown .vl-hero h1::first-line{color:var(--vl-primary)}
.vl-skin--hometown .vl-hero__media::before{content:"";position:absolute;inset:-18px 18px 18px -18px;border-radius:calc(var(--vl-radius) * 1.5);background:var(--vl-accent);z-index:-1}
.vl-skin--hometown .vl-highlights{background:var(--vl-primary);color:var(--vl-on-primary);border:0}
.vl-skin--hometown .vl-highlights svg{color:var(--vl-accent)}
.vl-skin--hometown h2{font-weight:800;letter-spacing:-.03em}
.vl-skin--hometown .vl-icon{background:color-mix(in srgb,var(--vl-accent) 18%,var(--vl-bg));color:color-mix(in srgb,var(--vl-accent) 60%,#000)}
.vl-skin--hometown .vl-community{background:linear-gradient(180deg,var(--vl-bg),var(--vl-surface))}
.vl-skin--hometown .vl-cta__band{background:linear-gradient(120deg,var(--vl-primary) 40%,color-mix(in srgb,var(--vl-accent) 85%,var(--vl-primary)))}
`;

export const BASE_CSS = BASE + SKINS;
