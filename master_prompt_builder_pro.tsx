import { useState, useCallback } from "react";

const PLATFORMS = [
  { id:"claude",      label:"Claude",         emoji:"🟠", color:"#C96A2B", bg:"#FFF4ED", border:"#F5C9A0", desc:"Anthropic · XML-Tags · Strukturiert" },
  { id:"artifacts",   label:"Artifacts",      emoji:"🔶", color:"#A0522D", bg:"#FFF8F0", border:"#F5D5B0", desc:"Claude Canvas · React · HTML · UI" },
  { id:"chatgpt",     label:"ChatGPT",        emoji:"🟢", color:"#10A37F", bg:"#F0FBF7", border:"#A0DCC8", desc:"OpenAI · System Prompt · Few-Shot" },
  { id:"gpts",        label:"GPTs",           emoji:"🔵", color:"#1A73E8", bg:"#F0F6FF", border:"#A0C4F5", desc:"Custom GPT · Persona · Actions" },
  { id:"gemini",      label:"Gemini",         emoji:"🔷", color:"#4285F4", bg:"#F0F5FF", border:"#A8C7FA", desc:"Google · Multimodal · Workspace" },
  { id:"gems",        label:"Gems",           emoji:"💎", color:"#8430CE", bg:"#F8F0FF", border:"#D4A8F5", desc:"Gemini Custom · Persona · Tools" },
  { id:"nanobanana",  label:"Nano Banana 2",  emoji:"🍌", color:"#E6A817", bg:"#FFFBF0", border:"#FFE082", desc:"Google · Bild-KI · Gemini 3.1 Flash" },
];

const ROLES = ["","KI-Ingenieur","Prompt-Experte","Daten-Analyst","Content-Stratege","Softwareentwickler","UX-Designer","Produktmanager","Lehrer / Coach","Berater","Forscher","Kreativdirektor","Bildregisseur"];
const TONES = ["","Professionell","Präzise & Direkt","Freundlich","Akademisch","Kreativ","Technisch","Motivierend","Neutral","Kinematografisch"];
const FORMATS = ["","Fließtext","Aufzählungspunkte","Schritt-für-Schritt","Tabelle","JSON","Markdown","Code + Erklärung","Dialog/Q&A","Szenenbeschreibung"];
const LANGUAGES = ["Deutsch","Englisch","Spanisch","Französisch","Portugiesisch","Italienisch","Japanisch","Chinesisch"];
const IMAGE_STYLES = ["","Fotorealistisch","Cinematic","Illustration","3D-Render","Ölgemälde","Aquarell","Konzeptkunst","Editorial","Produktfoto","Werbeplakat"];
const ASPECT_RATIOS = ["16:9","9:16","1:1","2:1","4:3","3:4","21:9"];
const RESOLUTIONS = ["Standard (1024px)","2K","4K"];

const STEPS_DEFAULT = [
  { key:"role",        label:"Rolle",          placeholder:"z.B. KI-Ingenieur mit Fokus auf Prompt-Optimierung", type:"select", options:ROLES },
  { key:"goal",        label:"Ziel / Aufgabe", placeholder:"Was soll die KI konkret tun?", type:"textarea" },
  { key:"context",     label:"Kontext",        placeholder:"Hintergrundinformationen, Projekt, Branche...", type:"textarea" },
  { key:"audience",    label:"Zielgruppe",     placeholder:"Für wen ist der Output gedacht?", type:"text" },
  { key:"examples",    label:"Beispiele",      placeholder:"Gib 1–2 Beispiele für gewünschten Output...", type:"textarea" },
  { key:"constraints", label:"Regeln / Grenzen", placeholder:"Was soll die KI tun / nicht tun?", type:"textarea" },
  { key:"tone",        label:"Ton",            placeholder:"", type:"select", options:TONES },
  { key:"format",      label:"Ausgabeformat",  placeholder:"", type:"select", options:FORMATS },
  { key:"language",    label:"Sprache",        placeholder:"", type:"select", options:LANGUAGES },
];

