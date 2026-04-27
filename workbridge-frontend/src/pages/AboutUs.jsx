import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Images & Content ────────────────────────────────────────────────────────
const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1581578731522-745d05cb9703?auto=format&fit=crop&q=80&w=1200",
    title_en: "Empowering Pakistan's Workforce",
    title_ur: "پاکستان کی ورک فورس کو بااختیار بنانا"
  },
  {
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
    title_en: "Security You Can Trust",
    title_ur: "تحفظ جس پر آپ بھروسہ کر سکتے ہیں"
  }
];

const CONTENT = {
  en: {
    dir: "ltr",
    teamTitle: "The Minds Behind WorkBridge",
    team: [
      { name: "Fatima Tahir", role: "Software Architect", id: "23L-0799" },
      { name: "Adeeba Haq", role: "Lead Developer", id: "23L-2540" },
      { name: "Zainab Akram", role: "UI/UX Designer", id: "23L-0909" }
    ],
    securityTitle: "Our Security Standards",
    securityDesc: "We implement rigorous protocols to ensure your data and safety remain our top priority.",
    cta: "Join the Movement"
  },
  ur: {
    dir: "rtl",
    teamTitle: "ورک برج بنانے والے",
    team: [
      { name: "فاطمہ طاہر", role: "سافٹ ویئر آرکیٹیکٹ", id: "23L-0799" },
      { name: "ادیبہ حق", role: "لیڈ ڈویلپر", id: "23L-2540" },
      { name: "زینب اکرم", role: "UI/UX ڈیزائنر", id: "23L-0909" }
    ],
    securityTitle: "ہمارے حفاظتی معیار",
    securityDesc: "ہم آپ کے ڈیٹا اور حفاظت کو یقینی بنانے کے لیے سخت پروٹوکول نافذ کرتے ہیں۔",
    cta: "ہمارے ساتھ شامل ہوں"
  }
};

export default function AboutUs() {
  const [lang, setLang] = useState("en");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const t = CONTENT[lang];

  const teal = "#2a9d8f";
  const dark = "#1a1a2e";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div dir={t.dir} style={{ 
      fontFamily: t.dir === "rtl" ? "'Noto Nastaliq Urdu', serif" : "'Nunito', sans-serif",
      backgroundColor: "#fff", color: dark 
    }}>
      
      {/* ── IMAGE SLIDER (Already updated in previous step) ── */}
      {/* ... previous slider code ... */}

      {/* ── SECURITY STANDARDS SECTION (From SRS) ── */}
      <section style={{ padding: "80px 20px", textAlign: "center", borderBottom: "1px solid #eee" }}>
        <h2 style={{ fontSize: "32px", marginBottom: "15px" }}>{t.securityTitle}</h2>
        <p style={{ maxWidth: "700px", margin: "0 auto 40px", color: "#666" }}>{t.securityDesc}</p>
        
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <div style={securityIconStyle}>
            <div style={{ fontSize: "30px" }}>🛡️</div>
            <h4 style={{ margin: "10px 0" }}>CNIC Verification</h4>
            <p style={{ fontSize: "13px" }}>Mandatory 13-digit CNIC check for all workers.</p>
          </div>
          <div style={securityIconStyle}>
            <div style={{ fontSize: "30px" }}>🔐</div>
            <h4 style={{ margin: "10px 0" }}>Data Encryption</h4>
            <p style={{ fontSize: "13px" }}>Passwords stored as bcrypt hashes with HTTPS transmission.</p>
          </div>
          <div style={securityIconStyle}>
            <div style={{ fontSize: "30px" }}>📱</div>
            <h4 style={{ margin: "10px 0" }}>WhatsApp OTP</h4>
            <p style={{ fontSize: "13px" }}>Secure 6-digit OTP verification via WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* ── MEET THE FOUNDERS ── */}
      <section style={{ padding: "100px 20px", backgroundColor: "#f9f9f9" }}>
        <h2 style={{ textAlign: "center", marginBottom: "50px", fontSize: "36px" }}>{t.teamTitle}</h2>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "30px" }}>
          {t.team.map((member, i) => (
            <div key={i} className="team-card" style={teamCardStyle}>
              <div style={{ 
                width: "120px", height: "120px", borderRadius: "50%", background: "#ddd", 
                margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" 
              }}>👤</div>
              <h3 style={{ marginBottom: "5px" }}>{member.name}</h3>
              <p style={{ color: teal, fontWeight: "bold", marginBottom: "5px" }}>{member.role}</p>
              <p style={{ fontSize: "12px", color: "#999" }}>{member.id} </p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: "40px", fontSize: "14px", color: "#666" }}>
          Supervised by: <strong>Ms. Lehmia Kiran</strong> | FAST-NU Lahore 
        </p>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "100px 20px", textAlign: "center" }}>
        <button 
          onClick={() => navigate("/register/employer")}
          style={{ 
            background: teal, color: "white", border: "none", 
            padding: "18px 45px", borderRadius: "50px", 
            fontSize: "18px", fontWeight: "bold", cursor: "pointer",
            boxShadow: `0 10px 20px ${teal}44`
          }}>
          {t.cta}
        </button>
      </section>

      <style>{`
        .team-card:hover { transform: scale(1.05); }
        .team-card { transition: all 0.3s ease; }
      `}</style>
    </div>
  );
}

const teamCardStyle = {
  backgroundColor: "white", padding: "40px 30px", borderRadius: "20px",
  textAlign: "center", width: "280px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
};

const securityIconStyle = {
  padding: "20px", borderRadius: "15px", background: "white",
  border: "1px solid #f0f0f0", textAlign: "center"
};