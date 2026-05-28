export default function Home() {
  return (
    <main style={{ fontFamily: "var(--font-body)" }}>
      {/* NAVBAR */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #dcfce7", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "#22c55e" }}>PricingRL</span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="#features" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem" }}>Fonctionnalités</a>
          <a href="#how" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem" }}>Comment ça marche</a>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" style={{ background: "#22c55e", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "8px", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>Démo gratuite</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "#22c55e", color: "#fff", borderRadius: "999px", padding: "0.4rem 1.2rem", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.5rem", letterSpacing: "0.05em" }}>Reinforcement Learning · Dynamic Pricing</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15, color: "#0f172a", marginBottom: "1.5rem", maxWidth: "800px", margin: "0 auto 1.5rem" }}>
          Le prix optimal.<br /><span style={{ color: "#22c55e" }}>À chaque instant. Automatiquement.</span>
        </h1>
        <p style={{ color: "#475569", fontSize: "1.15rem", maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          Prix optimal à chaque instant par RL — +12% de revenus dès le premier mois, contraintes métier respectées, zéro intervention manuelle.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3.5rem" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" style={{ background: "#22c55e", color: "#fff", padding: "0.85rem 2rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>Demander une démo</a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20PricingRL%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" style={{ background: "#25d366", color: "#fff", padding: "0.85rem 2rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>WhatsApp</a>
        </div>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
          {[{ value: "+12%", label: "revenus M+1" }, { value: "<1ms", label: "décision" }, { value: "J+7", label: "convergence" }, { value: "100%", label: "contraintes" }].map((m) => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "#22c55e" }}>{m.value}</div>
              <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "5rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: "0.75rem" }}>Comment PricingRL optimise vos prix</h2>
          <p style={{ color: "#64748b", textAlign: "center", marginBottom: "3rem", fontSize: "1rem" }}>Un agent RL qui apprend et s&apos;adapte en permanence à votre marché.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {[
              { icon: "🎯", title: "Reinforcement learning", desc: "L'agent apprend en continu à maximiser le revenu en testant des stratégies de prix et en observant les réactions du marché." },
              { icon: "⚙️", title: "Contraintes métier intégrées", desc: "Prix plancher/plafond, parité concurrentielle, fenêtres temporelles, règles promotionnelles — toutes vos contraintes sont encodées et toujours respectées." },
              { icon: "🧪", title: "A/B testing automatique", desc: "PricingRL teste plusieurs stratégies en parallèle et alloue progressivement plus de trafic aux stratégies les plus performantes." },
            ].map((f) => (
              <div key={f.title} style={{ background: "#f0fdf4", borderRadius: "16px", padding: "2rem", border: "1px solid #dcfce7" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.75rem" }}>{f.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "0.95rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "5rem 2rem", background: "#f0fdf4" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: "0.75rem" }}>Comment ça marche</h2>
          <p style={{ color: "#64748b", textAlign: "center", marginBottom: "3rem", fontSize: "1rem" }}>De la configuration à l&apos;optimisation en production en 7 jours.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {[
              { step: "01", title: "Définissez vos règles", desc: "Seuils de prix, objectifs (volume vs marge), contraintes légales et commerciales. Interface no-code pour les équipes pricing." },
              { step: "02", title: "L'agent apprend", desc: "En 7 jours d'exploitation, l'agent converge vers une stratégie optimale. Les premières améliorations de revenu sont visibles dès J+2." },
              { step: "03", title: "Prix optimal en production", desc: "L'API retourne le prix recommandé en moins d'1ms. Intégration sur votre e-commerce, marketplace ou système de facturation." },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", background: "#fff", borderRadius: "16px", padding: "1.75rem", border: "1px solid #dcfce7" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "#22c55e", minWidth: "3rem" }}>{s.step}</span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.5rem" }}>{s.title}</h3>
                  <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "0.95rem" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 2rem", background: "#22c55e", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>+12% de revenus dès le premier mois</h2>
        <p style={{ color: "#dcfce7", fontSize: "1.1rem", marginBottom: "2rem" }}>Simulation gratuite sur vos données de l&apos;année passée.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: "#22c55e", padding: "0.9rem 2.25rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>Planifier une démo</a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20PricingRL%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" style={{ background: "#25d366", color: "#fff", padding: "0.9rem 2.25rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>WhatsApp</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "2.5rem 2rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: "0.5rem" }}>PricingRL by Wikolabs</div>
        <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
          <a href="mailto:team@wikolabs.com" style={{ color: "#94a3b8", textDecoration: "none" }}>team@wikolabs.com</a>
          {" · "}
          <a href="https://wikolabs.com" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "none" }}>wikolabs.com</a>
        <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="mailto:team@wikolabs.com" style={{ color: "#94a3b8", textDecoration: "none" }}>team@wikolabs.com</a>
          <span>·</span>
          <a href="tel:+261386626100" style={{ color: "#94a3b8", textDecoration: "none" }}>+261 38 66 261 00</a>
          <span>·</span>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "none" }}>Prendre RDV</a>
        </div>        <div style={{ fontSize: "0.8rem", color: "#475569" }}>© 2026 Wikolabs. Tous droits réservés.</div>
      </footer>
    </main>
  );
}
