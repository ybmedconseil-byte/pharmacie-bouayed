import { useState, useEffect } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ============================================================
// 🔧 COLLER ICI VOS CLÉS FIREBASE (étape 3 du guide)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyBnDDEl94fCGpuL-eZuqjYfSs5afZLSbYA",
  authDomain: "pharmacie-app-bec58.firebaseapp.com",
  databaseURL: "https://pharmacie-app-bec58-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pharmacie-app-bec58",
  storageBucket: "pharmacie-app-bec58.firebasestorage.app",
  messagingSenderId: "803414246603",
  appId: "1:803414246603:web:e6bd2e239c3ff95d2dc74e"
};
// ============================================================

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ─── ICONS ───
const Icons = {
  Réclamations: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>,
  Commandes: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  Paiements: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  Consignes: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Ruptures: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01" strokeWidth="3"/></svg>,
  Paramètres: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
};

const MODULES = ["Réclamations", "Commandes", "Paiements", "Consignes", "Ruptures"];
const MODULE_DESC = {
  Réclamations: "Gérez les réclamations fournisseurs, clients et internes.",
  Commandes: "Notez les commandes clients en attente de livraison.",
  Paiements: "Enregistrez les paiements espèces aux fournisseurs.",
  Consignes: "Laissez des messages et consignes à vos collègues.",
  Ruptures: "Signalez les produits manquants ou en rupture de stock.",
  Paramètres: "Gérez les collaborateurs, fournisseurs et nom de la pharmacie.",
};
const STATUT_COLORS = {
  "En cours": "#f59e0b", "Résolu": "#10b981", "En attente": "#6366f1",
  "Livré": "#10b981", "Commandé": "#6366f1", "Annulé": "#ef4444",
  "Payé": "#10b981", "À vérifier": "#f59e0b",
  "Rupture": "#ef4444", "Commandé fournisseur": "#6366f1", "Reçu": "#10b981",
};

const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: "#5a7a90", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 };
const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #c2d9f0", borderRadius: 9, fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#1a2e3b", outline: "none", boxSizing: "border-box" };
const btnPrimary = { padding: "10px 22px", background: "#0f4c81", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14 };
const btnSecondary = { padding: "10px 22px", background: "#e8f0f8", color: "#0f4c81", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14 };

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function Empty({ text }) {
  return <div style={{ textAlign: "center", padding: "40px 20px", color: "#b0c4d8", fontSize: 14 }}><div style={{ fontSize: 32, marginBottom: 8 }}>—</div>{text}</div>;
}
function StatutBadge({ statut, onClick }) {
  return (
    <button onClick={onClick} style={{ whiteSpace: "nowrap", padding: "5px 13px", borderRadius: 20, border: "none", cursor: onClick ? "pointer" : "default", fontWeight: 700, fontSize: 12, background: (STATUT_COLORS[statut] || "#8fa3b8") + "22", color: STATUT_COLORS[statut] || "#8fa3b8" }}>
      {statut}
    </button>
  );
}
function Loader() {
  return <div style={{ textAlign: "center", padding: "40px 20px", color: "#8fa3b8", fontSize: 14 }}>Chargement…</div>;
}

// ─── HOOK FIREBASE ───
function useFirebase(path, defaultVal = []) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const r = ref(db, path);
    const unsub = onValue(r, (snap) => {
      const val = snap.val();
      if (val === null) { setData(defaultVal); return; }
      if (Array.isArray(defaultVal)) {
        const arr = Object.entries(val).map(([id, v]) => ({ ...v, id }));
        setData(arr);
      } else {
        setData(val);
      }
    });
    return () => unsub();
  }, [path]);
  return data;
}

function fbAdd(path, obj) { push(ref(db, path), { ...obj, date: Date.now() }); }
function fbUpdate(path, id, obj) { update(ref(db, `${path}/${id}`), obj); }
function fbRemove(path, id) { remove(ref(db, `${path}/${id}`)); }
function fbSet(path, val) { set(ref(db, path), val); }

