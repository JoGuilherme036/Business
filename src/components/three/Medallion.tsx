import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// Brass club medallion. Geometry is procedural; the engraving is drawn on 2D canvases
// (color, bump and roughness maps) with the brand typeface, so no model download is needed.

const SIZE = 1024;
const FONT = '"Bodoni Moda Variable", Didot, serif';
const SANS = '"Manrope Variable", sans-serif';

type Layer = 'color' | 'bump' | 'rough';

function drawFace(layer: Layer, side: 'front' | 'back') {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const g = c.getContext('2d')!;
  const mid = SIZE / 2;
  const palette = {
    color: { base: '#c99a5e', raised: '#e9c48a', groove: '#7a5228' },
    bump: { base: '#808080', raised: '#ffffff', groove: '#303030' },
    rough: { base: '#7a7a7a', raised: '#262626', groove: '#a0a0a0' },
  }[layer];

  g.fillStyle = palette.base;
  g.fillRect(0, 0, SIZE, SIZE);

  // Fine concentric "lathe" lines give the face a turned-metal finish.
  if (layer !== 'color') {
    for (let r = 20; r < mid; r += 3) {
      g.strokeStyle = `rgba(${layer === 'bump' ? '255,255,255' : '0,0,0'},${0.04 + Math.random() * 0.05})`;
      g.lineWidth = 1;
      g.beginPath();
      g.arc(mid, mid, r, 0, Math.PI * 2);
      g.stroke();
    }
  }

  const ring = (r: number, w: number, color: string) => {
    g.strokeStyle = color;
    g.lineWidth = w;
    g.beginPath();
    g.arc(mid, mid, r, 0, Math.PI * 2);
    g.stroke();
  };
  ring(mid - 18, 14, palette.raised);
  ring(mid - 58, 3, palette.groove);
  ring(mid - 150, 2, palette.groove);

  // Circular lettering between the two grooves.
  const label = side === 'front' ? 'BARBEARIA  ·  ATELIÊ NOTURNO  ·  CLUBE  ·  ' : 'MEMBRO  ·  HORA MARCADA  ·  NAVALHA  ·  ';
  g.fillStyle = palette.raised;
  g.font = `600 34px ${SANS}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const chars = label.repeat(side === 'front' ? 1 : 1).split('');
  const radius = mid - 104;
  chars.forEach((ch, i) => {
    const a = (i / chars.length) * Math.PI * 2 - Math.PI / 2;
    g.save();
    g.translate(mid + Math.cos(a) * radius, mid + Math.sin(a) * radius);
    g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
  });

  g.fillStyle = palette.raised;
  if (side === 'front') {
    g.font = `italic 400 330px ${FONT}`;
    g.fillText('RB', mid - 6, mid + 20);
  } else {
    g.font = `italic 400 120px ${FONT}`;
    g.fillText('Clube', mid, mid - 20);
    g.font = `600 30px ${SANS}`;
    g.fillText('M M X X V I', mid, mid + 70);
  }
  return c;
}

function drawEdge(layer: 'bump' | 'color') {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 32;
  const g = c.getContext('2d')!;
  g.fillStyle = layer === 'bump' ? '#808080' : '#c99a5e';
  g.fillRect(0, 0, c.width, c.height);
  for (let x = 0; x < c.width; x += 8) {
    g.fillStyle = layer === 'bump' ? '#ffffff' : '#e3bb80';
    g.fillRect(x, 0, 4, c.height);
  }
  return c;
}

function useMaterials() {
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    Promise.all([document.fonts.load(`italic 400 100px ${FONT}`), document.fonts.load(`600 30px ${SANS}`)])
      .catch(() => undefined)
      .finally(() => setFontsReady(true));
  }, []);

  return useMemo(() => {
    if (!fontsReady) return null;
    const tex = (canvas: HTMLCanvasElement, srgb = false) => {
      const t = new THREE.CanvasTexture(canvas);
      t.anisotropy = 8;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.center.set(0.5, 0.5);
      return t;
    };
    const face = (side: 'front' | 'back') =>
      new THREE.MeshStandardMaterial({
        map: tex(drawFace('color', side), true),
        bumpMap: tex(drawFace('bump', side)),
        bumpScale: 2.2,
        roughnessMap: tex(drawFace('rough', side)),
        roughness: 1,
        metalness: 1,
        envMapIntensity: 1.25,
      });
    const edgeBump = tex(drawEdge('bump'));
    edgeBump.wrapS = THREE.RepeatWrapping;
    edgeBump.repeat.set(2, 1);
    const edgeMap = tex(drawEdge('color'), true);
    edgeMap.wrapS = THREE.RepeatWrapping;
    edgeMap.repeat.set(2, 1);
    const edge = new THREE.MeshStandardMaterial({ map: edgeMap, bumpMap: edgeBump, bumpScale: 3, metalness: 1, roughness: 0.32 });
    const front = face('front');
    const back = face('back');
    back.map!.rotation = back.bumpMap!.rotation = back.roughnessMap!.rotation = Math.PI / 2;
    // Cylinder caps map UVs along x/z; rotate so the lettering reads upright when facing the camera.
    front.map!.rotation = front.bumpMap!.rotation = front.roughnessMap!.rotation = Math.PI / 2;
    return [edge, front, back];
  }, [fontsReady]);
}

function Coin({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const materials = useMaterials();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const on = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 };
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || reduced) return;
    // Section-local progress: the coin flips from front to back once while the section crosses the screen.
    const rect = state.gl.domElement.getBoundingClientRect();
    const vh = window.innerHeight;
    const local = THREE.MathUtils.clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    const targetY = -0.55 + THREE.MathUtils.smoothstep(local, 0.35, 0.8) * Math.PI + pointer.current.x * 0.35 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
    const targetX = pointer.current.y * 0.2 + 0.12;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3, delta);
  });

  if (!materials) return null;
  return (
    <group ref={group} rotation={[0.12, reduced ? -0.35 : 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.16, 160, 1]} />
      </mesh>
    </group>
  );
}

export default function Medallion({ reduced, active = true }: { reduced: boolean; active?: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      frameloop={active && !reduced ? 'always' : 'demand'}
      camera={{ position: [0, 0, 5.4], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#ffd9a8" />
      <Float speed={reduced ? 0 : 1.6} rotationIntensity={reduced ? 0 : 0.25} floatIntensity={reduced ? 0 : 0.6}>
        <Coin reduced={reduced} />
      </Float>
      <ContactShadows position={[0, -2.1, 0]} opacity={0.55} scale={7} blur={2.6} far={3} color="#000000" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffbe78" position={[-4, 2, 3]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#fff1dc" position={[4, -1, 2]} scale={[3, 4, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#ff9b4a" position={[0, 4, -3]} scale={3} />
        <Lightformer form="rect" intensity={0.6} color="#5f7d72" position={[0, -4, 1]} scale={[8, 1, 1]} />
      </Environment>
    </Canvas>
  );
}
