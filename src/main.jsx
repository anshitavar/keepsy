// src/main.jsx
import React, { useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Download, Share2, Undo2, Redo2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Sparkles, Plus, ImagePlus, PenLine, GripVertical, X, BrainCircuit } from 'lucide-react';
import { buildCreativeDirection } from './ai/memoryDesigner';
import './styles.css';

const demoPhotos = [
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1519751138087-5a4e1a4d4b31?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1513159446162-54eb8bdaa79b?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=85'
];
const firstPage = [0, 3, 7, 10, 13, 17];
const secondPage = [1, 5, 8, 12, 15, 18];

// Deterministic direction builder (copied from memoryDesigner.js)
function originalBuildCreativeDirection(files = []) {
  const directions = [
    { theme: 'Golden little things', palette: ['#ff6d86', '#ffc857', '#75cfbd', '#9a7bd3'], paperTexture: 'sun-faded cotton', story: 'A bright little run of ordinary moments that became the best part of the day.', rhythm: 'playful crescendo' },
    { theme: 'After-dark together', palette: ['#773d86', '#ff6b7a', '#f7c857', '#304b82'], paperTexture: 'ink-washed paper', story: 'A night that got louder, warmer, and more unforgettable with every frame.', rhythm: 'electric celebration' },
    { theme: 'The long way home', palette: ['#527a82', '#d88d54', '#f2d399', '#8fa574'], paperTexture: 'weathered map paper', story: 'Small detours, full tables, and the kind of moving-through-the-world that stays with you.', rhythm: 'curious journey' }
  ];
  const seed = seedFor(files);
  const base = directions[seed % directions.length];
  const inferred = {
    people: Math.max(1, Math.ceil(files.length * .62)),
    energy: (seed % 2) ? 'warm, unhurried, close-knit' : 'bright, buoyant, in-motion',
    visualRhythm: base.rhythm,
    storyArc: ['a gentle opening', 'the colour and laughter builds', 'a soft note to keep'],
    colorSignals: base.palette
  };
  return {
    ...base,
    inferred,
    layoutStyle: 'one-off organic journal',
    instructions: {
      neverRepeat: true,
      density: [0.42, 0.82, 0.34],
      preserveBreathingSpace: true,
      decorationLogic: 'Select ephemera only when it strengthens the visual story.'
    },
    composition: [
      composeSpread(seed, 0, files.length),
      composeSpread(seed, 1, files.length)
    ],
    pages: [
      { section: 'opening', title: 'the little things', caption: 'slow down. this bit mattered.', density: 'airy' },
      { section: 'peak', title: 'more of this, please', caption: 'the frame where everything came alive.', density: 'layered' },
      { section: 'pause', title: 'keep this close', caption: 'a quiet ending, left intentionally open.', density: 'soft' }
    ]
  };
}

// Helper functions for deterministic direction (copied from memoryDesigner.js)
function seedFor(files) {
  return files.reduce((seed, file) => [...file.name].reduce((n, char) => n + char.charCodeAt(0), seed), files.length * 19);
}
function random(seed) {
  const next = Math.sin(seed * 12.9898) * 43758.5453;
  return next - Math.floor(next);
}
function composeSpread(seed, pageIndex, memoryCount) {
  const words = ['caught in the moment', 'worth keeping', 'laughing again', 'the good kind of ordinary', 'one for later', 'a soft little pause'];
  const anchors = pageIndex === 0
    ? [[52, 248, 220], [274, 266, 145], [291, 454, 136]]
    : [[48, 201, 208], [263, 225, 162], [250, 447, 151]];
  return anchors.map(([baseX, baseY, baseSize], index) => {
    const n = seed + pageIndex * 31 + index * 17;
    return {
      memoryIndex: (pageIndex * 3 + index + Math.floor(random(n) * 4)) % Math.max(memoryCount, 1),
      x: Math.round(baseX + (random(n + 1) - .5) * 48),
      y: Math.round(baseY + (random(n + 2) - .5) * 56),
      width: Math.round(baseSize + (random(n + 3) - .5) * 38),
      rotation: Math.round((random(n + 4) - .5) * 20),
      caption: words[(seed + index * 3 + pageIndex) % words.length]
    };
  });
}

