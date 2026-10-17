import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowRight, ArrowLeft, ArrowUp, Plus, Minus, Cpu, MoveUpRight, RotateCcw, Layers3, MousePointer2, ChevronDown, Check, Menu, X, Play, HardDrive, Zap, ScanLine } from 'lucide-react';
import SSDScene from './components/SSDScene.jsx';
import { parts, facts } from './data.js';

const navigation = [
  { id: 'intro', label: 'Басты бет' },
  { id: 'basics', label: 'SSD деген не?' },
  { id: 'anatomy', label: 'Құрылымы' },
  { id: 'how', label: 'Жұмыс принципі' },
  { id: 'facts', label: 'Фактілер' },
  { id: 'questions', label: 'Сұрақ-жауап' },
];

function useScrollEffects() {
  const [active, setActive] = useState('intro');
  useEffect(() => {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.dataset.visible = String(entry.isIntersecting);
        if (entry.isIntersecting && entry.target.hasAttribute('data-reveal-once')) {
          reveal.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(el => reveal.observe(el));
    const sections = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-20% 0px -50% 0px' });
    navigation.forEach(({ id }) => { const el = document.getElementById(id); if (el) sections.observe(el); });
    let frame;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty('--read-progress', `${max > 0 ? window.scrollY / max * 100 : 0}%`);
      const hero = document.querySelector('.hero-art');
      if (hero && window.innerWidth > 760) {
        const y = Math.min(window.scrollY, 850);
        hero.style.setProperty('--hero-y', `${y * 0.17}px`);
        hero.style.setProperty('--hero-turn', `${y * -0.012}deg`);
      }
      frame = null;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { reveal.disconnect(); sections.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);
  return active;
}

function Logo({ footer = false }) {
  return <a href="#intro" className={`logo ${footer ? 'logo-footer' : ''}`} aria-label="SSD LAB — басты бет">
    <span className="logo-icon"><span /><span /><span /></span>
    <span>SSD<span className="logo-dot">.</span>LAB</span>
  </a>;
}

function Header({ active }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="header-inner">
      <Logo />
      <nav className={open ? 'main-nav nav-open' : 'main-nav'} aria-label="Негізгі мәзір">
        {navigation.map(item => <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)} className={active === item.id ? 'active' : ''}>{item.label}</a>)}
      </nav>
      <button className="mobile-toggle icon-button" onClick={() => setOpen(!open)} aria-label={open ? 'Мәзірді жабу' : 'Мәзірді ашу'} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
    </div>
    <div className="reading-progress" />
  </header>;
}

function Eyebrow({ number, children, light = false }) {
  return <div className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span className="section-number">{number}</span><span>{children}</span></div>;
}

function Hero() {
  return <section className="hero section-shell" id="intro">
    <div className="hero-topline"><span><span className="tiny-square" />ТЕХНОЛОГИЯНЫҢ ІШКІ ӘЛЕМІ</span><span className="hero-edition">ИНТЕРАКТИВТІ ГИД · VOL. 001</span></div>
    <div className="hero-grid">
      <div className="hero-copy">
        <div className="hero-kicker"><span />SOLID STATE DRIVE</div>
        <h1>Кішкентай чип.<br />Үлкен <span className="orange-text">мүмкіндік<svg viewBox="0 0 450 18" aria-hidden="true"><path d="M4 12Q210 -3 446 9" /></svg></span><span className="title-period">.</span></h1>
        <p className="hero-description">Жылдамдықтың сыры — көлемде емес. Миллиардтаған деректі үнсіз сақтайтын SSD-нің таңғаларлық әлеміне еніңіз.</p>
        <div className="hero-note"><span className="note-line" /><span>Қозғалатын бөлшек жоқ.<br /><b>Тек таза технология.</b></span></div>
      </div>
      <div className="hero-art" aria-label="Кеңістікте қалықтап тұрған SSD-нің үш өлшемді моделі">
        <div className="hero-outline-text" aria-hidden="true">SSD</div>
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        <div className="art-cross cross-one">+</div><div className="art-cross cross-two">+</div><div className="art-cross cross-three">+</div>
        <div className="hero-product-tag"><span className="live-dot" />NEXT-GEN MEMORY</div>
        <div className="floating-component floating-component-nand" aria-hidden="true"><div className="floating-component-body"><small>SSD.LAB</small><strong>NAND</strong><i /><span>3D FLASH</span></div></div>
        <div className="floating-component floating-component-controller" aria-hidden="true"><div className="floating-component-body"><small>SSD.LAB</small><strong>CTRL</strong><i /><span>NVMe</span></div></div>
        <div className="hero-scene"><SSDScene /></div>
        <div className="device-annotation annotation-one"><span className="annotation-dot" /><span><b>3D NAND</b><small>Қуатсыз да сақталатын жад</small></span></div>
        <div className="device-annotation annotation-two"><span><b>NVMe / PCIe 4.0</b><small>Жылдамдыққа тікелей жол</small></span><span className="annotation-dot" /></div>
        <div className="hero-art-caption"><span>M.2 2280</span><span>80 × 22 MM</span><span className="caption-coordinate">X: 00.82 / Y: 00.22</span></div>
        <div className="float-label"><MousePointer2 size={12} />Модельді бұрып көріңіз</div>
      </div>
    </div>
    <div className="hero-bottom" aria-hidden="true"><div className="scroll-cue"><span className="scroll-cue-box"><ArrowDown size={15} /></span>ТӨМЕН ЖЫЛЖЫТЫҢЫЗ<span className="scroll-cue-line" /></div><span className="hero-bottom-right">АЗ ҚОЗҒАЛЫС. КӨП МҮМКІНДІК.<span>001 — 006</span></span></div>
    <div className="hero-metrics">
      <div><span className="metric-index">01 /</span><strong>0<span>бөлшек</span></strong><p>Механикалық қозғалыс. Діріл. Күту.</p></div>
      <div><span className="metric-index">02 /</span><strong>7 000<span>МБ/с дейін*</span></strong><p>Файлдарыңызға жаңа қарқын.</p></div>
      <div><span className="metric-index">03 /</span><strong>3D<span>NAND</span></strong><p>Бір чиптің ішінде — қабат-қабат жад.</p></div>
    </div>
    <p className="metric-footnote">*PCIe 4.0 x4 үлгілеріндегі тізбекті оқу мысалы. Нақты жылдамдық модельге, жүйеге және жүктемеге байланысты.</p>
  </section>;
}

function Basics() {
  const [drive, setDrive] = useState('ssd');
  return <section className="basics section-shell" id="basics">
    <div className="basics-copy" data-reveal="left">
      <Eyebrow number="01">ЖАҢА БУЫННЫҢ ЖАДЫ</Eyebrow>
      <h2>Сиқыр емес.<br />Таза <span className="muted-heading">инженерия.</span></h2>
      <p className="section-lead">SSD — деректерді микрочиптерде сақтайтын жинақтауыш. Ішінде айналатын диск те, қозғалатын оқу басы да жоқ.</p>
      <p className="body-copy">Фотосуреттер, ойындар, операциялық жүйе — бәрі NAND жадындағы электрлік күйлерге айналады. Қуат өшсе де, олар орнында қалады. Ал контроллер керек деректі мыңдаған ұяшықтың арасынан тауып береді.</p>
    </div>
    <div className="comparison-card" data-reveal="right">
      <div className="comparison-top"><span className="micro-label">ЭВОЛЮЦИЯ / САҚТАУ ТЕХНОЛОГИЯСЫ</span><div className="segmented-control" aria-label="Жинақтауыш түрі"><button className={drive === 'hdd' ? 'selected' : ''} onClick={() => setDrive('hdd')}>HDD</button><button className={drive === 'ssd' ? 'selected' : ''} onClick={() => setDrive('ssd')}>SSD</button></div></div>
      <div className={`drive-visual ${drive}`}>
        <div className="drive-target target-a" /><div className="drive-target target-b" />
        {drive === 'ssd' ? <div className="illustrated-chip" key="ssd"><span className="chip-label">SSD.LAB</span><div className="chip-grid">{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ '--i': i }} />)}</div><span className="chip-caption">NAND FLASH / 3D</span><div className="chip-pins pins-top" /><div className="chip-pins pins-bottom" /><div className="chip-pins pins-left" /><div className="chip-pins pins-right" /></div> : <div className="illustrated-hdd" key="hdd"><div className="hdd-platter"><div className="hdd-ring" /><div className="hdd-center" /></div><div className="hdd-arm" /><span className="hdd-screw screw-a" /><span className="hdd-screw screw-b" /></div>}
        <span className="drive-visual-label label-left">{drive === 'ssd' ? 'ЭЛЕКТРОНДАР' : 'МАГНИТТІК ДИСК'}</span><span className="drive-visual-label label-right">{drive === 'ssd' ? 'ҚОЗҒАЛЫССЫЗ' : 'МЕХАНИКАЛЫҚ'}</span>
      </div>
      <div className="comparison-bottom" aria-live="polite"><div className="comparison-icon">{drive === 'ssd' ? <Zap size={20} /> : <HardDrive size={20} />}</div><div><h3>{drive === 'ssd' ? 'Дерекке электр жылдамдығымен.' : 'Алдымен айналу. Сосын іздеу.'}</h3><p>{drive === 'ssd' ? 'Қажетті ұяшыққа электрондық жолмен қатынайды. Механикалық іздеу кідірісі жоқ.' : 'Оқу басы айналып тұрған пластинадағы керекті орынға физикалық жылжиды.'}</p></div></div>
    </div>
  </section>;
}