// ─── LISTE ÉDITABLE ───
function EditableList({ title, icon, items, fbPath, placeholder }) {
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  if (!items) return <Loader />;
  return (
    <div style={{ background: "#fff", border: "1.5px solid #e2ecf5", borderRadius: 14, padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ color: "#0f4c81" }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: 15, color: "#0a3560" }}>{title}</span>
        <span style={{ background: "#e8f0f8", color: "#0f4c81", borderRadius: 20, padding: "1px 9px", fontSize: 12, fontWeight: 700, marginLeft: "auto" }}>{items.length}</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && input.trim()) { push(ref(db, fbPath), { nom: input.trim() }); setInput(""); }}} placeholder={placeholder} style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => { if (!input.trim()) return; push(ref(db, fbPath), { nom: input.trim() }); setInput(""); }} style={{ ...btnPrimary, padding: "9px 16px", fontSize: 18 }}>+</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, background: "#f7fafd", border: "1px solid #e8f0f8" }}>
            {editingId === item.id ? (
              <>
                <input value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { fbUpdate(fbPath, item.id, { nom: editVal }); setEditingId(null); } if (e.key === "Escape") setEditingId(null); }} autoFocus style={{ ...inputStyle, flex: 1, padding: "5px 10px", fontSize: 13 }} />
                <button onClick={() => { fbUpdate(fbPath, item.id, { nom: editVal }); setEditingId(null); }} style={{ padding: "5px 12px", background: "#10b981", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>✓</button>
                <button onClick={() => setEditingId(null)} style={{ padding: "5px 10px", background: "#e8f0f8", color: "#5a7a90", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12 }}>✕</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 14, color: "#1a2e3b" }}>{item.nom}</span>
                <button onClick={() => { setEditingId(item.id); setEditVal(item.nom); }} style={{ padding: "4px 10px", background: "#e8f0f8", color: "#0f4c81", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12 }}>✎</button>
                <button onClick={() => fbRemove(fbPath, item.id)} style={{ padding: "4px 9px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13 }}>✕</button>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && <div style={{ fontSize: 13, color: "#b0c4d8", textAlign: "center", padding: "10px 0" }}>Aucun élément</div>}
      </div>
    </div>
  );
}