function Polaroid({ id, src, className = '', caption, onSelect, selected, rotation = 0, style = {} }) {
  const [angle, setAngle] = useState(rotation);
  const ref = useRef(null);
  const handlePointerDown = (e) => {
    if (!ref.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const startX = e.clientX, startY = e.clientY;
    const parent = ref.current.parentElement.getBoundingClientRect();
    const baseLeft = ref.current.offsetLeft, baseTop = ref.current.offsetTop;
    const move = (event) => {
      ref.current.style.left = `${baseLeft + event.clientX - startX}px`;
      ref.current.style.top = `${baseTop + event.clientY - startY}px`;
    };
    e.currentTarget.addEventListener('pointermove', move);
    e.currentTarget.addEventListener('pointerup', () => e.currentTarget.removeEventListener('pointermove', move), { once: true });
  };
  return <figure ref={ref} className={`polaroid ${className} ${selected ? 'selected' : ''}`} style={{ '--r': `${angle}deg`, ...style }} onClick={() => onSelect?.(id)}>
    <div className="photo-wrap"><img src={src} draggable="false" /></div>
    <figcaption>{caption}</figcaption>
    {selected && <><button className="drag-handle" onPointerDown={handlePointerDown} aria-label="Drag photo"><GripVertical size={17}/></button><input className="rotate" aria-label="Rotate photo" type="range" min="-18" max="18" value={angle} onChange={e => setAngle(e.target.value)} /></>}
  </figure>
}

function BookPage({ side, selection, setSelection, page, photos, direction }) {
  const sourceItems = page === 1 ? firstPage : secondPage;
  const items = sourceItems.map(index => index % photos.length);
  const composition = direction.composition[page - 1];
  const photoStyle = (index) => ({ left: composition[index].x, top: composition[index].y, width: composition[index].width });
  return <section className={`book-page ${side}`}>
    <div className="paper-noise" />
    {page === 1 ? <>
      <span className="date-stamp">JUL 15, 2026</span>
      <div className="tape tape-top" />
      <div className="torn-paper torn-pink" />
      <div className="curtain curtain-left"><i/><i/><i/><i/></div>
      <div className="curtain curtain-top"><i/><i/><i/><i/><i/></div>
      <div className="alphabet-title" aria-label="little joys"><b>L</b><b>I</b><b>T</b><b>T</b><b>L</b><b>E</b></div>
      <div className="chapter-label">a small collection of</div>
      <h1>{direction.pages[0].title}</h1>
      <p className="opening-note">The kind of afternoon that asks you to stay a little longer.</p>
      <Polaroid id="p0" src={photos[composition[0].memoryIndex]} caption={composition[0].caption} className="hero-photo" rotation={composition[0].rotation} style={photoStyle(0)} selected={selection==='p0'} onSelect={setSelection}/>
      <Polaroid id="p3" src={photos[composition[1].memoryIndex]} caption={composition[1].caption} className="mid-photo" rotation={composition[1].rotation} style={photoStyle(1)} selected={selection==='p3'} onSelect={setSelection}/>
      <Polaroid id="p7" src={photos[composition[2].memoryIndex]} caption={composition[2].caption} className="small-photo" rotation={composition[2].rotation} style={photoStyle(2)} selected={selection==='p7'} onSelect={setSelection}/>
      <div className="journal-card"><span>right now</span><strong>✦ trying new things<br/>✦ laughing too loud<br/>✦ keeping the tiny bits</strong></div>
      <div className="sticker-cloud">☁</div><div className="sticker-cherry">🍒</div><div className="checklist"><i>✓</i><i>✓</i><i>♡</i></div>
      <div className="food-sticker noodle">🍜</div><div className="food-sticker cake">🍰</div><div className="camera-sticker">⌁<span>▣</span></div>
      <div className="image-description desc-one">a little colour<br/><b>for the soul</b> ✿</div>
      <div className="postage">AIR MAIL<br/><b>♥ KEEPSY ♥</b></div><div className="lace-strip">✦ ✦ ✦ ✦ ✦ ✦</div>
      <div className="pressed-flower float">✿</div><div className="doodle sun pulse">☼</div><span className="sparkle s-one">✦</span><span className="sparkle s-two">✦</span>
      <p className="footer-note">keep the ordinary<br/>bits, too.</p>
    </> : <>
      <div className="postcard-note">some days don't need<br/>a reason to be lovely.</div>
      <div className="torn-paper torn-blue" /><div className="label-tag">VERY<br/>CUTE</div>
      <div className="curtain curtain-right"><i/><i/><i/><i/></div>
      <div className="washi washi-pink" />
      <Polaroid id="p1" src={photos[composition[0].memoryIndex]} caption={composition[0].caption} className="r-hero" rotation={composition[0].rotation} style={photoStyle(0)} selected={selection==='p1'} onSelect={setSelection}/>
      <Polaroid id="p5" src={photos[composition[1].memoryIndex]} caption={composition[1].caption} className="r-mid" rotation={composition[1].rotation} style={photoStyle(1)} selected={selection==='p5'} onSelect={setSelection}/>
      <Polaroid id="p8" src={photos[composition[2].memoryIndex]} caption={composition[2].caption} className="r-small" rotation={composition[2].rotation} style={photoStyle(2)} selected={selection==='p8'} onSelect={setSelection}/>
      <div className="film-strip"><span/><span/><span/></div><div className="ransom-title"><b>H</b><b>A</b><b>P</b><b>P</b><b>Y</b></div>
      <div className="mini-note">note to self:<br/><b>do this again soon!</b></div><div className="sticker-bow">🎀</div>
      <div className="pattern-paper dots-paper" /><div className="pattern-paper gingham-paper" />
      <div className="image-description desc-two">one for the<br/><b>memory drawer</b> ♡</div><div className="food-sticker toast">🧇</div>
      <div className="vintage-sticker">HELLO<br/><small>SUNSHINE</small></div><div className="star-burst">best<br/>day<br/>ever!</div>
      <div className="ticket">KEEPSY<br/><b>MEMORY CLUB</b><br/>one of one</div>
      <div className="doodle star pulse">✦</div><div className="tiny-heart float">♥</div><span className="sticker-wave">〰</span>
      <p className="right-footer">made from moments<br/>that felt like home</p>
    </>}
    <span className="page-number">{page}</span>
  </section>
}

function App() {
  const [selection, setSelection] = useState(null);
  const [zoom, setZoom] = useState(0.86);
  const [saved, setSaved] = useState(false);
  const [panel, setPanel] = useState(true);
  const [memoryPhotos, setMemoryPhotos] = useState(demoPhotos);
  const [direction, setDirection] = useState(() => originalBuildCreativeDirection([]));
  const [reading, setReading] = useState(false);
  const [readingStep, setReadingStep] = useState(0);
  const [started, setStarted] = useState(false);

  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const receiveMemories = async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    setStarted(true);
    setReading(true);
    setReadingStep(0);
    const localPhotos = files.map(file => URL.createObjectURL(file));

    // Clear any pending/existing timeouts from a previous upload
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    timeoutsRef.current.push(window.setTimeout(() => setReadingStep(1), 320));
    timeoutsRef.current.push(window.setTimeout(() => setReadingStep(2), 700));
    timeoutsRef.current.push(window.setTimeout(() => setReadingStep(3), 1080));

    try {
      const directionResult = await buildCreativeDirection(files);
      setMemoryPhotos(localPhotos);
      setDirection(directionResult);
    } catch (error) {
      console.warn('AI pipeline failed, falling back to deterministic direction:', error);
      const directionResult = originalBuildCreativeDirection(files);
      setMemoryPhotos(localPhotos);
      setDirection(directionResult);
    } finally {
      setReading(false);
    }
  };

  if (!started) return <section className="welcome">
    <a className="brand" href="#"><span>k</span>eepsy</a>
    <div className="welcome-ephemera ephemera-one">✦</div><div className="welcome-ephemera ephemera-two">♥</div><div className="welcome-ephemera ephemera-three">☼</div>
    <div className="memory-envelope"><div className="envelope-flap"/><div className="welcome-photo one"/><div className="welcome-photo two"/><div className="welcome-photo three"/><div className="mini-ticket">A DAY<br/>WORTH<br/>KEEPING</div></div>
    <div className="welcome-copy"><p className="eyebrow">AN AI MEMORY DESIGNER</p><h1>give us the moments.<br/><em>we’ll keep the feeling.</em></h1><p>Keepsy quietly reads the story in your photos, then designs a one-of-one memory book around it.</p><label className="upload-ritual"><ImagePlus size={19}/><span>Drop in your memories</span><small>photos or videos</small><input type="file" accept="image/*,video/*" multiple onChange={receiveMemories}/></label><div className="quiet-promise"><i>✦</i> No prompts. No themes. No decisions.</div></div>
  </section>;
  return <main>
    <header>
      <a className="brand" href="#"><span>k</span>eepsy</a>
      <div className="crumb"><button><ChevronLeft size={17}/></button><span>My memories</span><i>/</i><strong>Little joys</strong></div>
      <div className="header-actions"><button className="icon-button" title="Undo"><Undo2 size={18}/></button><button className="icon-button" title="Redo"><Redo2 size={18}/></button><div className="line"/><button className="share"><Share2 size={16}/> Share</button><button className="export" onClick={()=>setSaved(true)}><Download size={16}/> {saved ? 'Saved!' : 'Export'}</button><div className="avatar">M</div></div>
    </header>
    <div className="workspace">
      <aside className={`sidebar ${panel ? '' : 'closed'}`}>
        <div className="collection-head"><div><p>AI MEMORY DESIGN</p><h2>{direction.theme} <span>✦</span></h2></div><button onClick={()=>setPanel(false)}><X size={16}/></button></div>
        <div className="ai-note"><Sparkles size={15}/><span>Creative direction is forming</span><i /></div>
        <div className="story"><p className="eyebrow">THE STORY AI FOUND</p><p>{direction.story}</p><div className="signals"><BrainCircuit size={14}/><span>{direction.inferred.energy}</span></div></div>
        <div className="memory-head"><p className="eyebrow">{memoryPhotos.length} MEMORIES</p><label className="add-memories"><Plus size={15}/> Add<input type="file" accept="image/*" multiple onChange={receiveMemories}/></label></div>
        <div className="thumbnail-grid">{memoryPhotos.map((p,i)=><button key={`${p}-${i}`} onClick={()=>setSelection(`p${i}`)}><img src={p}/></button>)}</div>
        <div className="theme-card"><div className="swatches">{direction.palette.map(color=><i key={color} style={{background:color}}/>)}</div><div><p>AI MATERIAL DIRECTION</p><strong>{direction.paperTexture}</strong></div></div>
      </aside>
      {!panel && <button className="open-panel" onClick={()=>setPanel(true)}>☰ Collection</button>}
      <section className="canvas-area">
        <div className="canvas-toolbar"><button onClick={()=>setZoom(Math.max(.55, zoom-.08))}><ZoomOut size={17}/></button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(Math.min(1.05, zoom+.08))}><ZoomIn size={17}/></button></div>
        <div className="book-scale" style={{transform:`scale(${zoom})`}}><div className="book"><BookPage side="left" selection={selection} setSelection={setSelection} page={1} photos={memoryPhotos} direction={direction}/><div className="spine"/><BookPage side="right" selection={selection} setSelection={setSelection} page={2} photos={memoryPhotos} direction={direction}/></div></div>
        <div className="page-nav"><button><ChevronLeft size={20}/></button><span><b>01–02</b> of 08</span><button><ChevronRight size={20}/></button></div>
      </section>
      <aside className="inspector"><p>AI CREATIVE DIRECTION</p><div className="inspector-title"><span className="spark">✦</span><div><h3>{direction.theme}</h3><small>Designed from visual signals</small></div></div><hr/><div className="detail-row"><span>Paper</span><strong>{direction.paperTexture}</strong></div><div className="detail-row"><span>Rhythm</span><strong>{direction.inferred.visualRhythm}</strong></div><div className="detail-row"><span>Palette</span><div className="mini-swatches">{direction.palette.map(color=><i key={color} style={{background:color}}/>)}</div></div><div className="story-arc"><p>STORY ARC</p>{direction.inferred.storyArc.map((beat, i)=><span key={beat}><b>{i+1}</b>{beat}</span>)}</div><p className="hint">Keepsy chose each material and pause from the feeling it found in your memories.</p></aside>
      {reading && <MemoryReading step={readingStep}/>}
    </div>
  </main>
}
function MemoryReading({ step }) {
  const moments = [
    ['Looking closely', 'faces, light, colours and the details you almost missed'],
    ['Finding the thread', 'the people, places, energy and rhythm between frames'],
    ['Choosing what belongs', 'papers, objects, pauses and a visual language of its own'],
    ['Making it feel like yours', 'building a one-of-one memory book'],
  ];

  // Safe bounds check
  const safeStep = Math.max(0, Math.min(step, moments.length - 1));
  const currentMoment = moments[safeStep];
  const words = ['colour', 'connection', 'place', 'feeling'];
  const currentWord = words[safeStep] || '';

  return <div className="memory-reading"><div><Sparkles size={24}/><p>{currentMoment[0]}</p><small>{currentMoment[1]}</small><div className="reading-track">{moments.map((item, index)=><i key={item[0]} className={index <= safeStep ? 'on' : ''}/>)}</div><span className="reading-words">{currentWord}</span></div></div>;
}
createRoot(document.getElementById('root')).render(<App/>);