function PartInfoCard({ activeId }) {
  return <aside className="part-card" aria-live="polite" aria-atomic="true">
    <div
      className={`part-card-panel ${activeId === 'assembled' ? 'is-active' : ''}`}
      data-part="assembled"
      aria-hidden={activeId !== 'assembled'}
      inert={activeId !== 'assembled' ? true : undefined}
    >
      <div className="part-card-top"><span className="part-number">M.2</span><ScanLine size={21} /></div>
      <span className="part-subtitle">ЖАҚЫНЫРАҚ ТАНЫСАЙЫҚ</span>
      <h3>Ішінде не бар?</h3>
      <p>Құрылғыны бөлшектеу үшін төмендегі батырманы басыңыз. Кейін кез келген компонентке меңзерді апарып, оның міндетін біліңіз.</p>
      <div className="part-card-hint"><MousePointer2 size={15} />Модельді сүйреп бұруға болады</div>
    </div>
    {parts.map(part => <div
      key={part.id}
      id={`part-card-${part.id}`}
      className={`part-card-panel ${activeId === part.id ? 'is-active' : ''}`}
      data-part={part.id}
      aria-hidden={activeId !== part.id}
      inert={activeId !== part.id ? true : undefined}
    >
      <div className="part-card-top"><span className="part-number">{part.number}</span><Cpu size={20} /></div>
      <span className="part-subtitle">{part.subtitle}</span>
      <h3>{part.name}</h3>
      <p>{part.description}</p>
      <div className="part-spec"><span />{part.spec}</div>
    </div>)}
  </aside>;
}

