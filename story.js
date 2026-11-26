/* Visual story renderer.
   storyHTML(blocks, opts) -> HTML string (server-safe). enhanceStory(root, opts) -> wires scroll steps, camera, toggles, sliders.
   Used by the Claude preview and, unchanged, by the Framer "CaseStory" code component. */

export const STORY_CSS = `
.st{--ac:var(--accent,#2F5BFF);--st-ink:var(--ink,#0C0E13);--st-ink2:var(--ink-2,#5B616E);--st-line:var(--line,rgba(12,14,19,.09));--st-bg:var(--bg,#F3F4F6);--st-surf:var(--surface,#fff);--st-r:22px;color:var(--st-ink)}
.st *{box-sizing:border-box}
.st-b{margin:clamp(56px,8vw,112px) 0 0}
.st-b.tight{margin-top:clamp(28px,4vw,48px)}
.st em.s,.st .s{font-family:var(--f-serif,Georgia,serif);font-style:italic;font-weight:400;letter-spacing:-.01em}
.st .k{font-family:var(--f-mono,ui-monospace,monospace);font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:500;color:var(--st-ink2)}
.st .k.ac{color:var(--ac)}
.st p{margin:0}
.st b{font-weight:650;color:var(--st-ink)}
.st h2,.st h3,.st h4{margin:0;font-family:var(--f-display,inherit);font-weight:650;letter-spacing:-.04em;line-height:1.04;text-wrap:balance}
.st-p{font-size:clamp(17px,1.35vw,19px);line-height:1.65;color:var(--st-ink2);max-width:62ch}
/* TL;DR */
.st-tldr{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.st-tldr div{background:var(--st-surf);border:1px solid var(--st-line);border-radius:var(--st-r);padding:22px 22px 24px}
.st-tldr p{margin-top:10px;font-size:16px;line-height:1.5;color:var(--st-ink)}
/* chapter */
.st-ch{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;max-width:980px;padding-top:clamp(24px,4vw,56px);border-top:1px solid var(--st-line)}
.st-ch .n{display:flex;align-items:baseline;gap:14px}
.st-ch .n i{font-family:var(--f-serif,Georgia,serif);font-size:30px;color:var(--ac);font-style:italic;line-height:1}
.st-ch h2{font-size:clamp(34px,4.6vw,68px);letter-spacing:-.05em;line-height:1.02;max-width:18ch}
.st-ch .st-p{font-size:clamp(18px,1.5vw,21px)}
/* lead */
.st-lead{font-family:var(--f-display,inherit);font-size:clamp(26px,3vw,44px);line-height:1.18;letter-spacing:-.035em;font-weight:500;max-width:28ch;text-wrap:balance}
.st-lead .s{color:var(--ac)}
/* media + frames */
.st-fig{margin:0}
.st-fig figcaption{margin-top:14px;font-size:14px;color:var(--st-ink2);max-width:70ch}
.st-frame{border-radius:var(--st-r);overflow:hidden;background:var(--fbg,var(--st-surf));border:1px solid var(--st-line);position:relative}
.st-frame>img{display:block;width:100%;height:auto}
.st-frame.pad{padding:clamp(18px,4vw,48px)}
.st-frame.pad>img{border-radius:10px;box-shadow:0 30px 60px -36px rgba(12,14,19,.45)}
.st-bar{height:34px;display:flex;align-items:center;gap:7px;padding:0 14px;background:#F6F6F7;border-bottom:1px solid var(--st-line)}
.st-bar i{width:10px;height:10px;border-radius:50%;background:#E4E4E7}
.st-bar i:nth-child(1){background:#FF5F57}.st-bar i:nth-child(2){background:#FEBC2E}.st-bar i:nth-child(3){background:#28C840}
.st-bar span{margin-left:auto;margin-right:auto;width:min(46%,320px);height:18px;border-radius:6px;background:#EAEAEC}
.st-phone{width:min(300px,78%);margin:0 auto;border-radius:44px;background:#141416;padding:10px;box-shadow:0 40px 80px -40px rgba(12,14,19,.55)}
.st-phone img{display:block;width:100%;border-radius:34px}
.st-pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.st-pair.three{grid-template-columns:repeat(3,1fr)}
/* cards */
.st-cards{display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));gap:14px}
.st-card{background:var(--st-surf);border:1px solid var(--st-line);border-radius:var(--st-r);padding:24px;display:grid;align-content:start;gap:10px}
.st-card .ic{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--ac) 10%,transparent);color:var(--ac);margin-bottom:6px}
.st-card .ic svg{width:22px;height:22px}
.st-card h4{font-size:20px;letter-spacing:-.025em;line-height:1.2}
.st-card p{font-size:15px;line-height:1.55;color:var(--st-ink2)}
.st-card.dark{background:var(--st-ink);color:#fff;border-color:transparent}.st-card.dark p{color:rgba(255,255,255,.7)}
/* quotes */
.st-quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:clamp(24px,4vw,56px)}
.st-quotes blockquote{margin:0;border-top:2px solid var(--st-ink);padding-top:24px}
.st-quotes blockquote p{font-family:var(--f-serif,Georgia,serif);font-style:italic;font-size:clamp(30px,3.4vw,46px);line-height:1.06;letter-spacing:-.01em}
.st-quotes footer{margin-top:14px;font-size:14px;color:var(--st-ink2)}
/* reframe */
.st-reframe{display:grid;gap:18px;max-width:900px}
.st-reframe .old{font-size:clamp(22px,2.4vw,32px);color:var(--st-ink2);text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--ac) 70%,transparent);text-decoration-thickness:2px}
.st-reframe .new{font-family:var(--f-display,inherit);font-size:clamp(30px,4vw,58px);line-height:1.04;letter-spacing:-.045em;font-weight:600}
.st-reframe .new .s{color:var(--ac)}
/* stats */
.st-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}
.st-stats div{background:var(--st-ink);color:#fff;border-radius:var(--st-r);padding:28px 26px 26px}
.st-stats b{display:block;color:#fff;font-family:var(--f-display,inherit);font-weight:600;font-size:clamp(44px,5vw,72px);letter-spacing:-.05em;line-height:.95}
.st-stats span{display:block;margin-top:12px;font-size:15px;color:rgba(255,255,255,.7)}
.st-stats:has(>div:only-child){max-width:400px}
.st-stats.light div{background:var(--st-surf);color:var(--st-ink);border:1px solid var(--st-line)}.st-stats.light b{color:var(--ac)}.st-stats.light span{color:var(--st-ink2)}
/* flow */
.st-flow{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:0;counter-reset:f;position:relative}
.st-flow>div{position:relative;padding:0 16px 0 0}
.st-flow>div::before{content:"";display:block;height:2px;background:var(--st-ink);margin:15px 0 22px 30px}
.st-flow>div:last-child::before{background:transparent}
.st-flow>div .d{position:absolute;left:0;top:0;width:32px;height:32px;border-radius:50%;background:var(--st-ink);color:#fff;display:grid;place-items:center;font:600 13px/1 var(--f-mono,monospace)}
.st-flow>div.hl .d{background:var(--ac)}
.st-flow>div.later .d{background:var(--st-surf);color:var(--st-ink2);border:1.5px dashed var(--st-ink2)}
.st-flow>div.later::before{background:repeating-linear-gradient(90deg,var(--st-ink2) 0 6px,transparent 6px 11px)}
.st-flow>div.x .d{background:var(--st-surf);color:var(--st-ink2);border:1.5px solid var(--st-line)}
.st-flow>div.x b{color:var(--st-ink2);text-decoration:line-through}
.st-flow b{display:block;font-size:17px;letter-spacing:-.02em;line-height:1.25}
.st-flow p{margin-top:6px;font-size:14px;line-height:1.45;color:var(--st-ink2)}
.st-flowlab{margin-bottom:18px}
/* choices: designer's judgement */
.st-choices{display:grid;gap:14px}
.st-choice{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:0;background:var(--st-surf);border:1px solid var(--st-line);border-radius:var(--st-r);overflow:hidden}
.st-choice.noimg{grid-template-columns:1fr}
.st-choice .tx{padding:clamp(22px,3vw,36px);display:grid;align-content:center;gap:14px}
.st-choice .row{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:baseline}
.st-choice .row .k{font-size:11px}
.st-choice .chose{font-family:var(--f-display,inherit);font-size:clamp(21px,2vw,27px);font-weight:600;letter-spacing:-.03em;line-height:1.15}
.st-choice .over{font-size:16px;color:var(--st-ink2);text-decoration:line-through;text-decoration-color:rgba(12,14,19,.25)}
.st-choice .why{font-size:15.5px;line-height:1.55;color:var(--st-ink2);border-top:1px solid var(--st-line);padding-top:14px}
.st-choice .vis{position:relative;background:var(--vbg,#EEF0F3);min-height:280px;overflow:hidden}
.st-choice .vis>.st-cam,.st-frame>.st-cam{position:absolute;inset:0}
/* camera stage */
.st-cam{position:relative;overflow:hidden;background:var(--cbg,#EEF0F3)}
.st-cam .lay{position:absolute;left:0;top:0;transform-origin:0 0;transition:transform 1.1s cubic-bezier(.65,0,.25,1),opacity .6s;will-change:transform}
.st-cam .lay img{display:block;max-width:none;user-select:none;-webkit-user-drag:none}
.st-cam .ring{position:absolute;border:2px solid var(--ac);border-radius:10px;box-shadow:0 0 0 9999px rgba(12,14,19,.0);transition:opacity .5s;pointer-events:none}
.st-cam .pin{position:absolute;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;background:var(--ac);color:#fff;display:grid;place-items:center;font:600 12px/1 var(--f-mono,monospace);box-shadow:0 0 0 6px color-mix(in srgb,var(--ac) 25%,transparent);transform-origin:50% 50%}
.st-cam.dim .shade{position:absolute;inset:0;pointer-events:none}
/* scrolly */
.st-scrolly{display:grid;grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr);gap:clamp(24px,4vw,64px);position:relative}
.st-scrolly.right{grid-template-columns:minmax(0,1.28fr) minmax(0,.72fr)}
.st-scrolly.right .st-steps{order:2}
.st-steps{display:grid;gap:0}
.st-step{min-height:72vh;display:flex;flex-direction:column;justify-content:center;gap:12px;padding:8vh 0;opacity:.28;transition:opacity .5s}
.st-step:first-child{min-height:60vh;padding-top:12vh}
.st-step:last-child{min-height:80vh}
.st-step.on{opacity:1}
.st-step h3{font-size:clamp(26px,2.6vw,38px);letter-spacing:-.04em;line-height:1.08}
.st-step p{font-size:17px;line-height:1.6;color:var(--st-ink2);max-width:46ch}
.st-stagewrap{position:sticky;top:calc(64px + 4vh);height:calc(100vh - 64px - 8vh);display:flex;align-items:center}
.st-stage{width:100%;height:100%;border-radius:var(--st-r);overflow:hidden;position:relative;border:1px solid var(--st-line);background:var(--cbg,#EEF0F3)}
.st-stage .st-bar{position:absolute;left:0;right:0;top:0;z-index:2}
.st-stage .st-cam{position:absolute;inset:0}
.st-stage.browser .st-cam{top:34px}
.st-stage .dots{position:absolute;right:14px;bottom:14px;display:flex;gap:6px;z-index:3}
.st-stage .dots i{width:6px;height:6px;border-radius:50%;background:rgba(12,14,19,.18);transition:background .3s,transform .3s}
.st-stage .dots i.on{background:var(--ac);transform:scale(1.3)}
.st-stage.phones{display:grid;place-items:center}
.st-stage.phones .st-phone{position:absolute;width:auto;height:86%;aspect-ratio:var(--par,0.54);padding:9px;transition:opacity .6s,transform .9s cubic-bezier(.65,0,.25,1)}
.st-stage.phones .st-phone img{height:100%;object-fit:cover;object-position:top}
.st-stage.phones .st-phone.off{opacity:0;transform:translateY(24px) scale(.97)}
.st-mstage{display:none}
/* annotated */
.st-annot{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:clamp(20px,3vw,40px);align-items:start}
.st-annot .imgw{position:relative;border-radius:var(--st-r);overflow:hidden;border:1px solid var(--st-line);background:var(--st-surf)}
.st-annot .imgw img{display:block;width:100%;height:auto}
.st-annot .imgw .pin{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:var(--ac);color:#fff;display:grid;place-items:center;font:600 12px/1 var(--f-mono,monospace);box-shadow:0 0 0 6px color-mix(in srgb,var(--ac) 22%,transparent);cursor:pointer;transition:transform .3s}
.st-annot .imgw .pin.on{transform:scale(1.25)}
.st-annot ol{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.st-annot li{display:grid;grid-template-columns:30px 1fr;gap:14px;padding:16px;border-radius:16px;transition:background .3s;cursor:default}
.st-annot li.on{background:var(--st-surf)}
.st-annot li .d{width:30px;height:30px;border-radius:50%;border:1.5px solid var(--ac);color:var(--ac);display:grid;place-items:center;font:600 12px/1 var(--f-mono,monospace)}
.st-annot li b{display:block;font-size:17px;letter-spacing:-.02em;line-height:1.3}
.st-annot li p{margin-top:4px;font-size:15px;line-height:1.5;color:var(--st-ink2)}
.st-annot.dark .imgw{background:#0b0c0e}
/* toggle figure */
.st-toggle .tg{display:inline-flex;gap:2px;padding:3px;border-radius:99px;background:var(--st-surf);border:1px solid var(--st-line);margin-bottom:16px}
.st-toggle .tg button{font:500 14px/1 var(--f-body,inherit);padding:10px 18px;border-radius:99px;color:var(--st-ink2);border:0;background:transparent;cursor:pointer;transition:background .3s,color .3s}
.st-toggle .tg button[aria-pressed="true"]{background:var(--st-ink);color:#fff}
.st-toggle .panes{display:grid}
.st-toggle .pane{grid-area:1/1;transition:opacity .6s,transform .8s cubic-bezier(.65,0,.25,1)}
.st-toggle .pane.off{opacity:0;transform:scale(.985);pointer-events:none}
.st-toggle .pane .imgs{display:grid;grid-template-columns:repeat(var(--n,1),minmax(0,1fr));gap:6px;border-radius:var(--st-r);overflow:hidden;background:var(--st-ink)}
.st-toggle .pane .imgs img{display:block;width:100%;height:clamp(260px,38vw,520px);object-fit:cover}
.st-toggle .pane .cap{margin-top:16px;display:grid;gap:4px}
.st-toggle .pane .cap b{font-size:clamp(20px,2vw,26px);letter-spacing:-.03em;line-height:1.2;font-family:var(--f-display,inherit)}
.st-toggle .pane .cap p{font-size:15.5px;color:var(--st-ink2)}
/* compare slider */
.st-cmp{position:relative;border-radius:var(--st-r);overflow:hidden;border:1px solid var(--st-line);user-select:none;touch-action:pan-y}
.st-cmp img{display:block;width:100%;height:auto}
.st-cmp .top{position:absolute;inset:0;clip-path:inset(0 calc(100% - var(--x,50%)) 0 0)}
.st-cmp .top img{height:100%;object-fit:cover}
.st-cmp .h{position:absolute;top:0;bottom:0;left:var(--x,50%);width:2px;background:#fff;box-shadow:0 0 0 1px rgba(12,14,19,.15)}
.st-cmp .h::after{content:"↔";position:absolute;top:50%;left:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:18px;box-shadow:0 8px 24px rgba(12,14,19,.25)}
.st-cmp .lab{position:absolute;top:14px;padding:6px 10px;border-radius:99px;background:rgba(255,255,255,.88);font:500 11px/1 var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase}
.st-cmp .lab.l{left:14px}.st-cmp .lab.r{right:14px}
.st-cmp input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
/* bars + rank */
.st-chart{background:var(--st-surf);border:1px solid var(--st-line);border-radius:var(--st-r);padding:clamp(20px,3vw,36px)}
.st-bars{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:clamp(6px,1vw,14px);height:240px;align-items:end}
.st-bars div{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:8px;height:100%}
.st-bars div i{display:block;width:100%;border-radius:8px;background:var(--good,#00986C);height:0;transition:height 1.2s cubic-bezier(.22,1,.36,1)}
.st-bars div.bad i{background:var(--bad,#EC4F27)}
.st-bars div span{font-size:13px;font-weight:600}
.st-bars div.bad span{color:var(--bad,#EC4F27)}
.st-barsx{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:clamp(6px,1vw,14px);margin-top:10px;font:500 11px/1 var(--f-mono,monospace);color:var(--st-ink2);text-align:center}
.st-big2{display:flex;flex-wrap:wrap;gap:clamp(24px,5vw,72px);margin-bottom:28px}
.st-big2 b{display:block;font-family:var(--f-display,inherit);font-size:clamp(64px,9vw,128px);letter-spacing:-.06em;line-height:.85;font-weight:600}
.st-big2 span{display:block;margin-top:10px;font-size:14px;color:var(--st-ink2)}
.st-rank{display:grid;gap:18px}
.st-rank .r{display:grid;grid-template-columns:minmax(0,15rem) minmax(0,1fr) 2.4rem;gap:18px;align-items:center}
.st-rank .r .nm b{display:block;font-size:16px}.st-rank .r .nm span{font-size:13.5px;color:var(--st-ink2)}
.st-rank .r .tr{height:12px;border-radius:99px;background:#EEF0F3;overflow:hidden}
.st-rank .r .tr i{display:block;height:100%;border-radius:99px;background:rgba(12,14,19,.22);width:0;transition:width 1.2s cubic-bezier(.22,1,.36,1)}
.st-rank .r.top .tr i{background:var(--ac)}
.st-rank .r .sc{font-family:var(--f-display,inherit);font-size:24px;font-weight:600;text-align:right}
.st-rank .tag{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;background:var(--ac);color:#fff;vertical-align:2px}
.st-rank .tag.o{background:transparent;border:1px solid var(--ac);color:var(--ac)}
.st-rank .tag.g{background:transparent;border:1px solid var(--st-line);color:var(--st-ink2)}
/* photo stack */
.st-walk{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:14px}
.st-walk figure{margin:0}
.st-walk img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--st-r)}
.st-walk figcaption{margin-top:12px}
.st-walk figcaption b{display:block;font-size:17px;letter-spacing:-.02em;line-height:1.3;margin-top:6px}
/* diagrams */
.st-dia{background:var(--st-surf);border:1px solid var(--st-line);border-radius:var(--st-r);padding:clamp(16px,3vw,40px);overflow-x:auto;overflow-y:hidden}
.st-dia svg{display:block;width:100%;height:auto}
.st-dia svg text{font-family:var(--f-body,system-ui,sans-serif)}
.st-dia .cap{margin-top:14px;font-size:14px;color:var(--st-ink2)}
/* lessons */
.st-lessons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(20px,3vw,40px) clamp(24px,4vw,64px)}
.st-lessons div{border-top:1px solid var(--st-line);padding-top:18px}
.st-lessons b{display:block;font-family:var(--f-serif,Georgia,serif);font-style:italic;font-weight:400;font-size:clamp(24px,2.4vw,32px);line-height:1.1;letter-spacing:-.01em}
.st-lessons p{margin-top:10px;font-size:16px;line-height:1.55;color:var(--st-ink2)}
.st-note{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--st-ink2);padding:6px 12px;border:1px solid var(--st-line);border-radius:99px;background:var(--st-surf)}
.st-note::before{content:"";width:7px;height:7px;border-radius:50%;background:#E8A21A}
/* reveal */
.st [data-in]{opacity:0;transform:translateY(22px);transition:opacity .9s cubic-bezier(.22,1,.36,1),transform .9s cubic-bezier(.22,1,.36,1)}
.st [data-in].in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.st [data-in]{opacity:1;transform:none;transition:none}.st-cam .lay{transition:none}}
@media (max-width:860px){
 .st-tldr,.st-cards,.st-lessons{grid-template-columns:1fr}
 .st-pair,.st-pair.three{grid-template-columns:1fr}
 .st-choice{grid-template-columns:1fr}.st-choice .vis{min-height:220px;order:-1}
 .st-annot{grid-template-columns:1fr}
 .st-scrolly,.st-scrolly.right{grid-template-columns:1fr}
 .st-stagewrap{display:none}
 .st-step{min-height:0;opacity:1;padding:0 0 40px}.st-step:first-child,.st-step:last-child{min-height:0;padding-top:0}
 .st-mstage{display:block;width:100%;aspect-ratio:var(--mar,4/3);border-radius:18px;overflow:hidden;border:1px solid var(--st-line);position:relative;background:var(--cbg,#EEF0F3);margin-bottom:6px}
 .st-mstage .st-cam{position:absolute;inset:0}
 .st-mstage.ph{aspect-ratio:auto;background:none;border:0;overflow:visible}
 .st-flow{grid-template-columns:1fr;gap:18px}.st-flow>div{padding:0 0 0 46px}.st-flow>div::before{display:none}
 .st-walk{grid-template-columns:1fr}
 .st-rank .r{grid-template-columns:minmax(0,1fr) 2.4rem}.st-rank .r .tr{grid-column:1/-1;order:3}
 .st-bars{height:180px}
 .st-dia svg{min-width:640px}
}
`;

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = (s) => String(s ?? '').replace(/<[^>]+>/g, '');