const STEPS_NB = [
  { key:"subject",     label:"Subjekt",        placeholder:"Hauptmotiv des Bildes (Person, Objekt, Szene)", type:"textarea" },
  { key:"action",      label:"Aktion / Pose",  placeholder:"Was tut das Subjekt? Welche Pose / Bewegung?", type:"text" },
  { key:"scene",       label:"Umgebung / Szene", placeholder:"Wo findet die Szene statt? Zeitraum, Wetter, Ort...", type:"textarea" },
  { key:"style",       label:"Bildstil",       placeholder:"", type:"select", options:IMAGE_STYLES },
  { key:"lighting",    label:"Licht & Stimmung", placeholder:"z.B. Goldene Stunde, Neonlicht, Studio-Setup...", type:"text" },
  { key:"camera",      label:"Kamera / Linse", placeholder:"z.B. 85mm Portrait-Linse, f/1.8, Draufsicht...", type:"text" },
  { key:"text_in_image", label:"Text im Bild (optional)", placeholder:"z.B. Headline: 'DRIFT' in fettem Serif auf Magazincover", type:"text" },
  { key:"references",  label:"Referenzen / Konsistenz", placeholder:"Beschreibe Charakter-Konsistenz oder Referenz-Bilder...", type:"textarea" },
  { key:"constraints", label:"Einschränkungen", placeholder:"Was soll NICHT im Bild sein?", type:"text" },
  { key:"aspect",      label:"Seitenverhältnis", placeholder:"", type:"select", options:ASPECT_RATIOS.map(a=>a) },
  { key:"resolution",  label:"Auflösung",      placeholder:"", type:"select", options:RESOLUTIONS },
];

const TIPS = {
  claude:     ["Nutze XML-Tags (<role>, <task>, <context>) für maximale Klarheit","Claude antwortet besser auf explizite Struktur und schrittweise Anweisungen","Füge <examples> hinzu für konsistente Ausgaben"],
  artifacts:  ["Beschreibe das Artifact als vollständiges, funktionales Produkt","Spezifiziere Tech-Stack (React, HTML) und gewünschte Interaktivität","Erwähne UI-Stil, State-Management und Nutzer-Aktionen explizit"],
  chatgpt:    ["System-Prompts funktionieren am besten mit klarer Persona-Definition","Few-Shot-Beispiele verbessern die Konsistenz erheblich","GPT-4 versteht komplexe Rollenanweisungen sehr gut"],
  gpts:       ["Gesprächsstarter helfen Nutzern, den GPT sofort zu verwenden","Definiere klare Grenzen: Was tut der GPT, was nicht?","Nutze 'Anweisungen' für präzise Verhaltenssteuerung"],
  gemini:     ["Gemini nutzt Markdown-Formatierung sehr effektiv","Multimodaler Kontext (Bilder, Dokumente) stärkt die Antwortqualität","Google-Workspace-Integration in den Kontext einbauen"],
  gems:       ["Gems funktionieren am besten mit starker Persona-Definition","Beschreibe typische Nutzeranfragen als Beispiele","Gemini Gems lassen sich mit Google-Tools verknüpfen"],
  nanobanana: ["Nano Banana 2 ist ein Denk-Modell – beschreibe Intent, Physik und Komposition","Nutze Kamera-Direktiven: Objektiv, Blende, Perspektive für filmische Ergebnisse","Text im Bild? Nano Banana 2 rendert Überschriften, Labels und UI-Texte präzise","Bis zu 14 Referenz-Objekte und 5 Charaktere in einem Prompt konsistent haltbar"],
};

