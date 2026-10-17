import { useEffect, useRef } from 'react';
import { ArrowDown, Check } from 'lucide-react';

// Pause diagram loops while the reader is elsewhere on the page.
function useGraphicMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    let visible = false;
    const update = () => {
      node.dataset.motion = visible && !document.hidden ? 'running' : 'paused';
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    observer.observe(node);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return ref;
}

export default function FactGraphic({ selected }) {
  const ref = useGraphicMotion();
  const graphic = { ref, 'data-motion': 'paused', 'aria-hidden': true };

  if (selected === 0) return <div {...graphic} className="fact-graphic charge-graphic">
    <div className="charge-grid">{Array.from({ length: 16 }, (_, i) =>
      <span key={i} style={{ '--i': i, '--opacity': 0.12 + i * 0.055 }}>{i.toString(2).padStart(4, '0')}</span>
    )}</div>
    <span className="graphic-caption">QLC / 16 КЕРНЕУ КҮЙІ / 4 БИТ</span>
  </div>;

  if (selected === 1) return <div {...graphic} className="fact-graphic blocks-graphic">
    {Array.from({ length: 4 }, (_, i) => <div key={i} className="nand-block" style={{ '--block': i }}>
      {Array.from({ length: 12 }, (_, j) => <span
        key={j}
        className={`${(i + j) % 3 ? 'filled ' : ''}nand-row-${Math.floor(j / 3)}`}
        style={{ '--cell': j, '--row': Math.floor(j / 3) }}
      />)}
    </div>)}
    <span className="graphic-caption">БЕТПЕН ЖАЗУ → БЛОКПЕН ӨШІРУ</span>
  </div>;

  if (selected === 2) return <div {...graphic} className="fact-graphic endurance-graphic">
    <svg viewBox="0 0 230 160">
      <path className="endurance-track" d="M25 135a90 90 0 1 1 180 0" fill="none" stroke="#deded7" strokeWidth="17" />
      <path className="endurance-progress" d="M25 135a90 90 0 1 1 180 0" fill="none" stroke="#ff5a24" strokeWidth="17" pathLength="100" strokeDasharray="100" strokeDashoffset="24" />
      <g className="endurance-needle">
        <path d="M115 128V43" stroke="#20211f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="115" cy="128" r="9" fill="#20211f" />
      </g>
    </svg>
    <span className="graphic-caption">РЕСУРС ≠ ЖАРАМДЫЛЫҚ МЕРЗІМІ</span>
  </div>;

  if (selected === 3) return <div {...graphic} className="fact-graphic trim-graphic">
    {Array.from({ length: 15 }, (_, i) => <span key={i} className={i % 4 === 0 ? 'trimmed' : ''} style={{ '--i': i }}>
      {i % 4 === 0 ? <><span className="trim-data">01</span><Check className="trim-check" size={18} /></> : '01'}
    </span>)}
    <span className="graphic-caption">ҚАЖЕТСІЗ ДЕРЕК → БОС ОРЫН ТУРАЛЫ БЕЛГІ</span>
  </div>;

  if (selected === 4) return <div {...graphic} className="fact-graphic cache-graphic">
    <div className="cache-chart">
      <div className="cache-high" /><div className="cache-low" />
      <svg className="cache-trace" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 24H43V72H100" />
        <circle className="cache-packet" r="2" cx="0" cy="24" />
      </svg>
      <span className="chart-label-fast">SLC КЭШ</span><span className="chart-label-slow">TLC / QLC</span>
    </div>
    <span className="graphic-caption">КЭШ ТОЛҒАНДА ЖЫЛДАМДЫҚ ӨЗГЕРУІ МҮМКІН</span>
  </div>;

  return <div {...graphic} className="fact-graphic capacity-graphic">
    <span className="capacity-source">1<span className="capacity-unit">ТБ</span></span>
    <ArrowDown className="capacity-arrow" size={27} />
    <strong className="capacity-result">931<span className="capacity-unit">GiB</span></strong>
    <span className="graphic-caption">БІРДЕЙ БАЙТТАР. ӘРТҮРЛІ БІРЛІКТЕР.</span>
  </div>;
}