const ICONS = {
  layers: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.5"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10h18M16 15h2"/><path d="M6 6V4.5A1.5 1.5 0 0 1 7.5 3H17"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
  book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5v-15Z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/>',
  building: '<path d="M4 21V5l8-3v19M12 8l8 3v10M2 21h20M7 9h2M7 13h2M7 17h2M15 14h2M15 17h2"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  wifi: '<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1.2"/>',
  home: '<path d="M3 11 12 4l9 7v9H3v-9Z"/><path d="M9 20v-6h6v6"/>',
  money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/>',
  stair: '<path d="M3 20h5v-5h5v-5h5V5h3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  doc: '<path d="M6 2.5h8l5 5V21H6V2.5Z"/><path d="M14 2.5v5h5M9 12h7M9 16h7"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1"/><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.spark}</svg>`;

/* ---------- camera ---------- */
// f = [x, y, w, h] as fractions of the image. Returns HTML for a camera layer; JS sizes it.
function camHTML(img, alt, f, opts = {}) {
  const pins = (opts.pins || []).map((p, i) => `<span class="pin" style="left:${p[0] * 100}%;top:${p[1] * 100}%">${p[2] ?? i + 1}</span>`).join('');
  const ring = opts.ring && f ? `<span class="ring" style="left:${f[0] * 100}%;top:${f[1] * 100}%;width:${f[2] * 100}%;height:${f[3] * 100}%"></span>` : '';
  return `<div class="st-cam" data-f="${f ? f.join(',') : ''}"${opts.pad ? ` data-pad="${opts.pad}"` : ''}${opts.bg ? ` style="--cbg:${opts.bg}"` : ''}><div class="lay"><img src="${esc(img)}" alt="${esc(alt || '')}" loading="lazy" decoding="async">${ring}${pins}</div></div>`;
}

/* ---------- diagrams (SVG) ---------- */
function hubSVG(d, ac) {
  const n = d.nodes.length, W = 900, H = 520, cx = W / 2, cy = H / 2, R = 200, rx = 330;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.label || d.center)}">`;
  d.nodes.forEach((nd, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * R;
    s += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(12,14,19,.14)" stroke-width="1.5" stroke-dasharray="${nd[2] ? '0' : '4 5'}"/>`;
  });
  d.nodes.forEach((nd, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * R;
    const w = Math.max(120, nd[0].length * 9.4 + 40);
    s += `<g><rect x="${x - w / 2}" y="${y - (nd[1] ? 30 : 22)}" width="${w}" height="${nd[1] ? 60 : 44}" rx="${nd[1] ? 16 : 22}" fill="#fff" stroke="${nd[2] ? ac : 'rgba(12,14,19,.14)'}" stroke-width="1.5"/>`;
    s += `<text x="${x}" y="${y + (nd[1] ? -4 : 6)}" text-anchor="middle" font-size="17" font-weight="650" fill="#0C0E13">${esc(nd[0])}</text>`;
    if (nd[1]) s += `<text x="${x}" y="${y + 17}" text-anchor="middle" font-size="12.5" fill="#5B616E">${esc(nd[1])}</text>`;
    s += `</g>`;
  });
  const cw = Math.max(180, d.center.length * 11 + 60);
  s += `<rect x="${cx - cw / 2}" y="${cy - 40}" width="${cw}" height="80" rx="24" fill="${ac}"/><text x="${cx}" y="${cy + (d.sub ? -2 : 7)}" text-anchor="middle" font-size="21" font-weight="650" fill="#fff">${esc(d.center)}</text>`;
  if (d.sub) s += `<text x="${cx}" y="${cy + 21}" text-anchor="middle" font-size="13" fill="rgba(255,255,255,.8)">${esc(d.sub)}</text>`;
  return s + `</svg>`;
}
function treeSVG(d, ac) {
  const kids = d.kids, n = kids.length, W = 960, colW = W / n, maxLeaves = Math.max(...kids.map((k) => (k[1] || []).length));
  const H = 230 + maxLeaves * 46;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.root)}">`;
  const rw = Math.max(200, d.root.length * 11 + 60);
  s += `<rect x="${W / 2 - rw / 2}" y="10" width="${rw}" height="56" rx="18" fill="#0C0E13"/><text x="${W / 2}" y="44" text-anchor="middle" font-size="18" font-weight="650" fill="#fff">${esc(d.root)}</text>`;
  kids.forEach((k, i) => {
    const x = colW * i + colW / 2;
    s += `<path d="M${W / 2} 66 C ${W / 2} 100, ${x} 96, ${x} 128" fill="none" stroke="rgba(12,14,19,.2)" stroke-width="1.5"/>`;
    const kw = Math.min(colW - 24, Math.max(150, k[0].length * 10 + 44));
    s += `<rect x="${x - kw / 2}" y="128" width="${kw}" height="52" rx="16" fill="${k[2] ? ac : '#fff'}" stroke="${k[2] ? ac : 'rgba(12,14,19,.16)'}" stroke-width="1.5"/><text x="${x}" y="160" text-anchor="middle" font-size="16.5" font-weight="650" fill="${k[2] ? '#fff' : '#0C0E13'}">${esc(k[0])}</text>`;
    (k[1] || []).forEach((leaf, j) => {
      const y = 204 + j * 46;
      s += `<line x1="${x}" y1="${y - 24}" x2="${x}" y2="${y}" stroke="rgba(12,14,19,.12)"/>`;
      const lw = Math.min(colW - 30, Math.max(110, leaf.length * 8 + 30));
      s += `<rect x="${x - lw / 2}" y="${y}" width="${lw}" height="34" rx="17" fill="#F3F4F6"/><text x="${x}" y="${y + 22}" text-anchor="middle" font-size="13.5" fill="#33373F">${esc(leaf)}</text>`;
    });
  });
  return s + `</svg>`;
}
function loopSVG(d, ac) {
  const n = d.items.length, W = 900, H = 560, cx = W / 2, cy = H / 2, R = 200;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.label || 'Loop')}"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="${ac}"/></marker></defs>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(12,14,19,.08)" stroke-width="28"/>`;
  for (let i = 0; i < n; i++) {
    const a1 = -Math.PI / 2 + (i / n) * Math.PI * 2 + 0.32, a2 = -Math.PI / 2 + ((i + 1) / n) * Math.PI * 2 - 0.32;
    s += `<path d="M${cx + Math.cos(a1) * R} ${cy + Math.sin(a1) * R} A ${R} ${R} 0 0 1 ${cx + Math.cos(a2) * R} ${cy + Math.sin(a2) * R}" fill="none" stroke="${ac}" stroke-width="2.5" marker-end="url(#ah)"/>`;
  }
  d.items.forEach((it, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    s += `<circle cx="${x}" cy="${y}" r="54" fill="#fff" stroke="${ac}" stroke-width="2"/><text x="${x}" y="${y - 4}" text-anchor="middle" font-size="18" font-weight="650" fill="#0C0E13">${esc(it[0])}</text><text x="${x}" y="${y + 18}" text-anchor="middle" font-size="12" fill="#5B616E">${esc(it[1] || '')}</text>`;
  });
  s += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="22" font-weight="650" fill="#0C0E13">${esc(d.center || '')}</text><text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="13.5" fill="#5B616E">${esc(d.sub || '')}</text>`;
  return s + `</svg>`;
}
function funnelSVG(d, ac) {
  // several entry doors converge into one outcome card, then a short path
  const W = 1080, H = 360, n = d.in.length;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.label || '')}">`;
  d.in.forEach((t, i) => {
    const y = 60 + i * ((H - 120) / Math.max(1, n - 1));
    s += `<path d="M230 ${y} C 320 ${y}, 330 ${H / 2}, 420 ${H / 2}" fill="none" stroke="rgba(12,14,19,.18)" stroke-width="1.5"/>`;
    s += `<rect x="20" y="${y - 26}" width="210" height="52" rx="26" fill="#fff" stroke="rgba(12,14,19,.16)" stroke-width="1.5"/><text x="125" y="${y + 6}" text-anchor="middle" font-size="16" font-weight="600" fill="#0C0E13">${esc(t)}</text>`;
  });
  s += `<rect x="420" y="${H / 2 - 46}" width="220" height="92" rx="20" fill="${ac}"/><text x="530" y="${H / 2 - 4}" text-anchor="middle" font-size="19" font-weight="650" fill="#fff">${esc(d.mid)}</text><text x="530" y="${H / 2 + 20}" text-anchor="middle" font-size="12.5" fill="rgba(255,255,255,.85)">${esc(d.midSub || '')}</text>`;
  const outs = d.out || [];
  outs.forEach((t, i) => {
    const x = 690 + i * (380 / Math.max(1, outs.length)) + 4, w = 380 / outs.length - 14;
    s += `<line x1="${i ? x - 12 : 640}" y1="${H / 2}" x2="${x}" y2="${H / 2}" stroke="${ac}" stroke-width="2"/><rect x="${x}" y="${H / 2 - 24}" width="${w}" height="48" rx="14" fill="#fff" stroke="${ac}" stroke-width="1.5"/><text x="${x + w / 2}" y="${H / 2 + 5}" text-anchor="middle" font-size="13.5" font-weight="600" fill="#0C0E13">${esc(t)}</text>`;
  });
  return s + `</svg>`;
}
function matrixSVG(d, ac) {
  // rows of labels vs columns; cells 0..1 intensity, optional highlighted row
  const cols = d.cols, rows = d.rows, cw = 118, lw = 230, rh = 46, W = lw + cols.length * cw + 10, H = 50 + rows.length * rh;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.label || '')}">`;
  cols.forEach((c, j) => { s += `<text x="${lw + j * cw + cw / 2}" y="28" text-anchor="middle" font-size="13" font-weight="600" fill="#5B616E">${esc(c)}</text>`; });
  rows.forEach((r, i) => {
    const y = 44 + i * rh;
    s += `<text x="0" y="${y + 28}" font-size="15" font-weight="${r[2] ? 700 : 500}" fill="#0C0E13">${esc(r[0])}</text>`;
    r[1].forEach((v, j) => {
      const on = typeof v === 'string' ? v : v ? '●' : '';
      const fill = v === 1 || v === true ? ac : v === 0.5 ? `color-mix(in srgb, ${ac} 35%, #fff)` : '#F3F4F6';
      s += `<rect x="${lw + j * cw + 6}" y="${y + 6}" width="${cw - 12}" height="${rh - 12}" rx="10" fill="${fill}"/>`;
      if (typeof v === 'string') s += `<text x="${lw + j * cw + cw / 2}" y="${y + 28}" text-anchor="middle" font-size="13" fill="#0C0E13">${esc(v)}</text>`;
    });
  });
  return s + `</svg>`;
}
const DIAGRAMS = { hub: hubSVG, tree: treeSVG, loop: loopSVG, funnel: funnelSVG, matrix: matrixSVG };

