import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  BookOpen,
  Camera,
  Search,
  Shield,
  Sparkles,
  Wand2,
} from "lucide-react";
import { BookIcon, PenIcon, ScanIcon, SettingsIcon } from "./icons";

interface DashboardProps {
  onDigitizeClick: () => void;
  onLibraryClick: () => void;
  onSettingsClick: () => void;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

const staggerReveal: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.12, ease: EASE },
  }),
};

const FEATURES = [
  {
    icon: <Shield size={20} strokeWidth={1.75} />,
    title: "Stays on your device",
    body: "Your entries never touch a server. Pages and settings live entirely in your browser — private by design.",
  },
  {
    icon: <Sparkles size={20} strokeWidth={1.75} />,
    title: "Reads any handwriting",
    body: "Powered by Gemini Vision — handles cursive, print, and rushed scrawl across 40+ languages.",
  },
  {
    icon: <Search size={20} strokeWidth={1.75} />,
    title: "Everything searchable",
    body: "Full-text search across every entry. Filter by tag or keyword — find anything, instantly.",
  },
];

const STEPS = [
  {
    num: "01",
    icon: <Camera size={22} strokeWidth={1.6} />,
    title: "Upload a photo",
    body: "Snap your journal page or drop in a JPG, PNG, or PDF.",
  },
  {
    num: "02",
    icon: <Wand2 size={22} strokeWidth={1.6} />,
    title: "AI reads the ink",
    body: "Gemini Vision transcribes timestamps and entries with high accuracy.",
  },
  {
    num: "03",
    icon: <BookOpen size={22} strokeWidth={1.6} />,
    title: "Search and keep",
    body: "Edit, tag, and export — your entries are indexed and ready to find.",
  },
];