function Anatomy() {
  const [exploded, setExploded] = useState(false);
  const [selected, setSelected] = useState('controller');
  return <section className="anatomy" id="anatomy">
    <div className="section-shell">
      <div className="section-heading anatomy-heading" data-reveal="up"><div><Eyebrow number="02" light>ҚҰРЫЛЫМЫН ЗЕРТТЕҢІЗ</Eyebrow><h2>Сырты шағын.<br /><span>Іші — тұтас әлем.</span></h2></div><div className="section-heading-aside"><span className="orange-asterisk"><svg viewBox="0 0 64 64" width="58" height="58" fill="none" stroke="currentColor" strokeWidth="4"><path d="M32 3v58M3 32h58M11 11l42 42M11 53l42-42" /></svg></span><p>Бір құрылғы. Алты маңызды компонент.<br />Бөлшектеңіз. Айналдырыңыз. Әр бөлшектің<br className="desktop-break" /> артындағы идеяны ашыңыз.</p></div></div>
      <div className={`lab-panel ${exploded ? 'is-exploded' : ''}`} data-reveal="up" data-reveal-once>
        <div className="lab-toolbar"><span className="lab-brand"><span className="tiny-square" />SSD.LAB / EXPLORER</span><span className="lab-toolbar-status"><span className="live-dot" />3D ИНТЕРАКТИВ</span></div>
        <div className="lab-workspace">
          <div className="lab-grid" />
          <span className="lab-corner top-left">+</span><span className="lab-corner top-right">+</span><span className="lab-corner bottom-left">+</span>
          <span className="lab-view-label">{exploded ? 'EXPLODED VIEW / 02' : 'ASSEMBLED VIEW / 01'}</span>
          <div className="lab-scene"><SSDScene exploded={exploded} activePart={exploded ? selected : null} onPartSelect={id => { if (id) setSelected(id); }} /></div>
          <PartInfoCard activeId={exploded ? selected : 'assembled'} />
          <span className="lab-dimension">22 MM <span />80 MM</span>
          <div className="lab-floating-badge"><Layers3 size={13} />{exploded ? 'Әр бөлшектің өз рөлі бар' : 'Көрінгеннен де күрделірек'}</div>
        </div>
        <div className="lab-controls"><div className="lab-step"><span>{exploded ? '02' : '01'}</span> / 02<span className="lab-step-name">{exploded ? 'Бөлшектер әлемі' : 'Біртұтас құрылғы'}</span></div><div className="lab-buttons"><button className="button button-orange" onClick={() => setExploded(!exploded)}>{exploded ? 'Қайта жинау' : 'Бөлшектеу'}{exploded ? <RotateCcw size={18} /> : <MoveUpRight size={19} />}</button></div></div>
      </div>
      <div className="parts-navigation" aria-label="SSD компоненттері">{parts.map(p => <button key={p.id} onClick={() => { setExploded(true); setSelected(p.id); }} className={exploded && p.id === selected ? 'active' : ''} aria-pressed={exploded && p.id === selected} aria-controls={`part-card-${p.id}`}><span>{p.number}</span>{p.name}<Plus size={13} /></button>)}</div>
      <p className="lab-disclaimer">Түсіндіруге арналған үлгі. Компоненттердің орналасуы SSD моделіне қарай өзгереді; жеке DRAM мен жылу таратқыш барлық үлгіде болмайды.</p>
    </div>
  </section>;
}