/* ---------- blocks ---------- */
function frameWrap(inner, frame, bg) {
  if (frame === 'browser') return `<div class="st-frame" style="${bg ? `--fbg:${bg}` : ''}"><div class="st-bar"><i></i><i></i><i></i><span></span></div>${inner}</div>`;
  if (frame === 'phone') return `<div class="st-phone">${inner}</div>`;
  if (frame === 'pad') return `<div class="st-frame pad" style="${bg ? `--fbg:${bg}` : ''}">${inner}</div>`;
  if (frame === 'none') return inner;
  return `<div class="st-frame" style="${bg ? `--fbg:${bg}` : ''}">${inner}</div>`;
}
const R = (b, img) => img(b);

function block(b, img) {
  const cls = `st-b${b.tight ? ' tight' : ''}`;
  switch (b.t) {
    case 'tldr':
      return `<div class="${cls} st-tldr">${b.items.map(([k, v]) => `<div data-in><p class="k ac">${k}</p><p>${v}</p></div>`).join('')}</div>`;
    case 'ch':
      return `<header class="${cls} st-ch" data-in><div class="n"><i>${esc(b.n)}</i><span class="k">${b.k}</span></div><h2>${b.h}</h2>${b.p ? `<p class="st-p">${b.p}</p>` : ''}</header>`;
    case 'lead':
      return `<p class="${cls} st-lead" data-in>${b.text}</p>`;
    case 'p':
      return `<div class="${cls} tight" data-in>${(Array.isArray(b.text) ? b.text : [b.text]).map((t) => `<p class="st-p" style="margin-top:14px">${t}</p>`).join('')}</div>`;
    case 'note':
      return `<div class="${cls} tight"><span class="st-note">${b.text}</span></div>`;
    case 'media': {
      const inner = b.frame === 'phone' ? `<img src="${esc(img(b.img))}" alt="${esc(strip(b.cap))}" loading="lazy">` : `<img src="${esc(img(b.img))}" alt="${esc(strip(b.cap))}" loading="lazy">`;
      return `<figure class="${cls} st-fig" data-in>${frameWrap(inner, b.frame, b.bg)}${b.cap ? `<figcaption>${b.cap}</figcaption>` : ''}</figure>`;
    }
    case 'pair':
      return `<div class="${cls} st-pair${b.items.length === 3 ? ' three' : ''}">${b.items.map((m) => `<figure class="st-fig" data-in>${frameWrap(`<img src="${esc(img(m.img))}" alt="${esc(strip(m.cap))}" loading="lazy">`, m.frame || b.frame, m.bg || b.bg)}${m.cap ? `<figcaption>${m.cap}</figcaption>` : ''}</figure>`).join('')}</div>`;
    case 'crop': // a single camera view (zoomed detail of a real screen)
      return `<figure class="${cls} st-fig" data-in><div class="st-frame" style="aspect-ratio:${b.ar || '16/9'}">${camHTML(img(b.img), strip(b.cap), b.f, { ring: b.ring, pins: b.pins, bg: b.bg, pad: b.pad })}</div>${b.cap ? `<figcaption>${b.cap}</figcaption>` : ''}</figure>`;
    case 'cards':
      return `<div class="${cls} st-cards" style="--cols:${b.cols || Math.min(3, b.items.length)}">${b.items.map((c) => `<div class="st-card${b.dark ? ' dark' : ''}" data-in>${c.i ? `<span class="ic">${icon(c.i)}</span>` : ''}${c.k ? `<span class="k">${c.k}</span>` : ''}<h4>${c.h}</h4>${c.p ? `<p>${c.p}</p>` : ''}</div>`).join('')}</div>`;
    case 'quotes':
      return `<div class="${cls} st-quotes">${b.items.map(([q, who]) => `<blockquote data-in><p>“${q}”</p><footer>${who}</footer></blockquote>`).join('')}</div>`;
    case 'reframe':
      return `<div class="${cls} st-reframe" data-in><p class="old">${b.old}</p><p class="new">${b.new}</p>${b.p ? `<p class="st-p">${b.p}</p>` : ''}</div>`;
    case 'stats':
      return `<div class="${cls} st-stats${b.light ? ' light' : ''}">${b.items.map(([n, l]) => `<div data-in><b>${n}</b><span>${l}</span></div>`).join('')}</div>`;
    case 'flow':
      return `<div class="${cls}" data-in>${b.label ? `<p class="k st-flowlab">${b.label}</p>` : ''}<div class="st-flow" style="--n:${b.steps.length}">${b.steps.map(([h, p, st], i) => `<div class="${st || ''}"><span class="d">${st === 'x' ? '×' : String(i + 1).padStart(2, '0')}</span><b>${h}</b>${p ? `<p>${p}</p>` : ''}</div>`).join('')}</div></div>`;
    case 'choices':
      return `<div class="${cls} st-choices">${b.items.map((c) => {
        const vis = c.img ? `<div class="vis" style="${c.bg ? `--vbg:${c.bg}` : ''}">${camHTML(img(c.img), strip(c.chose), c.f, { ring: c.ring, pins: c.pins, bg: c.bg, pad: c.pad })}</div>` : '';
        return `<article class="st-choice${c.img ? '' : ' noimg'}" data-in><div class="tx"><div class="row"><span class="k ac">Chose</span><p class="chose">${c.chose}</p></div>${c.over ? `<div class="row"><span class="k">Over</span><p class="over">${c.over}</p></div>` : ''}<p class="why">${c.why}</p></div>${vis}</article>`;
      }).join('')}</div>`;
    case 'scrolly': {
      const steps = b.steps;
      const phones = b.mode === 'phones';
      const stageInner = phones
        ? steps.map((s, i) => `<div class="st-phone${i ? ' off' : ''}" data-i="${i}"><img src="${esc(img(s.img))}" alt="${esc(strip(s.h))}" loading="lazy"></div>`).join('')
        : camHTML(img(steps[0].img || b.img), strip(steps[0].h), steps[0].f, { ring: true, bg: b.bg });
      const dots = `<div class="dots">${steps.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>`;
      const stepsHTML = steps.map((s, i) => {
        const mimg = img(s.img || b.img);
        const m = phones ? `<div class="st-mstage ph"><div class="st-phone"><img src="${esc(mimg)}" alt="" loading="lazy"></div></div>` : `<div class="st-mstage" style="--mar:${b.mar || '4/3'};${b.bg ? `--cbg:${b.bg}` : ''}">${camHTML(mimg, '', s.f, { ring: s.ring !== false && !!s.f, pins: s.pins, bg: b.bg })}</div>`;
        return `<div class="st-step${i ? '' : ' on'}" data-i="${i}" data-img="${esc(mimg)}" data-f="${s.f ? s.f.join(',') : ''}" data-ring="${s.ring === false ? 0 : 1}" data-pins='${s.pins ? JSON.stringify(s.pins) : ''}'>${m}${s.k ? `<span class="k ac">${s.k}</span>` : ''}<h3>${s.h}</h3>${s.p ? `<p>${s.p}</p>` : ''}</div>`;
      }).join('');
      return `<div class="${cls} st-scrolly${b.side === 'right' ? ' right' : ''}" data-scrolly="${phones ? 'phones' : 'cam'}"><div class="st-steps">${stepsHTML}</div><div class="st-stagewrap"><div class="st-stage${b.frame === 'browser' ? ' browser' : ''}${phones ? ' phones' : ''}" style="${b.bg ? `--cbg:${b.bg};` : ''}${b.par ? `--par:${b.par};` : ''}${b.ar ? `height:auto;aspect-ratio:${b.ar};max-height:100%;` : ''}">${b.frame === 'browser' ? '<div class="st-bar"><i></i><i></i><i></i><span></span></div>' : ''}${stageInner}${dots}</div></div></div>`;
    }
    case 'annot':
      return `<div class="${cls} st-annot${b.dark ? ' dark' : ''}"><div class="imgw" data-in><img src="${esc(img(b.img))}" alt="${esc(b.alt || '')}" loading="lazy">${b.pins.map((p, i) => `<span class="pin" data-i="${i}" style="left:${p.x * 100}%;top:${p.y * 100}%">${i + 1}</span>`).join('')}</div><ol>${b.pins.map((p, i) => `<li data-i="${i}" data-in><span class="d">${i + 1}</span><div><b>${p.h}</b>${p.p ? `<p>${p.p}</p>` : ''}</div></li>`).join('')}</ol></div>`;
    case 'toggle':
      return `<div class="${cls} st-toggle" data-in><div class="tg" role="group" aria-label="${esc(b.label || 'Switch view')}">${b.opts.map((o, i) => `<button type="button" aria-pressed="${!i}" data-i="${i}">${o.l}</button>`).join('')}</div><div class="panes">${b.opts.map((o, i) => `<div class="pane${i ? ' off' : ''}" data-i="${i}"><div class="imgs" style="--n:${o.imgs.length}">${o.imgs.map((s) => `<img src="${esc(img(s))}" alt="${esc(strip(o.h))}" loading="lazy">`).join('')}</div><div class="cap">${o.k ? `<span class="k ac">${o.k}</span>` : ''}<b>${o.h}</b>${o.p ? `<p>${o.p}</p>` : ''}</div></div>`).join('')}</div></div>`;
    case 'compare':
      return `<figure class="${cls} st-fig" data-in><div class="st-cmp" style="--x:50%"><img src="${esc(img(b.a))}" alt="${esc(b.al || '')}" loading="lazy"><div class="top"><img src="${esc(img(b.b))}" alt="${esc(b.bl || '')}" loading="lazy"></div><span class="lab l">${b.bl || 'After'}</span><span class="lab r">${b.al || 'Before'}</span><span class="h"></span><input type="range" min="0" max="100" value="50" aria-label="Compare"></div>${b.cap ? `<figcaption>${b.cap}</figcaption>` : ''}</figure>`;
    case 'bars': {
      const mx = b.max || Math.max(...b.items.map((x) => x[1]));
      return `<div class="${cls} st-chart" data-in>${b.big ? `<div class="st-big2">${b.big.map(([n, l, c]) => `<div><b style="color:${c || 'inherit'}">${n}</b><span>${l}</span></div>`).join('')}</div>` : ''}<div class="st-bars" style="--n:${b.items.length}">${b.items.map(([l, v]) => `<div class="${v < (b.bad || 0) ? 'bad' : ''}"><span>${v}</span><i data-h="${Math.max(2.5, (v / mx) * 86)}%"></i></div>`).join('')}</div><div class="st-barsx" style="--n:${b.items.length}">${b.items.map(([l]) => `<span>${l}</span>`).join('')}</div>${b.cap ? `<p class="st-p" style="margin-top:20px;font-size:15px">${b.cap}</p>` : ''}</div>`;
    }
    case 'rank': {
      const mx = b.max || 30;
      return `<div class="${cls} st-chart" data-in><div class="st-rank">${b.items.map((r, i) => `<div class="r${i === 0 ? ' top' : ''}"><div class="nm"><b>${r[0]}${r[3] ? `<span class="tag ${r[3][1] || ''}">${r[3][0]}</span>` : ''}</b><span>${r[1]}</span></div><div class="tr"><i data-w="${(r[2] / mx) * 100}%"></i></div><span class="sc">${r[2]}</span></div>`).join('')}</div>${b.cap ? `<p class="st-p" style="margin-top:18px;font-size:14px;text-align:right;max-width:none">${b.cap}</p>` : ''}</div>`;
    }
    case 'walk':
      return `<div class="${cls} st-walk" style="--n:${b.items.length}">${b.items.map((w) => `<figure data-in><img src="${esc(img(w.img))}" alt="${esc(strip(w.h))}" loading="lazy"><figcaption><span class="k ac">${w.k}</span><b>${w.h}</b></figcaption></figure>`).join('')}</div>`;
    case 'dia': {
      const fn = DIAGRAMS[b.kind];
      return `<figure class="${cls} st-dia" data-in>${fn ? fn(b, b.ac || 'var(--ac)') : ''}${b.cap ? `<figcaption class="cap">${b.cap}</figcaption>` : ''}</figure>`;
    }
    case 'lessons':
      return `<div class="${cls} st-lessons">${b.items.map(([h, p]) => `<div data-in><b>${h}</b><p>${p}</p></div>`).join('')}</div>`;
    case 'scene': // handled by host (3D); placeholder with poster
      return `<div class="${cls}" data-scene-slot='${esc(JSON.stringify(b))}'></div>`;
    default:
      return '';
  }
}