// ─── PARAMÈTRES ───
function Parametres({ pharmacieName }) {
  const collaborateurs = useFirebase("collaborateurs", []);
  const fournisseurs = useFirebase("fournisseurs", []);
  const [nameInput, setNameInput] = useState(pharmacieName || "Pharmacie Bouayed");
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div style={{ background: "#fff", border: "1.5px solid #e2ecf5", borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>⚕</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#0a3560" }}>Nom de la pharmacie</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={nameInput} onChange={e => setNameInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => { fbSet("config/pharmacieName", nameInput); setSaved(true); setTimeout(() => setSaved(false), 2000); }} style={{ ...btnPrimary, padding: "9px 16px" }}>{saved ? "✓ Sauvé" : "Sauver"}</button>
        </div>
      </div>
      <EditableList title="Collaborateurs" icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>} items={collaborateurs} fbPath="collaborateurs" placeholder="Ajouter un collaborateur…" />
      <EditableList title="Fournisseurs" icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>} items={fournisseurs} fbPath="fournisseurs" placeholder="Ajouter un fournisseur…" />
      <div style={{ background: "#f0f6ff", border: "1.5px solid #c2d9f0", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#5a7a90" }}>
        💡 Les modifications sont visibles instantanément sur tous les téléphones.
      </div>
    </div>
  );
}

// ─── RÉCLAMATIONS ───
function Reclamations() {
  const items = useFirebase("reclamations", []);
  const collabs = useFirebase("collaborateurs", []);
  const [form, setForm] = useState({ type: "Fournisseur", objet: "", description: "", auteur: "" });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("Tous");
  if (!items || !collabs) return <Loader />;
  const collabNoms = collabs.map(c => c.nom);
  const filtered = filter === "Tous" ? items : items.filter(i => i.statut === filter);
  const cycleStatut = (item) => {
    const cycle = ["En cours", "En attente", "Résolu"];
    fbUpdate("reclamations", item.id, { statut: cycle[(cycle.indexOf(item.statut) + 1) % cycle.length] });
  };
  const add = () => {
    if (!form.objet.trim()) return;
    fbAdd("reclamations", { ...form, statut: "En cours", auteur: form.auteur || collabNoms[0] || "" });
    setForm({ type: "Fournisseur", objet: "", description: "", auteur: form.auteur });
    setShowForm(false);
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {["Tous", "En cours", "En attente", "Résolu"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 13px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, background: filter === f ? "#0f4c81" : "#e8f0f8", color: filter === f ? "#fff" : "#0f4c81" }}>{f}</button>
        ))}
      </div>
      <button onClick={() => setShowForm(!showForm)} style={{ ...btnPrimary, width: "100%", marginBottom: 16 }}>+ Nouvelle réclamation</button>
      {showForm && (
        <div style={{ background: "#f0f6ff", border: "1.5px solid #c2d9f0", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                <option>Fournisseur</option><option>Client</option><option>Interne</option>
              </select>
            </div>
            <div><label style={labelStyle}>Auteur</label>
              <select value={form.auteur} onChange={e => setForm({ ...form, auteur: e.target.value })} style={inputStyle}>
                <option value="">-- Choisir --</option>
                {collabNoms.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}><label style={labelStyle}>Objet *</label><input value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} placeholder="Ex : Livraison manquante…" style={inputStyle} /></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={add} style={btnPrimary}>Enregistrer</button><button onClick={() => setShowForm(false)} style={btnSecondary}>Annuler</button></div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.sort((a,b) => b.date - a.date).map(item => (
          <div key={item.id} style={{ background: "#fff", border: "1.5px solid #e2ecf5", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, marginRight: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                  <span style={{ background: "#e8f0f8", color: "#0f4c81", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>{item.type}</span>
                  <span style={{ fontSize: 11, color: "#8fa3b8" }}>{item.auteur} · {formatDate(item.date)}</span>
                </div>
                <div style={{ fontWeight: 700, color: "#1a2e3b", fontSize: 14, marginBottom: 3 }}>{item.objet}</div>
                {item.description && <div style={{ color: "#5a7a90", fontSize: 13 }}>{item.description}</div>}
              </div>
              <StatutBadge statut={item.statut} onClick={() => cycleStatut(item)} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <Empty text="Aucune réclamation" />}
      </div>
    </div>
  );
}

// ─── COMMANDES ───
function Commandes() {
  const items = useFirebase("commandes", []);
  const collabs = useFirebase("collaborateurs", []);
  const [form, setForm] = useState({ client: "", tel: "", produit: "", note: "", auteur: "", ordonnance: null });
  const [showForm, setShowForm] = useState(false);
  const [zoomImg, setZoomImg] = useState(null);
  if (!items || !collabs) return <Loader />;
  const collabNoms = collabs.map(c => c.nom);
  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, ordonnance: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const add = () => {
    if (!form.client.trim() || !form.produit.trim()) return;
    fbAdd("commandes", { ...form, statut: "En attente" });
    setForm({ client: "", tel: "", produit: "", note: "", auteur: form.auteur, ordonnance: null });
    setShowForm(false);
  };
  const cycleStatut = (item) => {
    const cycle = ["En attente", "Commandé", "Livré", "Annulé"];
    fbUpdate("commandes", item.id, { statut: cycle[(cycle.indexOf(item.statut) + 1) % cycle.length] });
  };
  return (
    <div>
      {zoomImg && (
        <div onClick={() => setZoomImg(null)} style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <img src={zoomImg} alt="ordonnance" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 12 }} />
          <button onClick={() => setZoomImg(null)} style={{ position: "absolute", top: 16, right: 16, background: "#fff", border: "none", borderRadius: "50%", width: 36, height: 36, fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
      )}
      <button onClick={() => setShowForm(!showForm)} style={{ ...btnPrimary, width: "100%", marginBottom: 16 }}>+ Nouvelle commande client</button>
      {showForm && (
        <div style={{ background: "#f0f6ff", border: "1.5px solid #c2d9f0", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>Nom du client *</label><input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Mme. Dupont" style={inputStyle} /></div>
            <div><label style={labelStyle}>Téléphone</label><input value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} placeholder="06 xx xx xx xx" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: 10 }}><label style={labelStyle}>Produit(s) *</label><input value={form.produit} onChange={e => setForm({ ...form, produit: e.target.value })} placeholder="Ex : Doliprane 1000mg x2…" style={inputStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div><label style={labelStyle}>Note</label><input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Urgence, rappeler…" style={inputStyle} /></div>
            <div><label style={labelStyle}>Saisi par</label>
              <select value={form.auteur} onChange={e => setForm({ ...form, auteur: e.target.value })} style={inputStyle}>
                <option value="">-- Choisir --</option>
                {collabNoms.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>📋 Photo ordonnance</label>
            {form.ordonnance ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src={form.ordonnance} alt="ordo" onClick={() => setZoomImg(form.ordonnance)} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "2px solid #c2d9f0", cursor: "zoom-in" }} />
                <div>
                  <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700, marginBottom: 4 }}>✓ Photo ajoutée</div>
                  <button onClick={() => setForm(f => ({ ...f, ordonnance: null }))} style={{ ...btnSecondary, padding: "5px 12px", fontSize: 12 }}>Supprimer</button>
                </div>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "2px dashed #c2d9f0", borderRadius: 10, cursor: "pointer", background: "#fff" }}>
                <span style={{ fontSize: 22 }}>📷</span>
                <span style={{ fontSize: 13, color: "#5a7a90", fontWeight: 600 }}>Prendre en photo ou importer</span>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
              </label>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={add} style={btnPrimary}>Enregistrer</button><button onClick={() => setShowForm(false)} style={btnSecondary}>Annuler</button></div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.sort((a,b) => b.date - a.date).map(item => (
          <div key={item.id} style={{ background: "#fff", border: "1.5px solid #e2ecf5", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, marginRight: 10 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, color: "#0f4c81", fontSize: 15 }}>{item.client}</span>
                  {item.tel && <span style={{ fontSize: 12, color: "#8fa3b8" }}>📞 {item.tel}</span>}
                </div>
                <div style={{ color: "#1a2e3b", fontSize: 13, marginBottom: 3 }}>{item.produit}</div>
                {item.note && <div style={{ color: "#d97706", fontSize: 12, fontWeight: 600 }}>⚠ {item.note}</div>}
                <div style={{ fontSize: 11, color: "#b0c4d8", marginTop: 4 }}>{item.auteur} · {formatDate(item.date)}</div>
                {item.ordonnance && <img src={item.ordonnance} alt="ordo" onClick={() => setZoomImg(item.ordonnance)} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: "2px solid #c2d9f0", cursor: "zoom-in", marginTop: 8 }} />}
              </div>
              <StatutBadge statut={item.statut} onClick={() => cycleStatut(item)} />
            </div>
          </div>
        ))}
        {items.length === 0 && <Empty text="Aucune commande" />}
      </div>
    </div>
  );
}

// ─── PAIEMENTS ───
function Paiements() {
  const items = useFirebase("paiements", []);
  const collabs = useFirebase("collaborateurs", []);
  const fournisseurs = useFirebase("fournisseurs", []);
  const [form, setForm] = useState({ fournisseur: "", montant: "", reference: "", remis_par: "", note: "" });
  const [showForm, setShowForm] = useState(false);
  if (!items || !collabs || !fournisseurs) return <Loader />;
  const collabNoms = collabs.map(c => c.nom);
  const fournisseurNoms = fournisseurs.map(f => f.nom);
  const total = items.filter(i => i.statut === "Payé").reduce((s, i) => s + parseFloat(i.montant || 0), 0);
  const add = () => {
    if (!form.fournisseur.trim() || !form.montant) return;
    fbAdd("paiements", { ...form, montant: parseFloat(form.montant), statut: "À vérifier" });
    setForm({ fournisseur: form.fournisseur, montant: "", reference: "", remis_par: form.remis_par, note: "" });
    setShowForm(false);
  };
  const cycleStatut = (item) => {
    fbUpdate("paiements", item.id, { statut: item.statut === "À vérifier" ? "Payé" : "À vérifier" });
  };
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #0f4c81, #1a6bac)", borderRadius: 14, padding: "16px 20px", marginBottom: 16, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 3 }}>Total espèces confirmées</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</div>
        </div>
        <div style={{ fontSize: 34, opacity: 0.25 }}>💵</div>
      </div>
      <button onClick={() => setShowForm(!showForm)} style={{ ...btnPrimary, width: "100%", marginBottom: 16 }}>+ Saisir un paiement espèces</button>
      {showForm && (
        <div style={{ background: "#f0f6ff", border: "1.5px solid #c2d9f0", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>Fournisseur *</label>
              {fournisseurNoms.length > 0
                ? <select value={form.fournisseur} onChange={e => setForm({ ...form, fournisseur: e.target.value })} style={inputStyle}><option value="">-- Choisir --</option>{fournisseurNoms.map(f => <option key={f}>{f}</option>)}</select>
                : <input value={form.fournisseur} onChange={e => setForm({ ...form, fournisseur: e.target.value })} placeholder="Ex : Boiron…" style={inputStyle} />}
            </div>
            <div><label style={labelStyle}>Montant (€) *</label><input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="0.00" style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>Réf. Facture</label><input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="FAC-2024-XXXX" style={inputStyle} /></div>
            <div><label style={labelStyle}>Remis par</label>
              <select value={form.remis_par} onChange={e => setForm({ ...form, remis_par: e.target.value })} style={inputStyle}>
                <option value="">-- Choisir --</option>{collabNoms.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Note</label><input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Remarque…" style={inputStyle} /></div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={add} style={btnPrimary}>Enregistrer</button><button onClick={() => setShowForm(false)} style={btnSecondary}>Annuler</button></div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.sort((a,b) => b.date - a.date).map(item => (
          <div key={item.id} style={{ background: "#fff", border: "1.5px solid #e2ecf5", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, marginRight: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, color: "#0f4c81", fontSize: 14 }}>{item.fournisseur}</span>
                  {item.reference && <span style={{ fontSize: 11, color: "#8fa3b8", background: "#f0f4f8", padding: "2px 7px", borderRadius: 6 }}>{item.reference}</span>}
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1a2e3b" }}>{parseFloat(item.montant).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</div>
                <div style={{ fontSize: 11, color: "#b0c4d8", marginTop: 3 }}>💵 Espèces · {item.remis_par} · {formatDate(item.date)}</div>
                {item.note && <div style={{ color: "#5a7a90", fontSize: 12, marginTop: 3 }}>{item.note}</div>}
              </div>
              <StatutBadge statut={item.statut} onClick={() => cycleStatut(item)} />
            </div>
          </div>
        ))}
        {items.length === 0 && <Empty text="Aucun paiement saisi" />}
      </div>
    </div>
  );
}

// ─── CONSIGNES ───
function Consignes() {
  const items = useFirebase("consignes", []);
  const collabs = useFirebase("collaborateurs", []);
  const [form, setForm] = useState({ destinataire: "Tous", priorite: "normale", texte: "", auteur: "" });
  const [showForm, setShowForm] = useState(false);
  const [filterDest, setFilterDest] = useState("Tous");
  if (!items || !collabs) return <Loader />;
  const collabNoms = collabs.map(c => c.nom);
  const destOptions = ["Tous", ...collabNoms];
  const filtered = filterDest === "Tous" ? items : items.filter(i => i.destinataire === filterDest || i.destinataire === "Tous");
  const nonLus = items.filter(i => !i.lu).length;
  const add = () => {
    if (!form.texte.trim()) return;
    fbAdd("consignes", { ...form, lu: false });
    setForm({ destinataire: "Tous", priorite: "normale", texte: "", auteur: form.auteur });
    setShowForm(false);
  };
  return (
    <div>
      {nonLus > 0 && <div style={{ background: "#fef3c7", border: "1.5px solid #f59e0b", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#92400e", fontWeight: 600 }}>📌 {nonLus} consigne{nonLus > 1 ? "s" : ""} non lue{nonLus > 1 ? "s" : ""}</div>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {destOptions.map(c => (
          <button key={c} onClick={() => setFilterDest(c)} style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, background: filterDest === c ? "#0f4c81" : "#e8f0f8", color: filterDest === c ? "#fff" : "#0f4c81" }}>{c}</button>
        ))}
      </div>
      <button onClick={() => setShowForm(!showForm)} style={{ ...btnPrimary, width: "100%", marginBottom: 16 }}>+ Laisser une consigne</button>
      {showForm && (
        <div style={{ background: "#f0f6ff", border: "1.5px solid #c2d9f0", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>De</label>
              <select value={form.auteur} onChange={e => setForm({ ...form, auteur: e.target.value })} style={inputStyle}>
                <option value="">-- Choisir --</option>{collabNoms.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Pour</label>
              <select value={form.destinataire} onChange={e => setForm({ ...form, destinataire: e.target.value })} style={inputStyle}>
                {destOptions.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Priorité</label>
              <select value={form.priorite} onChange={e => setForm({ ...form, priorite: e.target.value })} style={inputStyle}>
                <option value="haute">🔴 Haute</option><option value="normale">🟡 Normale</option><option value="basse">🟢 Basse</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Message *</label><textarea value={form.texte} onChange={e => setForm({ ...form, texte: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={add} style={btnPrimary}>Envoyer</button><button onClick={() => setShowForm(false)} style={btnSecondary}>Annuler</button></div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.sort((a,b) => b.date - a.date).map(item => (
          <div key={item.id} style={{ background: item.lu ? "#fff" : "#f0f7ff", border: `1.5px solid ${item.priorite === "haute" ? "#f59e0b" : "#e2ecf5"}`, borderLeft: `4px solid ${item.priorite === "haute" ? "#f59e0b" : item.priorite === "basse" ? "#10b981" : "#6366f1"}`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, marginRight: 8 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#0f4c81" }}>{item.auteur}</span>
                  <span style={{ fontSize: 11, color: "#8fa3b8" }}>→ {item.destinataire} · {formatDate(item.date)}</span>
                  {!item.lu && <span style={{ background: "#0f4c81", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>NON LU</span>}
                </div>
                <div style={{ color: "#1a2e3b", fontSize: 13, lineHeight: 1.6 }}>{item.texte}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => fbUpdate("consignes", item.id, { lu: !item.lu })} style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #c2d9f0", cursor: "pointer", background: "#fff", fontSize: 12, color: "#0f4c81", fontWeight: 600 }}>{item.lu ? "✓" : "Lu"}</button>
                <button onClick={() => fbRemove("consignes", item.id)} style={{ padding: "5px 9px", borderRadius: 8, border: "1.5px solid #fecaca", cursor: "pointer", background: "#fff", fontSize: 12, color: "#ef4444" }}>✕</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <Empty text="Aucune consigne" />}
      </div>
    </div>
  );
}

// ─── RUPTURES ───
function Ruptures() {
  const items = useFirebase("ruptures", []);
  const collabs = useFirebase("collaborateurs", []);
  const fournisseurs = useFirebase("fournisseurs", []);
  const [form, setForm] = useState({ produit: "", reference: "", signale_par: "", fournisseur: "", note: "", urgence: false });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("Tous");
  if (!items || !collabs || !fournisseurs) return <Loader />;
  const collabNoms = collabs.map(c => c.nom);
  const fournisseurNoms = fournisseurs.map(f => f.nom);
  const filtered = filter === "Tous" ? items : filter === "Actifs" ? items.filter(i => i.statut !== "Reçu") : items.filter(i => i.statut === filter);
  const actifs = items.filter(i => i.statut !== "Reçu").length;
  const add = () => {
    if (!form.produit.trim()) return;
    fbAdd("ruptures", { ...form, statut: "Rupture" });
    setForm({ produit: "", reference: "", signale_par: form.signale_par, fournisseur: form.fournisseur, note: "", urgence: false });
    setShowForm(false);
  };
  const cycleStatut = (item) => {
    const cycle = ["Rupture", "Commandé fournisseur", "Reçu"];
    fbUpdate("ruptures", item.id, { statut: cycle[(cycle.indexOf(item.statut) + 1) % cycle.length] });
  };
  return (
    <div>
      {actifs > 0 && <div style={{ background: "#fef2f2", border: "1.5px solid #ef4444", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>🚫 {actifs} produit{actifs > 1 ? "s" : ""} en rupture ou en commande</div>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {["Tous", "Actifs", "Rupture", "Commandé fournisseur", "Reçu"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, background: filter === f ? "#0f4c81" : "#e8f0f8", color: filter === f ? "#fff" : "#0f4c81" }}>{f}</button>
        ))}
      </div>
      <button onClick={() => setShowForm(!showForm)} style={{ ...btnPrimary, width: "100%", marginBottom: 16 }}>+ Signaler un produit manquant</button>
      {showForm && (
        <div style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ marginBottom: 10 }}><label style={labelStyle}>Nom du produit *</label><input value={form.produit} onChange={e => setForm({ ...form, produit: e.target.value })} placeholder="Ex : Doliprane 1000mg…" style={inputStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>Référence / CIP</label><input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="340093…" style={inputStyle} /></div>
            <div><label style={labelStyle}>Fournisseur</label>
              {fournisseurNoms.length > 0
                ? <select value={form.fournisseur} onChange={e => setForm({ ...form, fournisseur: e.target.value })} style={inputStyle}><option value="">-- Choisir --</option>{fournisseurNoms.map(f => <option key={f}>{f}</option>)}</select>
                : <input value={form.fournisseur} onChange={e => setForm({ ...form, fournisseur: e.target.value })} placeholder="Cerp, OCP…" style={inputStyle} />}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>Signalé par</label>
              <select value={form.signale_par} onChange={e => setForm({ ...form, signale_par: e.target.value })} style={inputStyle}>
                <option value="">-- Choisir --</option>{collabNoms.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#1a2e3b", fontWeight: 600 }}>
                <input type="checkbox" checked={form.urgence} onChange={e => setForm({ ...form, urgence: e.target.checked })} style={{ width: 16, height: 16 }} />
                🔴 Urgent
              </label>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Note</label><input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Délai estimé, rupture nationale…" style={inputStyle} /></div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={add} style={btnPrimary}>Enregistrer</button><button onClick={() => setShowForm(false)} style={btnSecondary}>Annuler</button></div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.sort((a,b) => b.date - a.date).map(item => (
          <div key={item.id} style={{ background: item.statut === "Reçu" ? "#f0fdf4" : item.urgence ? "#fff7ed" : "#fff", border: `1.5px solid ${item.urgence && item.statut !== "Reçu" ? "#fed7aa" : item.statut === "Reçu" ? "#bbf7d0" : "#e2ecf5"}`, borderLeft: `4px solid ${item.statut === "Reçu" ? "#10b981" : item.urgence ? "#ef4444" : "#f59e0b"}`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, marginRight: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                  {item.urgence && item.statut !== "Reçu" && <span style={{ background: "#ef444422", color: "#ef4444", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>URGENT</span>}
                  <span style={{ fontWeight: 800, color: "#1a2e3b", fontSize: 14 }}>{item.produit}</span>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "#8fa3b8" }}>
                  {item.reference && <span>CIP: {item.reference}</span>}
                  {item.fournisseur && <span>🏭 {item.fournisseur}</span>}
                  <span>👤 {item.signale_par} · {formatDate(item.date)}</span>
                </div>
                {item.note && <div style={{ color: "#5a7a90", fontSize: 12, marginTop: 3 }}>{item.note}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end" }}>
                <StatutBadge statut={item.statut} onClick={() => cycleStatut(item)} />
                <button onClick={() => fbRemove("ruptures", item.id)} style={{ padding: "3px 8px", borderRadius: 6, border: "1.5px solid #fecaca", cursor: "pointer", background: "transparent", fontSize: 11, color: "#ef4444" }}>Supprimer</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <Empty text="Aucun produit manquant" />}
      </div>
    </div>
  );
}

// ─── APP ───
export default function App() {
  const [active, setActive] = useState("Réclamations");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pharmacieName = useFirebase("config/pharmacieName", "Pharmacie Bouayed");
  const consignes = useFirebase("consignes", []);
  const ruptures = useFirebase("ruptures", []);
  const nonLusCount = consignes ? consignes.filter(i => !i.lu).length : 0;
  const rupturesActives = ruptures ? ruptures.filter(i => i.statut !== "Reçu").length : 0;

  const ALL_MODULES = [...MODULES, "Paramètres"];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f5fb", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg, #0a3560 0%, #0f4c81 100%)", padding: "0 16px", display: "flex", alignItems: "center", height: 56, boxShadow: "0 2px 12px #0a356040", flexShrink: 0, zIndex: 10 }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#fff", marginRight: 12, padding: 6, borderRadius: 8, display: "flex", alignItems: "center" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div style={{ width: 32, height: 32, background: "#ffffff20", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>⚕</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{pharmacieName || "Pharmacie Bouayed"}</div>
            <div style={{ color: "#7fb3d9", fontSize: 10 }}>Espace collaborateurs</div>
          </div>
        </div>
        <div style={{ color: "#7fb3d9", fontSize: 11 }}>{new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: sidebarOpen ? 220 : 0, minWidth: sidebarOpen ? 220 : 0, background: "#fff", borderRight: "1.5px solid #e2ecf5", display: "flex", flexDirection: "column", transition: "width .2s, min-width .2s", overflow: "hidden", flexShrink: 0 }}>
          <nav style={{ padding: "12px 10px", flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#b0c4d8", textTransform: "uppercase", letterSpacing: 1, padding: "4px 10px 8px" }}>Navigation</div>
            {ALL_MODULES.map(mod => {
              const badge = mod === "Consignes" ? nonLusCount : mod === "Ruptures" ? rupturesActives : 0;
              return (
                <button key={mod} onClick={() => setActive(mod)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: active === mod ? 700 : 500, background: active === mod ? "#e8f3ff" : "transparent", color: active === mod ? "#0f4c81" : "#5a7a90", textAlign: "left", marginBottom: 2, position: "relative" }}>
                  <span style={{ color: active === mod ? "#0f4c81" : "#8fa3b8" }}>{Icons[mod]}</span>
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>{mod}</span>
                  {badge > 0 && <span style={{ background: mod === "Ruptures" ? "#ef4444" : "#f59e0b", color: "#fff", borderRadius: 20, minWidth: 18, height: 18, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{badge}</span>}
                  {active === mod && <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, background: "#0f4c81", borderRadius: "0 3px 3px 0" }} />}
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #e8f0f8", fontSize: 11, color: "#b0c4d8" }}>v2.0 · Firebase 🔥</div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 16px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0a3560" }}>{active}</h1>
              <p style={{ margin: "3px 0 0", color: "#8fa3b8", fontSize: 13 }}>{MODULE_DESC[active]}</p>
            </div>
            {active === "Réclamations" && <Reclamations />}
            {active === "Commandes" && <Commandes />}
            {active === "Paiements" && <Paiements />}
            {active === "Consignes" && <Consignes />}
            {active === "Ruptures" && <Ruptures />}
            {active === "Paramètres" && <Parametres pharmacieName={pharmacieName} />}
          </div>
        </div>
      </div>
    </div>
  );
}