const writeSteps = [
  { title: 'Сұрау жіберіледі', text: 'Операциялық жүйе файлды сақтау сұрауын NVMe арқылы SSD-ге жібереді. Деректер PCIe желілерімен өтеді.' },
  { title: 'Контроллер жол табады', text: 'FTL кестесі логикалық мекенжайды физикалық NAND мекенжайымен байланыстырады. Контроллер бос бетті таңдайды.' },
  { title: 'Заряд күйге айналады', text: 'Бағдарламалау импульстары ұяшықтардың шекті кернеуін өзгертеді. Деректер биттер ретінде кодталады.' },
  { title: 'Файл сақталды', text: 'Жазу тексеріліп, мекенжай кестесі жаңартылады. NAND-тағы дерек қуат өшкеннен кейін де сақталады.' },
];
const readSteps = [
  { title: 'Оқу сұрауы жіберіледі', text: 'Компьютер сақталған файлды сұрайды. Контроллер мекенжай кестесінен оның NAND ішіндегі орнын табады.' },
  { title: 'Ұяшықтардың күйі өлшенеді', text: 'SSD ұяшықтардың шекті кернеуін анықтап, сол күйлерді қайтадан биттерге айналдырады.' },
  { title: 'Деректер тексеріледі', text: 'Қателерді түзету коды (ECC) оқылған деректегі түзетуге болатын қателерді анықтап, қалпына келтіреді.' },
  { title: 'Файл компьютерге оралды', text: 'Дайын дерек PCIe арқылы компьютердің жедел жадына жіберіледі. Сақталған NAND ұяшықтары оқылғанда өшірілмейді.' },
];