export function storyHTML(blocks, opts = {}) {
  const img = opts.img || ((s) => s);
  return `<div class="st"${opts.ac ? ` style="--ac:${opts.ac}"` : ''}>${blocks.map((b) => block(b, img)).join('')}</div>`;
}

/* ---------- behaviour ---------- */
function fitCam(cam, f, opts = {}) {
  const lay = cam.querySelector('.lay'), im = lay && lay.querySelector('img');
  if (!im) return;
  const go = () => {
    const W = cam.clientWidth, H = cam.clientHeight, iw = im.naturalWidth, ih = im.naturalHeight;
    if (!W || !H || !iw) return;
    im.style.width = iw + 'px'; im.style.height = ih + 'px';
    const r = f && f.length === 4 ? f : [0, 0, 1, 1];
    const pad = parseFloat(cam.dataset.pad || '') || (f && f.length === 4 ? 0.86 : 0.94);
    const s = Math.min(W / (r[2] * iw), H / (r[3] * ih)) * pad;
    const cx = (r[0] + r[2] / 2) * iw * s, cy = (r[1] + r[3] / 2) * ih * s;
    let x = W / 2 - cx, y = H / 2 - cy;
    const sw = iw * s, sh = ih * s;
    x = sw <= W ? (W - sw) / 2 : Math.min(0, Math.max(W - sw, x));
    y = sh <= H ? (H - sh) / 2 : Math.min(0, Math.max(H - sh, y));
    lay.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    lay.querySelectorAll('.pin').forEach((p) => { p.style.transform = `scale(${1 / s})`; });
    const ring = lay.querySelector('.ring');
    if (ring) { ring.style.borderWidth = 2 / s + 'px'; ring.style.borderRadius = 10 / s + 'px'; }
  };
  if (im.complete && im.naturalWidth) go(); else im.addEventListener('load', go, { once: true });
  return go;
}

