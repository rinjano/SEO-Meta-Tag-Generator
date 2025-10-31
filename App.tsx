import React, { useMemo, useRef, useState, useEffect } from "react";
import { Plus, Clipboard, ClipboardCheck, AlertCircle } from "./components/icons";
import TextInput from "./components/TextInput";
import TextArea from "./components/TextArea";
import Toggle from "./components/Toggle";
import SelectField from "./components/SelectField";
import FAQItem from "./components/FAQItem";
import Tooltip from "./components/Tooltip";
import { safeRun, escapeHtml } from './utils/helpers';
import { FAQ } from './types';


export default function App() {
  // --- Main State ---
  const [pageType, setPageType] = useState("WebPage");
  const [brand, setBrand] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [canonical, setCanonical] = useState("");
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  const [keywords, setKeywords] = useState("");

  // FAQ
  const [faqList, setFaqList] = useState<FAQ[]>([]);

  // UI state: copy feedback / manual copy dialog
  const [copyStatus, setCopyStatus] = useState<"" | "success" | "error">("");
  const [showManualCopy, setShowManualCopy] = useState(false);
  const manualCopyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showManualCopy && manualCopyRef.current) {
      manualCopyRef.current.focus();
      manualCopyRef.current.select();
    }
  }, [showManualCopy]);

  // --- Derived values ---
  const robots = useMemo(() => {
    const parts = [];
    parts.push(robotsIndex ? "index" : "noindex");
    parts.push(robotsFollow ? "follow" : "nofollow");
    return parts.join(", ");
  }, [robotsIndex, robotsFollow]);

  const parsedFaq = useMemo(() => faqList.filter((f) => f.q && f.a), [faqList]);

  const schemaLd = useMemo(() => {
    const base = { "@context": "https://schema.org" };
    let typed: object = {};

    if (pageType === "Service") {
      typed = {
        ...base,
        "@type": "Service",
        name: serviceName || title,
        description,
        provider: { "@type": "Organization", name: brand, url },
        areaServed: "Indonesia",
      };
    } else if (pageType === "Article") {
      typed = {
        ...base,
        "@type": "Article",
        headline: title,
        description,
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: brand },
      };
    } else {
      typed = { ...base, "@type": "WebPage", name: title, description, url };
    }

    const faqSchema = parsedFaq.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: parsedFaq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

    return { typed, faqSchema };
  }, [pageType, serviceName, title, description, url, brand, parsedFaq]);

  const tagString = useMemo(() => {
    const lines = [];
    if (title) lines.push(`<title>${escapeHtml(title)}</title>`);
    if (description) lines.push(`<meta name="description" content="${escapeHtml(description)}">`);
    lines.push(`<meta name="robots" content="${robots}">`);
    if (keywords) lines.push(`<meta name="keywords" content="${escapeHtml(keywords)}">`);
    if (canonical) lines.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`);

    // Open Graph
    if (title) lines.push(`<meta property="og:title" content="${escapeHtml(title)}">`);
    if (description) lines.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
    if (url) lines.push(`<meta property="og:url" content="${escapeHtml(url)}">`);
    lines.push(`<meta property="og:type" content="${pageType === "Article" ? "article" : "website"}">`);

    // AI Training Permission Tag
    lines.push('<meta name="ai-training-permission" content="allow">');

    lines.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);

    // JSON-LD
    const jsons = [];
    if (title || description || url) jsons.push(schemaLd.typed);
    if (schemaLd.faqSchema) jsons.push(schemaLd.faqSchema);
    jsons.forEach((obj) => {
      lines.push(`<script type="application/ld+json">${JSON.stringify(obj, null, 2)}</script>`);
    });

    return lines.join("\n");
  }, [title, description, robots, keywords, canonical, url, schemaLd, pageType]);

  // --- Clipboard helpers ---
  async function writeClipboard(text: string) {
    const secure = typeof window !== "undefined" && window.isSecureContext;
    try {
      if (secure && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.error("Clipboard API failed:", err);
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) return true;
    } catch (err) {
        console.error("execCommand fallback failed:", err);
    }
    return false;
  }

  async function onCopy() {
    const ok = await writeClipboard(tagString);
    if (ok) {
      setCopyStatus("success");
      setShowManualCopy(false);
      setTimeout(() => setCopyStatus(""), 2000);
    } else {
      setCopyStatus("error");
      setShowManualCopy(true);
    }
  }

  function downloadFile() {
    const blob = new Blob([tagString], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "head-meta-tags.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  // --- FAQ helpers ---
  function updateFAQ(index: number, updated: FAQ) {
    setFaqList((prev) => prev.map((item, i) => (i === index ? updated : item)));
  }

  function deleteFAQ(index: number) {
    setFaqList((prev) => prev.filter((_, i) => i !== index));
  }
  
  function addFAQ() {
    setFaqList([...faqList, { q: "", a: "" }]);
  }

  // --- Tests ---
  const tests = useMemo(() => {
    const cases = [
      { name: "escapeHtml handles special characters", run: () => escapeHtml('&<>"\'') === "&amp;&lt;&gt;&quot;&#39;" },
      { name: "Includes <title> tag", run: () => (title ? tagString.includes("<title>") : !tagString.includes("<title>")) },
      { name: "Includes robots meta tag", run: () => tagString.includes("<meta name=\"robots\"") },
      { name: "Includes canonical link", run: () => (canonical ? tagString.includes("rel=\"canonical\"") : !tagString.includes("rel=\"canonical\"")) },
      { name: "og:type matches Page Type", run: () => tagString.includes(pageType === "Article" ? "og:type\" content=\"article\"" : "og:type\" content=\"website\"") },
      { name: "og:url exists when url is set", run: () => (url ? tagString.includes("property=\"og:url\"") : !tagString.includes("property=\"og:url\"")) },
      { name: "FAQ schema exists when items exist", run: () => (parsedFaq.length > 0 ? tagString.includes('"@type": "FAQPage"') : !tagString.includes('"@type": "FAQPage"')) },
      { name: "Viewport meta exists", run: () => tagString.includes("name=\"viewport\"") },
    ];
    return cases.map((c) => ({ name: c.name, pass: safeRun(c.run) }));
  }, [tagString, parsedFaq, pageType, url, title, canonical]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">SEO Meta Tag Generator</h1>
        <p className="mt-2 text-sm text-gray-600">Buat tag meta yang ramah SEO dan dapat dicrawling AI. Jika 'Copy' gagal, gunakan 'Manual Copy' atau 'Download'.</p>
      </header>

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
          <SelectField label="Page Type" tooltip="Determines the JSON-LD schema and og:type." value={pageType} onChange={setPageType} options={["WebPage", "Service", "Article"]} />
          <TextInput label="Brand" tooltip="The name of the organization or brand." value={brand} onChange={setBrand} placeholder="Your Brand Name"/>
          <TextInput label="Service or Page Name" tooltip="The main name of the service or page." value={serviceName} onChange={setServiceName} placeholder="Page Name" />
          <TextInput label="Title" tooltip="The main SEO title for the page." value={title} onChange={setTitle} placeholder="Main Page Title | Your Brand Name" helper="Use hyphens (-) as separators for readability." />
          <TextArea label="Description" tooltip="Meta description for search results and social previews." value={description} onChange={setDescription} placeholder="A brief description of this page. Explain what visitors will find here." rows={3} />
          <TextInput label="URL" tooltip="The final URL of the page." value={url} onChange={setUrl} placeholder="https://www.yourdomain.com/page"/>
          <TextInput label="Canonical" tooltip="The primary URL to prevent duplicate content." value={canonical} onChange={setCanonical} placeholder="https://www.yourdomain.com/page"/>

          <fieldset className="rounded-lg border p-4">
            <legend className="px-1 text-sm font-medium">Robots Control</legend>
            <div className="flex items-center gap-6 pt-2">
              <Toggle label="index" tooltip="Allow search engines to index this page." checked={robotsIndex} onChange={setRobotsIndex} />
              <Toggle label="follow" tooltip="Allow crawlers to follow links on this page." checked={robotsFollow} onChange={setRobotsFollow} />
            </div>
          </fieldset>

          <TextInput label="Meta Keywords (Optional)" tooltip="Still used by some AI crawlers and internal searches." value={keywords} onChange={setKeywords} placeholder="keyword 1, keyword 2, keyword 3" helper="Separate with commas."/>

          <fieldset className="space-y-2 rounded-lg border p-4">
            <legend className="px-1 text-sm font-medium flex items-center">
                FAQ List
                <Tooltip text="Manage questions and answers for the FAQPage JSON-LD schema." />
            </legend>
            <div className="space-y-3">
              {faqList.map((faq, idx) => (
                <FAQItem key={idx} index={idx} faq={faq} onChange={updateFAQ} onDelete={deleteFAQ} />
              ))}
              <button onClick={addFAQ} className="flex items-center gap-2 rounded-full border bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-sm shadow-sm transition-colors">
                <Plus size={16} /> Add Question
              </button>
            </div>
          </fieldset>
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm sticky top-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Generated &lt;head&gt; tags</h2>
              <div className="flex items-center gap-2">
                <button onClick={onCopy} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm transition-colors ${copyStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-white border hover:bg-gray-50'}`}>
                  {copyStatus === "success" ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copyStatus === "success" ? "Copied!" : "Copy"}
                </button>
                <button onClick={() => setShowManualCopy(true)} className="rounded-full border bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">Manual Copy</button>
                <button onClick={downloadFile} className="rounded-full border bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">Download</button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">Copy code dibawah ini dan pastekan di antara tag <code>&lt;head&gt;</code>...<code>&lt;/head&gt;</code></p>
            {copyStatus === "error" && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Clipboard API is blocked. Please use the Manual Copy dialog.</span>
              </div>
            )}
            <pre className="max-h-[520px] overflow-auto rounded-xl bg-gray-900 text-gray-200 p-4 text-xs leading-relaxed">
              <code>{tagString}</code>
            </pre>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Unit Tests</h3>
              <span className="text-xs text-gray-500">Auto run on change</span>
            </div>
            <ul className="space-y-1 text-xs">
              {tests.map((t, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border bg-gray-50 px-2 py-1.5">
                  <span className="text-gray-700">{t.name}</span>
                  <span className={`font-bold ${t.pass ? "text-green-600" : "text-red-600"}`}>{t.pass ? "PASS" : "FAIL"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Manual Copy Dialog */}
      {showManualCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setShowManualCopy(false)}>
          <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-semibold">Manual Copy</h4>
              <button onClick={() => setShowManualCopy(false)} className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100">Close</button>
            </div>
            <p className="mb-2 text-sm text-gray-600">Select all text (Ctrl/Cmd + A) and copy (Ctrl/Cmd + C).</p>
            <textarea ref={manualCopyRef} className="h-64 w-full rounded-xl border bg-gray-50 p-2 text-xs" value={tagString} readOnly />
          </div>
        </div>
      )}
    </div>
  );
}