function DataJourney() {
  const [mode, setMode] = useState('write');
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [file, setFile] = useState('Фото.jpg');
  const [run, setRun] = useState(0);
  const timers = useRef([]);
  const steps = mode === 'write' ? writeSteps : readSteps;
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  function simulate(nextMode) {
    if (running) return;
    timers.current.forEach(clearTimeout);
    setMode(nextMode); setRunning(true); setStep(0); setRun(n => n + 1);
    [1, 2, 3].forEach((n) => timers.current.push(setTimeout(() => { setStep(n); if (n === 3 && nextMode === 'write') setSaved(true); }, n * 1050)));
    timers.current.push(setTimeout(() => setRunning(false), 4300));
  }
  return <section className="journey section-shell" id="how">
    <div className="section-heading" data-reveal="up"><div><Eyebrow number="03">КӨРІНБЕЙТІН ПРОЦЕСС</Eyebrow><h2>Бір файлдың<br /><span className="muted-heading">үлкен саяхаты.</span></h2></div><p className="section-heading-aside journey-aside">«Сақтау» батырмасын басқаннан кейін не болады?<br />Миллисекундтар ішіндегі процесті баяулатып,<br className="desktop-break" /> әр қадамын бірге көрейік.</p></div>
    <div className={`journey-panel ${running ? 'is-running' : ''} mode-${mode}`} data-reveal="up">
      <div className="journey-top"><span className="micro-label"><span className="tiny-square" />ДЕРЕКТІҢ ЖОЛЫ / СИМУЛЯЦИЯ</span><span className="simulation-speed">УАҚЫТ БАЯУЛАТЫЛҒАН ×1 000</span></div>
      <div className="flow-diagram" key={run}>
        <div className={`flow-node computer-node ${running && (mode === 'write' ? step === 0 : step === 3) ? 'node-active' : ''}`}><div className="computer-graphic"><div className="computer-screen"><div className="screen-header"><i /><i /><i /></div><div className="file-graphic"><svg viewBox="0 0 28 32" fill="none"><path d="M5 1h12l7 7v23H5z" stroke="currentColor" strokeWidth="1.5" /><path d="M17 1v8h7M9 18l4-4 3 3 3-2v9H9z" stroke="currentColor" strokeWidth="1.5" /></svg><span>{file}</span></div><span className="screen-status">{saved ? 'САҚТАЛДЫ ✓' : 'САҚТАУҒА ДАЙЫН'}</span></div><div className="computer-base" /></div><span className="flow-node-number">01</span><h3>Компьютер</h3><p>Сіздің файлыңыз</p></div>
        <div className={`flow-connection connection-one ${running ? 'transferring' : ''}`}><span className="connection-label">PCIe / NVMe</span><div className="connection-line" /><span className="data-packet packet-1" /><span className="data-packet packet-2" /><span className="data-packet packet-3" /><ArrowRight className="connection-arrow" size={13} /></div>
        <div className={`flow-node controller-node ${running && (mode === 'write' ? step === 1 : step === 0 || step === 2) ? 'node-active' : ''}`}><div className="controller-graphic"><Cpu size={35} strokeWidth={1} /><span>CONTROLLER</span><small>FTL + ECC</small><div className="controller-pin-row" /></div><span className="flow-node-number">02</span><h3>Контроллер</h3><p>Мекенжай. Басқару. Тексеру.</p></div>
        <div className={`flow-connection connection-two ${running && step > 0 ? 'transferring' : ''}`}><span className="connection-label">NAND КАНАЛДАРЫ</span><div className="connection-line" /><span className="data-packet packet-1" /><span className="data-packet packet-2" /><span className="data-packet packet-3" /><ArrowRight className="connection-arrow" size={13} /></div>
        <div className={`flow-node nand-node ${running && (mode === 'write' ? step === 2 : step === 1) ? 'node-active' : ''}`}><div className={`memory-graphic ${saved ? 'has-data' : ''} ${running && step === 2 ? 'programming' : ''}`}>{Array.from({ length: 32 }, (_, i) => <span key={i} className={(i * 7 + file.length) % 5 > 1 ? 'bit-one' : ''} style={{ '--cell-delay': `${i * 24}ms` }}>{saved || (running && step > 1) ? ((i * 7 + file.length) % 5 > 1 ? '1' : '0') : '·'}</span>)}</div><span className="flow-node-number">03</span><h3>NAND жады</h3><p>Файлдың жаңа мекені</p></div>
      </div>
      <div className="journey-step-description" aria-live="polite"><span className={`simulation-indicator ${running ? 'running' : ''}`}>{running ? <span className="live-dot" /> : saved ? <Check size={14} /> : <Play size={12} />}</span><div><b>{step < 0 ? 'Алғашқы файлыңызды сақтап көріңіз.' : steps[step].title}</b><p>{step < 0 ? 'Файлды таңдап, «Дерек жазу» батырмасын басыңыз. Әр кезеңді экраннан бақылай аласыз.' : steps[step].text}</p></div><span className="step-count">{step < 0 ? '00' : `0${step + 1}`}<span>/04</span></span></div>
      <div className="journey-controls"><div className="file-select"><label htmlFor="file-type">ФАЙЛ</label><select id="file-type" value={file} disabled={running} onChange={e => { setFile(e.target.value); setSaved(false); setStep(-1); }}><option>Фото.jpg</option><option>Музыка.mp3</option><option>Құжат.pdf</option></select><ChevronDown size={14} /></div><div className="journey-buttons"><button className="button button-outline" disabled={running || !saved} onClick={() => simulate('read')}><ArrowLeft size={17} />Дерек оқу</button><button className="button button-dark" disabled={running} onClick={() => simulate('write')}>{running ? <span className="button-spinner" /> : <ArrowRight size={17} />}{running ? 'Орындалуда…' : 'Дерек жазу'}</button></div></div>
    </div>
    <div className="journey-timeline">{steps.map((s, i) => <div key={i} className={`journey-stage ${step === i ? 'active' : ''}`} aria-current={step === i ? 'step' : undefined}><span>0{i + 1}</span><h3>{s.title}</h3><p>{s.text}</p></div>)}</div>
    <p className="simulation-note">Сызба процесті түсіндіру үшін жеңілдетілген. Нақты SSD бірнеше NAND арнасымен қатар жұмыс істейді; қадамдардың реті мен ұзақтығы контроллерге байланысты.</p>
  </section>;
}