function buildPrompt(fields, pid) {
  const f = fields;

  if (pid === "claude") {
    const p = [];
    if (f.role) p.push(`<role>\nDu bist ein ${f.role}.\n</role>`);
    if (f.goal) p.push(`<task>\n${f.goal}\n</task>`);
    if (f.context) p.push(`<context>\n${f.context}\n</context>`);
    if (f.audience) p.push(`<audience>\nZielgruppe: ${f.audience}\n</audience>`);
    if (f.examples) p.push(`<examples>\n${f.examples}\n</examples>`);
    if (f.constraints) p.push(`<rules>\n${f.constraints}\n</rules>`);
    const out=[]; if(f.tone) out.push(`- Ton: ${f.tone}`); if(f.format) out.push(`- Format: ${f.format}`); if(f.language) out.push(`- Sprache: ${f.language}`);
    if(out.length) p.push(`<output_format>\n${out.join("\n")}\n</output_format>`);
    return p.join("\n\n");
  }

  if (pid === "artifacts") {
    const p = [];
    p.push(`<role>\nDu bist ein ${f.role||"Experte"} und erstellst interaktive Claude-Artifacts.\n</role>`);
    if (f.goal) p.push(`<task>\nErstelle ein vollständiges, funktionsfähiges Artifact:\n${f.goal}\n</task>`);
    if (f.context) p.push(`<context>\n${f.context}\n</context>`);
    p.push(`<artifact_rules>\n- Nutze React (application/vnd.ant.react) oder HTML (text/html)\n- Kein localStorage – nur React State\n- Tailwind-Klassen für Styling\n- Vollständiger, lauffähiger Code ohne Platzhalter\n${f.constraints?"- "+f.constraints:""}\n</artifact_rules>`);
    if (f.examples) p.push(`<examples>\n${f.examples}\n</examples>`);
    const out=[]; if(f.tone) out.push(`- Ton: ${f.tone}`); if(f.language) out.push(`- Sprache: ${f.language}`);
    if(out.length) p.push(`<output_format>\n${out.join("\n")}\n</output_format>`);
    return p.join("\n\n");
  }

  if (pid === "chatgpt") {
    const l=[];
    if(f.role) l.push(`Du bist ein ${f.role}.`);
    if(f.goal) l.push(`\nAufgabe:\n${f.goal}`);
    if(f.context) l.push(`\nKontext:\n${f.context}`);
    if(f.audience) l.push(`\nZielgruppe: ${f.audience}`);
    if(f.examples) l.push(`\nBeispiele:\n${f.examples}`);
    if(f.constraints) l.push(`\nRegeln:\n${f.constraints}`);
    const out=[]; if(f.tone) out.push(`Ton: ${f.tone}`); if(f.format) out.push(`Format: ${f.format}`); if(f.language) out.push(`Sprache: ${f.language}`);
    if(out.length) l.push(`\nAusgabe: ${out.join(" | ")}`);
    return l.join("\n");
  }

  if (pid === "gpts") {
    const l=[];
    l.push(`# GPT-Name\n${f.role||"Mein Experten-GPT"}\n`);
    l.push(`# Beschreibung\n${f.goal||"Ein spezialisierter GPT-Assistent."}\n`);
    l.push(`# Anweisungen`);
    if(f.role) l.push(`Du bist ein ${f.role}.`);
    if(f.goal) l.push(`Hauptaufgabe: ${f.goal}`);
    if(f.context) l.push(`Kontext: ${f.context}`);
    if(f.audience) l.push(`Zielgruppe: ${f.audience}`);
    if(f.constraints) l.push(`\nRegeln:\n${f.constraints}`);
    if(f.examples) l.push(`\nBeispiele:\n${f.examples}`);
    l.push(`\n# Gesprächsstarter\n1. "Wie kann ich starten?"\n2. "Zeig mir ein Beispiel"\n3. "Was kannst du für mich tun?"`);
    const out=[]; if(f.tone) out.push(`Ton: ${f.tone}`); if(f.format) out.push(`Format: ${f.format}`); if(f.language) out.push(`Sprache: ${f.language}`);
    if(out.length) l.push(`\n# Ausgabeformat\n${out.join(" | ")}`);
    return l.join("\n");
  }

  if (pid === "gemini") {
    const l=[];
    if(f.role) l.push(`**Rolle:** Du bist ein ${f.role}.`);
    if(f.goal) l.push(`\n**Aufgabe:**\n${f.goal}`);
    if(f.context) l.push(`\n**Kontext:**\n${f.context}`);
    if(f.audience) l.push(`\n**Zielgruppe:** ${f.audience}`);
    if(f.examples) l.push(`\n**Beispiele:**\n${f.examples}`);
    if(f.constraints) l.push(`\n**Einschränkungen:**\n${f.constraints}`);
    const out=[]; if(f.tone) out.push(`Ton: ${f.tone}`); if(f.format) out.push(`Format: ${f.format}`); if(f.language) out.push(`Sprache: ${f.language}`);
    if(out.length) l.push(`\n**Ausgabe:** ${out.join(" · ")}`);
    return l.join("\n");
  }

  if (pid === "gems") {
    const l=[];
    l.push(`Gem-Name: ${f.role||"Mein KI-Experte"}\n`);
    l.push(`Persona:`);
    if(f.role) l.push(`Du bist ein ${f.role} mit tiefem Fachwissen.`);
    if(f.goal) l.push(`Spezialität: ${f.goal}`);
    if(f.context) l.push(`\nHintergrund:\n${f.context}`);
    if(f.audience) l.push(`\nZielgruppe: ${f.audience}`);
    if(f.constraints) l.push(`\nRegeln:\n${f.constraints}`);
    if(f.examples) l.push(`\nTypische Anfragen:\n${f.examples}`);
    const out=[]; if(f.tone) out.push(`Ton: ${f.tone}`); if(f.format) out.push(`Format: ${f.format}`); if(f.language) out.push(`Sprache: ${f.language}`);
    if(out.length) l.push(`\nAntwort-Stil: ${out.join(" | ")}`);
    return l.join("\n");
  }

  if (pid === "nanobanana") {
    const parts = [];
    // Subject + Action
    if (f.subject || f.action) {
      const sa = [f.subject, f.action].filter(Boolean).join(", ");
      parts.push(sa);
    }
    // Scene
    if (f.scene) parts.push(f.scene);
    // Style
    if (f.style) parts.push(`Stil: ${f.style}`);
    // Camera
    if (f.camera) parts.push(`Aufnahme: ${f.camera}`);
    // Lighting
    if (f.lighting) parts.push(`Licht: ${f.lighting}`);
    // Text in image
    if (f.text_in_image) parts.push(`Text im Bild: "${f.text_in_image}"`);
    // References
    if (f.references) parts.push(`Konsistenz: ${f.references}`);
    // Constraints
    if (f.constraints) parts.push(`Nicht zeigen: ${f.constraints}`);
    // Technical specs
    const specs = [];
    if (f.aspect) specs.push(`Seitenverhältnis ${f.aspect||"16:9"}`);
    if (f.resolution) specs.push(f.resolution);
    if (specs.length) parts.push(specs.join(", "));

    return parts.join(". ") + (parts.length ? "." : "");
  }

  return "";
}