export function Dashboard({
  onDigitizeClick,
  onLibraryClick,
  onSettingsClick,
}: DashboardProps) {
  const reduced = useReducedMotion();

  return (
    <div className="dashboard">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="brand-mark" aria-hidden="true">
          <PenIcon />
        </div>
        <h1 className="brand-wordmark">Interlude</h1>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={onLibraryClick}
            title="Library"
            aria-label="Open library"
          >
            <BookIcon />
          </button>
          <button
            className="icon-button"
            onClick={onSettingsClick}
            title="Settings"
            aria-label="Open OCR settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="hero-panel" aria-labelledby="hero-title">
          <div className="hero-copy">
            <motion.h2 id="hero-title" {...(reduced ? {} : fadeUp(0.18))}>
              Ink it,
              <br />
              sync it.
            </motion.h2>
            <motion.p {...(reduced ? {} : fadeUp(0.32))}>
              Your handwriting deserves a search bar. Snap a page, get clean
              text back — searchable, tagable, yours.
            </motion.p>
            <motion.div
              className="hero-actions"
              {...(reduced ? {} : fadeUp(0.46))}
            >
              <button
                onClick={onDigitizeClick}
                className="btn btn-large btn-primary"
              >
                <ScanIcon />
                Digitize Page
              </button>
              <button
                onClick={onLibraryClick}
                className="btn btn-large btn-secondary"
              >
                <BookIcon />
                View Library
              </button>
            </motion.div>
          </div>

          {/* Float is CSS-driven; Framer Motion handles initial reveal only */}
          <motion.div
            className={`journal-preview${reduced ? "" : " journal-float"}`}
            aria-hidden="true"
            initial={reduced ? false : { opacity: 0, scale: 0.94 }}
            animate={reduced ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
          >
            <div className="preview-date">9TH JUNE '26, MONDAY</div>
            {[
              {
                time: "10:04",
                text: "Going to finish the first draft of the mindful productivity article.",
              },
              {
                time: "10:46",
                text: "I fell into a Twitter blackhole again. Back to work.",
              },
              {
                time: "11:49",
                text: "Reviewed agenda and docs. Need to call Anna after the meeting.",
              },
            ].map(({ time, text }, i) => (
              <motion.div
                key={time}
                className="preview-entry"
                initial={reduced ? false : { opacity: 0, x: 12 }}
                animate={reduced ? {} : { opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.55 + i * 0.15,
                  ease: EASE,
                }}
              >
                <span>{time}</span>
                <p>{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Interstitial Journaling ──────────────────────────────────── */}
        <motion.section
          className="interstitial-section"
          aria-labelledby="interstitial-title"
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? {} : { opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="interstitial-inner">
            <div className="interstitial-copy">
              <motion.span
                className="interstitial-eyebrow"
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={reduced ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                The method behind the app
              </motion.span>
              <motion.h2
                id="interstitial-title"
                initial={reduced ? false : { opacity: 0, y: 22 }}
                whileInView={reduced ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
              >
                Interstitial<br />Journaling
              </motion.h2>
              <motion.div
                className="interstitial-body"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={reduced ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
              >
                <p>A practice of writing brief, timestamped notes between every task — capturing not just outcomes, but the honest texture of how your day moved.</p>
                <p>Popularized by Tony Stubblebine, it turns every transition into a moment of reflection: what you just finished, where you're heading, and whatever's weighing on you in between.</p>
              </motion.div>
              <motion.blockquote
                className="interstitial-quote"
                initial={reduced ? false : { opacity: 0, x: -14 }}
                whileInView={reduced ? {} : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.32, ease: EASE }}
              >
                The goal isn't a perfect record — it's an honest one.
              </motion.blockquote>
            </div>

            <div className="interstitial-timeline" aria-hidden="true">
              {[
                { time: '09:15', text: 'Morning review done. Calendar looks manageable. Coffee still warm.' },
                { time: '09:47', text: 'Cleared inbox. Transitioning to deep work on the Q3 report.' },
                { time: '11:02', text: 'Draft done — felt focused. Short break before feedback rounds.' },
                { time: '11:14', text: 'Back. Tackling design feedback. Three rounds left.' },
                { time: '12:38', text: "Feedback wrapped. Lunch. Didn't spiral today — good sign." },
              ].map(({ time, text }, i) => (
                <motion.div
                  key={time}
                  className="timeline-entry"
                  initial={reduced ? false : { opacity: 0, x: 20 }}
                  whileInView={reduced ? {} : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.09, ease: EASE }}
                >
                  <span className="timeline-time">{time}</span>
                  <div className="timeline-dot" aria-hidden="true" />
                  <p className="timeline-text">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <motion.section
          className="features-section"
          aria-labelledby="features-title"
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? {} : { opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="section-intro">
            <motion.span
              className="eyebrow"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              Why Interlude ?
            </motion.span>
            <motion.h2
              id="features-title"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
            >
              Built around your journal
            </motion.h2>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="feature-card"
                custom={i}
                variants={staggerReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                whileHover={
                  reduced ? {} : { y: -4, transition: { duration: 0.2 } }
                }
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <motion.section
          className="steps-section"
          aria-labelledby="steps-title"
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? {} : { opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="section-intro">
            <motion.span
              className="eyebrow"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              How it works ?
            </motion.span>
            <motion.h2
              id="steps-title"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
            >
              Three steps to digital
            </motion.h2>
          </div>

          <ol className="steps-list">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.num}
                className="step-card"
                custom={i}
                variants={staggerReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
              >
                <div className="step-card-top">
                  <div className="step-icon-box">{s.icon}</div>
                  <span className="step-chip" aria-hidden="true">
                    {s.num}
                  </span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </motion.section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <motion.section
          className="cta-section"
          aria-label="Get started"
          initial={reduced ? false : { opacity: 0, y: 32 }}
          whileInView={reduced ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <p className="cta-eyebrow">Ready to start?</p>
          <h2 className="cta-heading">
            Your handwriting
            <br />
            deserves to be found.
          </h2>
          <button onClick={onDigitizeClick} className="btn cta-btn">
            <ScanIcon />
            Digitize your first page
          </button>
        </motion.section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo" aria-hidden="true">
              <PenIcon />
            </div>
            <p className="footer-wordmark">Interlude</p>
            <p className="footer-tagline">Handwriting, finally searchable.</p>
          </div>

          <div className="footer-pills">
            <span className="footer-pill">Gemini OCR</span>
            <span className="footer-pill">Private &amp; local</span>
            <span className="footer-pill">JPG · PNG · PDF</span>
          </div>

          <p className="footer-copy">
            © 2026 Interlude — made with ink &amp; intention.
          </p>
        </div>
      </footer>
    </div>
  );
}