function FactGraphic({ selected }) {
  if (selected === 0) return <div className="fact-graphic charge-graphic"><div className="charge-grid">{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ '--i': i, '--opacity': 0.12 + i * 0.055 }}>{i.toString(2).padStart(4, '0')}</span>)}</div><span className="graphic-caption">QLC / 16 КЕРНЕУ КҮЙІ / 4 БИТ</span></div>;
  if (selected === 1) return <div className="fact-graphic blocks-graphic">{Array.from({ length: 4 }, (_, i) => <div key={i} className="nand-block">{Array.from({ length: 12 }, (_, j) => <span key={j} className={(i + j) % 3 ? 'filled' : ''} />)}</div>)}<span className="graphic-caption">БЕТПЕН ЖАЗУ → БЛОКПЕН ӨШІРУ</span></div>;
  if (selected === 2) return <div className="fact-graphic endurance-graphic"><svg viewBox="0 0 230 160"><path d="M25 135a90 90 0 1 1 180 0" fill="none" stroke="#deded7" strokeWidth="17" /><path d="M25 135a90 90 0 1 1 180 0" fill="none" stroke="#ff5a24" strokeWidth="17" strokeDasharray="180 300" /><path d="M115 128l48-54" stroke="#20211f" strokeWidth="4" strokeLinecap="round" /><circle cx="115" cy="128" r="9" fill="#20211f" /></svg><span className="graphic-caption">РЕСУРС ≠ ЖАРАМДЫЛЫҚ МЕРЗІМІ</span></div>;
  if (selected === 3) return <div className="fact-graphic trim-graphic">{Array.from({ length: 15 }, (_, i) => <span key={i} className={i % 4 === 0 ? 'trimmed' : ''} style={{ '--i': i }}>{i % 4 === 0 ? <Check size={18} /> : '01'}</span>)}<span className="graphic-caption">ҚАЖЕТСІЗ ДЕРЕК → БОС ОРЫН ТУРАЛЫ БЕЛГІ</span></div>;
  if (selected === 4) return <div className="fact-graphic cache-graphic"><div className="cache-chart"><div className="cache-high" /><div className="cache-low" /><span className="chart-label-fast">SLC КЭШ</span><span className="chart-label-slow">TLC / QLC</span></div><span className="graphic-caption">КЭШ ТОЛҒАНДА ЖЫЛДАМДЫҚ ӨЗГЕРУІ МҮМКІН</span></div>;
  return <div className="fact-graphic capacity-graphic"><span>1<span className="capacity-unit">ТБ</span></span><ArrowDown size={27} /><strong>931<span className="capacity-unit">GiB</span></strong><span className="graphic-caption">БІРДЕЙ БАЙТТАР. ӘРТҮРЛІ БІРЛІКТЕР.</span></div>;
}