export function enhanceStory(root, opts = {}) {
  if (!root) return () => {};
  const scrollRoot = opts.scrollRoot || null;
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups = [];
  const refits = [];
  // static cams (crop, choices, mobile stages)
  root.querySelectorAll('.st-cam').forEach((cam) => {
    if (cam.closest('.st-stage')) return;
    const f = cam.dataset.f ? cam.dataset.f.split(',').map(Number) : null;
    const go = fitCam(cam, f); if (go) refits.push(go);
  });
  // reveal
  const ioIn = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); ioIn.unobserve(e.target);
    e.target.querySelectorAll('[data-h]').forEach((i) => { i.style.height = i.dataset.h; });
    e.target.querySelectorAll('[data-w]').forEach((i) => { i.style.width = i.dataset.w; });
  }), { root: scrollRoot, rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  root.querySelectorAll('[data-in]').forEach((el) => { if (reduce) { el.classList.add('in'); el.querySelectorAll('[data-h]').forEach((i) => (i.style.height = i.dataset.h)); el.querySelectorAll('[data-w]').forEach((i) => (i.style.width = i.dataset.w)); } else ioIn.observe(el); });
  cleanups.push(() => ioIn.disconnect());
  // scrolly
  root.querySelectorAll('.st-scrolly').forEach((sc) => {
    const steps = [...sc.querySelectorAll('.st-step')];
    const stage = sc.querySelector('.st-stage');
    const dots = [...stage.querySelectorAll('.dots i')];
    const phones = sc.dataset.scrolly === 'phones';
    const cam = stage.querySelector('.st-cam');
    let cur = -1;
    const show = (i) => {
      if (i === cur) return; cur = i;
      steps.forEach((s, j) => s.classList.toggle('on', j === i));
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
      const st = steps[i];
      if (phones) { stage.querySelectorAll('.st-phone').forEach((p, j) => p.classList.toggle('off', j !== i)); return; }
      const lay = cam.querySelector('.lay'), im = lay.querySelector('img');
      const src = st.dataset.img, f = st.dataset.f ? st.dataset.f.split(',').map(Number) : null;
      const pins = st.dataset.pins ? JSON.parse(st.dataset.pins) : [];
      const apply = () => {
        lay.querySelectorAll('.pin,.ring').forEach((n) => n.remove());
        if (f && st.dataset.ring !== '0') { const r = document.createElement('span'); r.className = 'ring'; Object.assign(r.style, { left: f[0] * 100 + '%', top: f[1] * 100 + '%', width: f[2] * 100 + '%', height: f[3] * 100 + '%' }); lay.appendChild(r); }
        pins.forEach((p, k) => { const d = document.createElement('span'); d.className = 'pin'; d.textContent = p[2] ?? k + 1; d.style.left = p[0] * 100 + '%'; d.style.top = p[1] * 100 + '%'; lay.appendChild(d); });
        fitCam(cam, f);
      };
      if (src && !im.src.endsWith(src.replace(/^\.\//, ''))) {
        lay.style.opacity = '0';
        setTimeout(() => { im.src = src; im.onload = () => { lay.style.transition = 'none'; apply(); requestAnimationFrame(() => { lay.style.transition = ''; lay.style.opacity = '1'; }); }; if (im.complete && im.naturalWidth) im.onload(); }, 280);
      } else apply();
    };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) show(+e.target.dataset.i); });
    }, { root: scrollRoot, rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    steps.forEach((s) => io.observe(s));
    cleanups.push(() => io.disconnect());
    show(0);
    refits.push(() => { const st = steps[cur]; if (!phones && st) fitCam(cam, st.dataset.f ? st.dataset.f.split(',').map(Number) : null); });
  });
  // annotations
  root.querySelectorAll('.st-annot').forEach((a) => {
    const pins = [...a.querySelectorAll('.pin')], lis = [...a.querySelectorAll('li')];
    const on = (i) => { pins.forEach((p, j) => p.classList.toggle('on', j === i)); lis.forEach((l, j) => l.classList.toggle('on', j === i)); };
    [...pins, ...lis].forEach((el) => { el.addEventListener('mouseenter', () => on(+el.dataset.i)); el.addEventListener('focus', () => on(+el.dataset.i)); });
    a.addEventListener('mouseleave', () => on(-1));
  });
  // toggles
  root.querySelectorAll('.st-toggle').forEach((t) => {
    const btns = [...t.querySelectorAll('.tg button')], panes = [...t.querySelectorAll('.pane')];
    btns.forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.i; btns.forEach((x) => x.setAttribute('aria-pressed', x === b)); panes.forEach((p, j) => p.classList.toggle('off', j !== i)); }));
  });
  // compare
  root.querySelectorAll('.st-cmp').forEach((c) => {
    const r = c.querySelector('input'); r.addEventListener('input', () => c.style.setProperty('--x', r.value + '%'));
  });
  // resize
  let t = 0;
  const onR = () => { clearTimeout(t); t = setTimeout(() => refits.forEach((f) => f && f()), 120); };
  addEventListener('resize', onR); cleanups.push(() => removeEventListener('resize', onR));
  return () => cleanups.forEach((f) => f());
}