const DEFAULT_FIELDS = { role:"", goal:"", context:"", audience:"", examples:"", constraints:"", tone:"", format:"", language:"Deutsch" };
const NB_FIELDS = { subject:"", action:"", scene:"", style:"", lighting:"", camera:"", text_in_image:"", references:"", constraints:"", aspect:"16:9", resolution:"Standard (1024px)" };

export default function App() {
  const [platform, setPlatform] = useState("claude");
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [nbFields, setNbFields] = useState(NB_FIELDS);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("build");

  const isNB = platform === "nanobanana";
  const currentFields = isNB ? nbFields : fields;
  const setField = (k,v) => isNB ? setNbFields(f=>({...f,[k]:v})) : setFields(f=>({...f,[k]:v}));
  const steps = isNB ? STEPS_NB : STEPS_DEFAULT;
  const prompt = buildPrompt(currentFields, platform);
  const pInfo = PLATFORMS.find(p => p.id === platform);
  const tips = TIPS[platform] || [];
  const filled = Object.values(currentFields).filter(v => v && v !== "Deutsch" && v !== "16:9" && v !== "Standard (1024px)").length;

  const switchPlatform = (pid) => {
    setPlatform(pid);
    setAiResult(null);
    setActiveTab("build");
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(aiResult?.improved || prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const improveWithAI = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setAiResult(null);
    setActiveTab("result");
    try {
      const platformLabel = pInfo?.label || platform;
      const systemContext = isNB
        ? `Du bist ein Weltklasse-Experte für Bildgenerierungs-Prompts, speziell für Nano Banana 2 (Gemini 3.1 Flash Image). Du kennst alle Best Practices: kinematografische Direktiven, Licht-Setup, Kompositionsprinzipien, Text-im-Bild-Rendering und Konsistenz-Techniken.`
        : `Du bist ein Weltklasse-Experte für Prompt Engineering mit tiefer Kenntnis von Claude, ChatGPT, Gemini, GPTs, Artifacts und Gems.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:`${systemContext}

Analysiere diesen ${platformLabel}-Prompt und verbessere ihn professionell. Antworte NUR als valides JSON ohne Markdown-Backticks:
{"improved":"verbesserter Prompt","score":85,"tips":["Tipp 1","Tipp 2","Tipp 3"],"summary":"Ein Satz über die wichtigste Verbesserung"}

Original-Prompt:
${prompt}`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c=>c.text||"").join("")||"";
      const clean = text.replace(/```json|```/g,"").trim();
      setAiResult(JSON.parse(clean));
    } catch(e) {
      setAiResult({error:"KI-Optimierung fehlgeschlagen. Bitte erneut versuchen."});
    }
    setLoading(false);
  }, [prompt, platform, pInfo, isNB]);

  return (
    <div style={{fontFamily:"var(--font-sans)",maxWidth:820,margin:"0 auto",padding:"1.5rem 1rem"}}>

      {/* Header */}
      <div style={{marginBottom:"1.5rem"}}>
        <h1 style={{fontSize:22,fontWeight:500,margin:"0 0 4px",color:"var(--color-text-primary)"}}>Master Prompt Builder Pro</h1>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:0}}>Claude · ChatGPT · Gemini · Artifacts · GPTs · Gems · Nano Banana 2</p>
      </div>

      {/* Platform Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:"1.5rem"}}>
        {PLATFORMS.map(p=>(
          <button key={p.id} onClick={()=>switchPlatform(p.id)}
            style={{padding:"10px 8px",borderRadius:"var(--border-radius-md)",border:platform===p.id?`2px solid ${p.color}`:"0.5px solid var(--color-border-tertiary)",background:platform===p.id?p.bg:"var(--color-background-primary)",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
            <div style={{fontSize:13,fontWeight:500,color:platform===p.id?p.color:"var(--color-text-primary)"}}>{p.emoji} {p.label}</div>
            <div style={{fontSize:10,color:"var(--color-text-secondary)",marginTop:2,lineHeight:1.3}}>{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Nano Banana 2 Info Banner */}
      {isNB && (
        <div style={{background:"#FFFBF0",borderRadius:"var(--border-radius-md)",padding:"12px 14px",marginBottom:"1rem",border:"0.5px solid #FFE082"}}>
          <div style={{fontSize:12,fontWeight:500,color:"#E6A817",marginBottom:4}}>🍌 Nano Banana 2 – Gemini 3.1 Flash Image</div>
          <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.6}}>
            Googles neuestes Bildgenerierungsmodell (Feb. 2026) · 4K-Ausgabe · Präzises Text-Rendering · 5 Charaktere konsistent · Echtzeit Web-Grounding · Flash-Geschwindigkeit
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"10px 14px",marginBottom:"1.5rem",borderLeft:`3px solid ${pInfo?.color}`}}>
        <div style={{fontSize:12,fontWeight:500,color:pInfo?.color,marginBottom:4}}>Experten-Tipps für {pInfo?.label}</div>
        {tips.map((t,i)=><div key={i} style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.6}}>· {t}</div>)}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:"1rem",borderBottom:"0.5px solid var(--color-border-tertiary)",paddingBottom:8}}>
        {["build","preview","result"].map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)}
            style={{fontSize:13,padding:"4px 14px",borderRadius:"var(--border-radius-md)",border:activeTab===tab?`0.5px solid ${pInfo?.color}`:"0.5px solid var(--color-border-tertiary)",background:activeTab===tab?pInfo?.bg:"transparent",color:activeTab===tab?pInfo?.color:"var(--color-text-secondary)",cursor:"pointer",fontWeight:activeTab===tab?500:400}}>
            {tab==="build"?"Aufbau":tab==="preview"?"Vorschau":"KI-Optimierung"}
          </button>
        ))}
        <span style={{marginLeft:"auto",fontSize:12,color:"var(--color-text-secondary)",alignSelf:"center"}}>{filled} / {steps.length} Felder</span>
      </div>

      {/* Build Tab */}
      {activeTab==="build" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {steps.map(step=>(
            <div key={step.key}>
              <label style={{display:"block",fontSize:13,fontWeight:500,color:"var(--color-text-primary)",marginBottom:4}}>{step.label}</label>
              {step.type==="select"?(
                <select value={currentFields[step.key]||""} onChange={e=>setField(step.key,e.target.value)} style={{width:"100%",fontSize:14}}>
                  {(step.options||[]).map(o=><option key={o} value={o}>{o||"– auswählen –"}</option>)}
                </select>
              ):step.type==="textarea"?(
                <textarea value={currentFields[step.key]||""} onChange={e=>setField(step.key,e.target.value)}
                  placeholder={step.placeholder} rows={3}
                  style={{width:"100%",fontSize:14,resize:"vertical",boxSizing:"border-box"}}/>
              ):(
                <input type="text" value={currentFields[step.key]||""} onChange={e=>setField(step.key,e.target.value)}
                  placeholder={step.placeholder}
                  style={{width:"100%",fontSize:14,boxSizing:"border-box"}}/>
              )}
            </div>
          ))}
          <button onClick={()=>setActiveTab("preview")}
            style={{padding:"10px 20px",borderRadius:"var(--border-radius-md)",border:`0.5px solid ${pInfo?.color}`,background:pInfo?.bg,color:pInfo?.color,fontWeight:500,cursor:"pointer",fontSize:14,marginTop:4}}>
            Vorschau ansehen →
          </button>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab==="preview" && (
        <div>
          {isNB && (
            <div style={{background:"#FFFBF0",borderRadius:"var(--border-radius-md)",padding:"8px 12px",marginBottom:12,fontSize:12,color:"#A0741A",border:"0.5px solid #FFE082"}}>
              🍌 Nano Banana 2 versteht natürliche Sprache. Dieser Prompt kann direkt in der Gemini App, AI Studio oder via API verwendet werden.
            </div>
          )}
          <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",padding:"1rem",marginBottom:"1rem",border:"0.5px solid var(--color-border-tertiary)"}}>
            <div style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",marginBottom:8}}>Generierter {pInfo?.label}-Prompt</div>
            <pre style={{fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",margin:0,color:"var(--color-text-primary)",fontFamily:"var(--font-mono)"}}>
              {prompt||"Fülle die Felder im Aufbau-Tab aus."}
            </pre>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={copyPrompt}
              style={{flex:1,padding:"10px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)",cursor:"pointer",fontSize:14}}>
              {copied?"Kopiert!":"Kopieren"}
            </button>
            <button onClick={improveWithAI} disabled={!prompt.trim()||loading}
              style={{flex:2,padding:"10px",borderRadius:"var(--border-radius-md)",border:`0.5px solid ${pInfo?.color}`,background:pInfo?.bg,color:pInfo?.color,cursor:prompt.trim()?"pointer":"not-allowed",fontWeight:500,fontSize:14}}>
              {loading?"KI optimiert...":"Mit KI verbessern ↗"}
            </button>
          </div>
        </div>
      )}

      {/* Result Tab */}
      {activeTab==="result" && (
        <div>
          {loading && (
            <div style={{textAlign:"center",padding:"3rem",color:"var(--color-text-secondary)",fontSize:14}}>
              <div style={{fontSize:28,marginBottom:12}}>{isNB?"🍌":"✨"}</div>
              {isNB?"Bild-Prompt wird analysiert und optimiert...":"KI analysiert und optimiert deinen Prompt..."}
            </div>
          )}
          {!loading && !aiResult && (
            <div style={{textAlign:"center",padding:"3rem",color:"var(--color-text-secondary)",fontSize:14}}>
              Gehe zur Vorschau und klicke "Mit KI verbessern"
            </div>
          )}
          {aiResult?.error && (
            <div style={{background:"var(--color-background-danger)",borderRadius:"var(--border-radius-md)",padding:"1rem",color:"var(--color-text-danger)",fontSize:14}}>
              {aiResult.error}
            </div>
          )}
          {aiResult && !aiResult.error && (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"flex",gap:12}}>
                <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 16px",textAlign:"center",minWidth:80}}>
                  <div style={{fontSize:28,fontWeight:500,color:pInfo?.color}}>{aiResult.score}</div>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)"}}>/ 100</div>
                </div>
                <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 16px",flex:1,fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.5}}>
                  <span style={{fontWeight:500,color:"var(--color-text-primary)"}}>Zusammenfassung: </span>{aiResult.summary}
                </div>
              </div>
              {aiResult.tips && (
                <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 16px"}}>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:8,color:"var(--color-text-primary)"}}>Verbesserungen</div>
                  {aiResult.tips.map((t,i)=>(
                    <div key={i} style={{fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.6,paddingLeft:12}}>{i+1}. {t}</div>
                  ))}
                </div>
              )}
              <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",padding:"1rem",border:`0.5px solid ${pInfo?.border||"var(--color-border-tertiary)"}`}}>
                <div style={{fontSize:12,fontWeight:500,color:pInfo?.color,marginBottom:8}}>Optimierter Prompt</div>
                <pre style={{fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",margin:0,color:"var(--color-text-primary)",fontFamily:"var(--font-mono)"}}>
                  {aiResult.improved}
                </pre>
              </div>
              <button onClick={copyPrompt}
                style={{padding:"10px",borderRadius:"var(--border-radius-md)",border:`0.5px solid ${pInfo?.color}`,background:pInfo?.bg,color:pInfo?.color,fontWeight:500,cursor:"pointer",fontSize:14}}>
                {copied?"Kopiert!":"Optimierten Prompt kopieren"}
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{marginTop:"2rem",padding:"10px",borderTop:"0.5px solid var(--color-border-tertiary)",fontSize:11,color:"var(--color-text-secondary)",textAlign:"center"}}>
        Master Prompt Builder Pro · 7 Plattformen · KI-gestützte Optimierung
      </div>
    </div>
  );
}