function Facts() {
  const [selected, setSelected] = useState(0);
  const fact = facts[selected];
  return <section className="facts-section" id="facts"><div className="section-shell">
    <div className="section-heading" data-reveal="up"><div><Eyebrow number="04">КӨП АДАМ БІЛЕ БЕРМЕЙДІ</Eyebrow><h2>Үш әріптің<br /><span className="muted-heading">алты құпиясы.</span></h2></div><div className="facts-heading-note"><span>БІЛІМ ДЕҢГЕЙІ</span><div className="knowledge-bars">{[1,2,3,4,5,6,7,8,9,10].map(n => <i key={n} className={n <= selected + 5 ? 'filled' : ''} />)}</div><small>Тереңірек үңілген сайын қызығырақ.</small></div></div>
    <div className="facts-explorer" data-reveal="up"><div className="fact-list" role="tablist" aria-label="SSD туралы фактілер">{facts.map((f, i) => <button role="tab" aria-selected={selected === i} aria-controls="fact-content" id={`fact-tab-${i}`} key={f.number} onClick={() => setSelected(i)} className={selected === i ? 'active' : ''}><span>{f.number}</span><div><small>{f.kicker}</small><b>{f.title}</b></div><ArrowUpRight size={18} /></button>)}</div><div className="fact-feature" id="fact-content" role="tabpanel" aria-labelledby={`fact-tab-${selected}`} key={selected}><div className="fact-feature-top"><span>БІЛДІҢІЗ БЕ?</span><span>{fact.number} / 06</span></div><FactGraphic selected={selected} /><div className="fact-feature-copy"><span className="fact-metric">{fact.metric}</span><small>{fact.metricLabel}</small><h3>{fact.title}</h3><p>{fact.description}</p></div><div className="fact-feature-bottom"><span className="tiny-square" />КӨРІНБЕЙТІН ИНЖЕНЕРИЯ</div></div></div>
  </div></section>;
}

const faqs = [
  { question: 'M.2, SATA, NVMe — айырмашылығы неде?', answer: 'M.2 — құрылғының физикалық пішімі. SATA және PCIe — деректер өтетін интерфейстер, ал NVMe — PCIe арқылы SSD-мен жұмыс істеуге арналған хаттама. Демек, M.2 дискісі міндетті түрде NVMe емес: M.2 SATA да бар. Сатып аларда аналық платаңыздың ұяшығы қай интерфейсті қолдайтынын тексеріңіз.' },
  { question: 'SSD компьютерді барлық жағдайда жылдамдата ма?', answer: 'SSD жүйенің жүктелуін, бағдарламалардың ашылуын және файлдарға қатынауды жылдамдата алады. Бірақ процессордың есептеу қуатын немесе бейнекартаның өнімділігін арттырмайды. Ойынның FPS көрсеткіші көп жағдайда GPU мен CPU-ға тәуелді, ал SSD жүктелу уақытын қысқартуға және дерек ағынын жақсартуға көмектеседі.' },
  { question: 'SSD-ні дефрагментациялау керек пе?', answer: 'HDD сияқты дәстүрлі дефрагментация SSD-ге қажет емес: оқу басын жақындатудың пайдасы жоқ, ал артық жазу ресурс жұмсайды. Операциялық жүйенің SSD-ге арналған оңтайландыруын, соның ішінде TRIM қолдауын, қосулы ұстаған дұрыс. Жүйелік оңтайландыру мен дәстүрлі дефрагментацияны шатастырмаңыз.' },
  { question: 'SSD-дегі файлдар мәңгі сақтала ма?', answer: 'Жоқ. NAND қуатсыз деректі сақтайды, бірақ шексіз уақытқа кепілдік бермейді. Сақталу мерзімі температураға, ұяшықтардың тозуына және құрылғының ерекшелігіне тәуелді. Маңызды деректер үшін 3–2–1 қағидасы пайдалы: үш көшірме, екі түрлі тасымалдағыш, бір көшірме бөлек жерде.' },
  { question: 'Қанша бос орын қалдырған дұрыс?', answer: 'Көп жағдайда 10–20% бос орын қалдыру — пайдалы тәжірибе, қатаң ереже емес. Бос кеңістік контроллерге деректерді реттеуге, блоктарды тазалауға және динамикалық SLC кэшін пайдалануға көмектеседі. Нақты әсері SSD моделіне, кірістірілген резервке және жүктемеге байланысты.' },
];

function Questions() {
  const [open, setOpen] = useState(0);
  return <section className="questions section-shell" id="questions"><div className="questions-heading" data-reveal="left"><Eyebrow number="05">СҰРАҚ ҚАЛДЫ МА?</Eyebrow><h2>Білген жақсы.<br /><span className="muted-heading">Түсінген — артық.</span></h2><p>Ең жиі кездесетін сұрақтарға<br />нақты, қарапайым жауаптар.</p><div className="faq-decoration"><span>?</span><span className="faq-orbit" /><Plus size={19} /></div></div><div className="faq-list" data-reveal="right">{faqs.map((faq, i) => <div className={`faq-item ${open === i ? 'open' : ''}`} key={faq.question}><button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} aria-controls={`faq-${i}`}><span className="faq-index">0{i + 1}</span><h3>{faq.question}</h3><span className="faq-plus">{open === i ? <Minus size={16} /> : <Plus size={16} />}</span></button><div id={`faq-${i}`} className="faq-answer" inert={open !== i ? true : undefined}><p>{faq.answer}</p></div></div>)}</div></section>;
}

function Footer() {
  return <><section className="closing section-shell" data-reveal="up"><div className="closing-top"><span className="micro-label">САЯХАТ АЯҚТАЛДЫ. ҚЫЗЫҒУШЫЛЫҚ — ЖОҚ.</span><span className="closing-symbol">↗</span></div><h2>Енді SSD —<br />жай үш әріп <span>емес.</span></h2><div className="closing-bottom"><p>Кішкентай құрылғының артында үлкен инженерия бар.<br />Оны енді сіз де білесіз.</p></div></section><footer className="site-footer section-shell"><div className="footer-main"><Logo footer /><span>ТЕХНОЛОГИЯНЫ ТҮСІНУГЕ АРНАЛҒАН КЕҢІСТІК.</span><a href="#intro">Жоғарыға<ArrowUp size={15} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} SSD.LAB</span><p>Білімге арналған интерактивті жоба. 3D модель мен симуляциялар — түсіндірмелік үлгілер.</p><span><span className="tiny-square" />ҚАЗАҚША ЖАСАЛҒАН</span></div></footer></>;
}

export default function App() {
  const active = useScrollEffects();
  return <><a className="skip-link" href="#basics">Мазмұнға өту</a><Header active={active} /><main><Hero /><Basics /><Anatomy /><DataJourney /><Facts /><Questions /><Footer /></main></>;
}
