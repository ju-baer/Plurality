import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import * as Tone from 'tone';

// Cogniton component - floating idea-forms
const Cogniton = ({ 
  position = [0, 0, 0], 
  size = 1, 
  color = '#ffffff',
  pulseColor = '#ff6b6b',
  speed = 0.5,
  rotationFactor = 0.2,
  onClick = () => {},
  onHover = () => {},
  onLeave = () => {},
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Animation on hover
  useEffect(() => {
    if (!meshRef.current) return;
    
    if (hovered) {
      gsap.to(meshRef.current.scale, { 
        x: 1.2, 
        y: 1.2, 
        z: 1.2, 
        duration: 0.3, 
        ease: "power2.out" 
      });
      onHover();
    } else {
      gsap.to(meshRef.current.scale, { 
        x: 1, 
        y: 1, 
        z: 1, 
        duration: 0.5, 
        ease: "elastic.out(1, 0.3)" 
      });
      onLeave();
    }
  }, [hovered, onHover, onLeave]);

  // Floating animation
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Gentle floating motion
    meshRef.current.position.y += Math.sin(time * speed) * 0.003;
    
    // Subtle rotation
    meshRef.current.rotation.x = Math.sin(time * 0.5) * rotationFactor;
    meshRef.current.rotation.z = Math.cos(time * 0.3) * rotationFactor;
    
    // Pulse effect when hovered
    if (hovered) {
      const pulseIntensity = (Math.sin(time * 5) + 1) / 2;
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.emissiveIntensity = 0.5 + pulseIntensity * 0.5;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[size, size, size]}
      onClick={(e) => {
        e.stopPropagation();
        setClicked(!clicked);
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        emissive={pulseColor}
        emissiveIntensity={hovered ? 1 : 0.2}
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
};

// Echo Ribbon component - trails between related concepts
const EchoRibbon = ({ 
  startPoint = [0, 0, 0], 
  endPoint = [5, 0, 0], 
  width = 0.1,
  color = '#ffffff',
  noiseIntensity = 0.2,
  pulseSpeed = 0.5
}) => {
  const ribbonRef = useRef<THREE.Mesh>(null);
  const points = useRef<THREE.Vector3[]>([]);
  
  // Create curve points
  useEffect(() => {
    const start = new THREE.Vector3(...startPoint);
    const end = new THREE.Vector3(...endPoint);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    // Add some height to the midpoint for a nice curve
    mid.y += 2;
    
    // Create a curve with these points
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    
    // Sample points along the curve
    points.current = curve.getPoints(20);
  }, [startPoint, endPoint]);

  // Animate the ribbon
  useFrame((state) => {
    if (!ribbonRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Apply noise to the ribbon vertices
    const geometry = ribbonRef.current.geometry;
    const positionAttr = geometry.getAttribute('position');
    
    for (let i = 0; i < positionAttr.count; i++) {
      const idx = i * 3;
      const originalX = points.current[Math.floor(i / 2)]?.x || 0;
      const originalY = points.current[Math.floor(i / 2)]?.y || 0;
      const originalZ = points.current[Math.floor(i / 2)]?.z || 0;
      
      // Apply noise
      positionAttr.setX(i, originalX + Math.sin(time * pulseSpeed + i * 0.2) * noiseIntensity);
      positionAttr.setY(i, originalY + Math.cos(time * pulseSpeed + i * 0.3) * noiseIntensity);
      positionAttr.setZ(i, originalZ + Math.sin(time * pulseSpeed + i * 0.4) * noiseIntensity);
    }
    
    positionAttr.needsUpdate = true;
    
    // Pulse effect
    const pulseIntensity = (Math.sin(time * pulseSpeed) + 1) / 2;
    if (ribbonRef.current.material instanceof THREE.MeshStandardMaterial) {
      ribbonRef.current.material.emissiveIntensity = 0.2 + pulseIntensity * 0.8;
    }
  });

  return (
    <mesh ref={ribbonRef}>
      <tubeGeometry args={[
        new THREE.CatmullRomCurve3(points.current),
        64, // tubular segments
        width, // radius
        8, // radial segments
        false // closed
      ]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.7}
        emissive={color}
        emissiveIntensity={0.5}
        transparent={true}
        opacity={0.7}
      />
    </mesh>
  );
};

// Concept Nebula component - thought-clusters
const ConceptNebula = ({
  position = [0, 0, 0],
  radius = 5,
  particleCount = 200,
  color = '#8844ff',
  rotationSpeed = 0.1
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<Float32Array | null>(null);
  
  // Create particles
  useEffect(() => {
    if (!particlesRef.current) {
      particlesRef.current = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * (0.5 + Math.random() * 0.5); // Vary the radius
        
        particlesRef.current[i3] = r * Math.sin(phi) * Math.cos(theta);
        particlesRef.current[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        particlesRef.current[i3 + 2] = r * Math.cos(phi);
      }
    }
  }, [particleCount, radius]);

  // Animate the nebula
  useFrame((state) => {
    if (!pointsRef.current || !particlesRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Rotate the entire nebula
    pointsRef.current.rotation.y = time * rotationSpeed;
    pointsRef.current.rotation.z = time * rotationSpeed * 0.5;
    
    // Update individual particles
    const positions = pointsRef.current.geometry.getAttribute('position');
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Add some noise to the positions
      positions.setXYZ(
        i,
        particlesRef.current[i3] + Math.sin(time * 0.5 + i * 0.1) * 0.1,
        particlesRef.current[i3 + 1] + Math.cos(time * 0.6 + i * 0.1) * 0.1,
        particlesRef.current[i3 + 2] + Math.sin(time * 0.7 + i * 0.1) * 0.1
      );
    }
    
    positions.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particlesRef.current || new Float32Array(particleCount * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Resonance Field component - touch-based metaphors
const ResonanceField = ({
  position = [0, 0, 0],
  radius = 3,
  color = '#44aaff',
  intensity = 1.0,
  pulseSpeed = 0.5
}) => {
  const fieldRef = useRef<THREE.Mesh>(null);
  
  // Animate the field
  useFrame((state) => {
    if (!fieldRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Pulse effect
    const pulseIntensity = (Math.sin(time * pulseSpeed) + 1) / 2;
    
    if (fieldRef.current.material instanceof THREE.ShaderMaterial) {
      fieldRef.current.material.uniforms.uTime.value = time;
      fieldRef.current.material.uniforms.uIntensity.value = intensity * (0.5 + pulseIntensity * 0.5);
    }
    
    // Gentle rotation
    fieldRef.current.rotation.y = time * 0.1;
    fieldRef.current.rotation.z = time * 0.05;
  });

  // Custom shader for the resonance field
  const shaderData = {
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity }
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        // Add some movement to the vertices
        vec3 pos = position;
        float displacement = sin(uTime * 2.0 + position.x * 4.0) * 
                            sin(uTime * 2.0 + position.y * 4.0) * 
                            sin(uTime * 2.0 + position.z * 4.0) * 0.1;
        
        pos += normal * displacement;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        // Create a pulsing, glowing effect
        float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
        
        // Create patterns based on position
        float pattern = sin(vPosition.x * 10.0 + uTime) * 
                        sin(vPosition.y * 10.0 + uTime) * 
                        sin(vPosition.z * 10.0 + uTime);
        
        // Edge glow effect
        float edge = 1.0 - max(0.0, dot(normalize(vPosition), vec3(0.0, 0.0, 1.0)));
        edge = pow(edge, 3.0);
        
        // Combine effects
        vec3 finalColor = uColor * (0.5 + pulse * 0.5) * (0.8 + pattern * 0.2) * uIntensity;
        float alpha = 0.2 + edge * 0.8 * uIntensity;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  };

  return (
    <mesh ref={fieldRef} position={position}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        uniforms={shaderData.uniforms}
        vertexShader={shaderData.vertexShader}
        fragmentShader={shaderData.fragmentShader}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// IdeoPortal component - entry points into deeper layers
const IdeoPortal = ({
  position = [0, 0, 0],
  radius = 1.5,
  color = '#ffffff',
  portalColor = '#000000',
  rotationSpeed = 0.2,
  onClick = () => {}
}) => {
  const portalRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Animation
  useFrame((state) => {
    if (!portalRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Rotate the portal
    portalRef.current.rotation.y = time * rotationSpeed;
    portalRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
    
    // Pulse effect when hovered
    if (hovered) {
      const pulseIntensity = (Math.sin(time * 3) + 1) / 2;
      portalRef.current.scale.set(
        1 + pulseIntensity * 0.1,
        1 + pulseIntensity * 0.1,
        1 + pulseIntensity * 0.1
      );
    }
  });

  return (
    <group
      ref={portalRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Portal ring */}
      <mesh>
        <torusGeometry args={[radius, 0.2, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Portal interior */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius - 0.1, 32]} />
        <shaderMaterial
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(portalColor) },
            uPortalColor: { value: new THREE.Color(color) }
          }}
          vertexShader={`
            varying vec2 vUv;
            
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uColor;
            uniform vec3 uPortalColor;
            varying vec2 vUv;
            
            void main() {
              // Calculate distance from center
              vec2 center = vec2(0.5, 0.5);
              float dist = distance(vUv, center);
              
              // Create swirling effect
              float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
              float swirl = sin(dist * 20.0 - uTime * 2.0 + angle * 5.0) * 0.5 + 0.5;
              
              // Edge glow
              float edge = smoothstep(0.4, 0.5, dist);
              
              // Combine effects
              vec3 finalColor = mix(uColor, uPortalColor, edge * swirl);
              
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `}
          uniforms-uTime-value={state => state.clock.getElapsedTime()}
          transparent={true}
        />
      </mesh>
      
      {/* Particles around the portal */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={(() => {
              const arr = new Float32Array(100 * 3);
              for (let i = 0; i < 100; i++) {
                const angle = (i / 100) * Math.PI * 2;
                const radiusVar = radius + (Math.random() - 0.5) * 0.5;
                arr[i * 3] = Math.cos(angle) * radiusVar;
                arr[i * 3 + 1] = Math.sin(angle) * radiusVar;
                arr[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
              }
              return arr;
            })()}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={color}
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// Background component with stellar iridescence
const CosmicBackground = () => {
  const { scene } = useThree();
  
  useEffect(() => {
    // Create a dynamic background
    const vertexShader = `
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const fragmentShader = `
      uniform float uTime;
      varying vec3 vWorldPosition;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        // First corner
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        // Permutations
        i = mod289(i);
        vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
              
        // Gradients
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }
      
      void main() {
        // Normalized direction
        vec3 dir = normalize(vWorldPosition);
        
        // Base colors for the stellar iridescence
        vec3 purpleColor = vec3(0.4, 0.0, 0.6);
        vec3 blueColor = vec3(0.0, 0.2, 0.8);
        vec3 tealColor = vec3(0.0, 0.6, 0.6);
        vec3 goldColor = vec3(1.0, 0.8, 0.0);
        
        // Create noise patterns at different scales
        float noise1 = snoise(dir * 2.0 + vec3(0.0, 0.0, uTime * 0.05));
        float noise2 = snoise(dir * 5.0 + vec3(0.0, uTime * 0.1, 0.0));
        float noise3 = snoise(dir * 10.0 + vec3(uTime * 0.2, 0.0, 0.0));
        
        // Combine noise patterns
        float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
        
        // Map noise to color gradient
        vec3 color;
        if (combinedNoise < -0.3) {
          color = mix(purpleColor, blueColor, (combinedNoise + 0.3) / 0.3);
        } else if (combinedNoise < 0.0) {
          color = mix(blueColor, tealColor, (combinedNoise + 0.3) / 0.3);
        } else if (combinedNoise < 0.3) {
          color = mix(tealColor, goldColor, combinedNoise / 0.3);
        } else {
          color = goldColor;
        }
        
        // Add stars
        float stars = pow(max(0.0, snoise(dir * 50.0)), 20.0) * 5.0;
        color += vec3(stars);
        
        // Add some depth and vignette
        float vignette = 1.0 - pow(length(dir.xy), 2.0);
        color *= vignette * 0.5 + 0.5;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    
    // Create a skybox
    const shader = {
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader,
      fragmentShader
    };
    
    const skyMaterial = new THREE.ShaderMaterial(shader);
    const skyGeometry = new THREE.SphereGeometry(100, 64, 64);
    skyGeometry.scale(-1, 1, 1); // Invert the sphere so we see it from the inside
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    
    // Update the time uniform
    const updateTime = () => {
      skyMaterial.uniforms.uTime.value = performance.now() / 1000;
      requestAnimationFrame(updateTime);
    };
    
    updateTime();
    
    return () => {
      scene.remove(sky);
    };
  }, [scene]);
  
  return null;
};

// Sound manager for ambient soundscape
const SoundManager = () => {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (initialized) return;
    
    const initAudio = async () => {
      await Tone.start();
      
      // Create a polyphonic synth for ambient sounds
      const synth = new Tone.PolySynth(Tone.FMSynth).toDestination();
      synth.volume.value = -20; // Lower volume
      
      // Create a reverb effect
      const reverb = new Tone.Reverb(5).toDestination();
      synth.connect(reverb);
      
      // Create a pattern of notes
      const notes = ['C4', 'E4', 'G4', 'B4', 'D5', 'A4'];
      
      // Play a random note occasionally
      const playRandomNote = () => {
        const note = notes[Math.floor(Math.random() * notes.length)];
        const octave = 3 + Math.floor(Math.random() * 3); // Random octave between 3-5
        const duration = 2 + Math.random() * 4; // Random duration between 2-6 seconds
        
        synth.triggerAttackRelease(`${note.charAt(0)}${octave}`, duration);
        
        // Schedule next note
        const nextTime = 2 + Math.random() * 8; // Random time between 2-10 seconds
        setTimeout(playRandomNote, nextTime * 1000);
      };
      
      // Start the ambient sound
      playRandomNote();
      
      // Create a low drone
      const drone = new Tone.FMSynth({
        harmonicity: 0.5,
        modulationIndex: 10,
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 1,
          decay: 0.2,
          sustain: 0.8,
          release: 1.5
        },
        modulation: {
          type: 'triangle'
        },
        modulationEnvelope: {
          attack: 0.5,
          decay: 0,
          sustain: 1,
          release: 0.5
        }
      }).toDestination();
      
      drone.volume.value = -30; // Very quiet
      drone.connect(reverb);
      
      // Play a continuous drone
      drone.triggerAttack('C2');
      
      setInitialized(true);
    };
    
    // Initialize audio on user interaction
    const handleInteraction = () => {
      if (!initialized) {
        initAudio();
        window.removeEventListener('click', handleInteraction);
      }
    };
    
    window.addEventListener('click', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
    };
  }, [initialized]);
  
  return null;
};

// Main scene component
const PluralityScene = () => {
  const [cognitons, setCognitons] = useState([
    { id: 1, position: [-5, 2, -3], size: 1.2, color: '#e1a1ff', pulseColor: '#ff6b6b' },
    { id: 2, position: [4, -1, -5], size: 0.8, color: '#61dafb', pulseColor: '#61dafb' },
    { id: 3, position: [0, 3, -8], size: 1.5, color: '#ffaa44', pulseColor: '#ff6b6b' },
    { id: 4, position: [-3, -2, -6], size: 1.0, color: '#44ddaa', pulseColor: '#44ddaa' },
    { id: 5, position: [6, 1, -4], size: 0.9, color: '#ff61ab', pulseColor: '#ff61ab' },
  ]);
  
  const [connections, setConnections] = useState([
    { id: 1, start: [-5, 2, -3], end: [0, 3, -8], color: '#e1a1ff' },
    { id: 2, start: [4, -1, -5], end: [6, 1, -4], color: '#61dafb' },
    { id: 3, start: [0, 3, -8], end: [-3, -2, -6], color: '#ffaa44' },
  ]);
  
  const [nebulae, setNebulae] = useState([
    { id: 1, position: [-8, 5, -15], radius: 8, color: '#8844ff', particleCount: 300 },
    { id: 2, position: [10, -3, -20], radius: 6, color: '#44aaff', particleCount: 200 },
  ]);
  
  const [resonanceFields, setResonanceFields] = useState([
    { id: 1, position: [0, 0, -10], radius: 5, color: '#44aaff', intensity: 1.0 },
  ]);
  
  const [portals, setPortals] = useState([
    { id: 1, position: [-4, -4, -8], radius: 1.5, color: '#ffffff', portalColor: '#000000' },
    { id: 2, position: [5, 5, -12], radius: 2, color: '#ffdd44', portalColor: '#330066' },
  ]);
  
  // Play a sound when interacting with a Cogniton
  const playCognitonSound = (id: number) => {
    if (typeof window === 'undefined') return;
    
    // Create a simple synth sound
    const synth = new Tone.Synth({
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination();
    
    // Different note for each Cogniton
    const notes = ['C5', 'E5', 'G5', 'B5', 'D6'];
    synth.triggerAttackRelease(notes[(id - 1) % notes.length], 0.5);
  };
  
  // Handle portal click
  const handlePortalClick = (id: number) => {
    // Play a portal sound
    const synth = new Tone.MetalSynth({
      frequency: 200,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.1
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).toDestination();
    
    synth.triggerAttackRelease('C4', 0.5);
    
    // Add a new Cogniton when clicking a portal
    const newId = cognitons.length + 1;
    const portalPos = portals.find(p => p.id === id)?.position || [0, 0, 0];
    
    // Create a position near the portal
    const newPos = [
      portalPos[0] + (Math.random() - 0.5) * 3,
      portalPos[1] + (Math.random() - 0.5) * 3,
      portalPos[2] + (Math.random() - 0.5) * 3
    ];
    
    // Random color
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 80%, 70%)`;
    const pulseColor = `hsl(${(hue + 30) % 360}, 80%, 70%)`;
    
    setCognitons([
      ...cognitons,
      {
        id: newId,
        position: newPos as [number, number, number],
        size: 0.5 + Math.random() * 0.8,
        color,
        pulseColor
      }
    ]);
    
    // Maybe create a new connection
    if (Math.random() > 0.5 && cognitons.length > 0) {
      const randomCogniton = cognitons[Math.floor(Math.random() * cognitons.length)];
      
      setConnections([
        ...connections,
        {
          id: connections.length + 1,
          start: newPos as [number, number, number],
          end: randomCogniton.position,
          color
        }
      ]);
    }
  };

  return (
    <>
      <Canvas style={{ width: '100%', height: '100vh', background: '#000' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        {/* Background */}
        <CosmicBackground />
        
        {/* Concept Nebulae */}
        {nebulae.map(nebula => (
          <ConceptNebula
            key={nebula.id}
            position={nebula.position as [number, number, number]}
            radius={nebula.radius}
            color={nebula.color}
            particleCount={nebula.particleCount}
          />
        ))}
        
        {/* Resonance Fields */}
        {resonanceFields.map(field => (
          <ResonanceField
            key={field.id}
            position={field.position as [number, number, number]}
            radius={field.radius}
            color={field.color}
            intensity={field.intensity}
          />
        ))}
        
        {/* Echo Ribbons (connections) */}
        {connections.map(connection => (
          <EchoRibbon
            key={connection.id}
            startPoint={connection.start}
            endPoint={connection.end}
            width={0.1}
            color={connection.color}
          />
        ))}
        
        {/* Cognitons */}
        {cognitons.map(cogniton => (
          <Cogniton
            key={cogniton.id}
            position={cogniton.position as [number, number, number]}
            size={cogniton.size}
            color={cogniton.color}
            pulseColor={cogniton.pulseColor}
            onClick={() => playCognitonSound(cogniton.id)}
          />
        ))}
        
        {/* IdeoPortals */}
        {portals.map(portal => (
          <IdeoPortal
            key={portal.id}
            position={portal.position as [number, number, number]}
            radius={portal.radius}
            color={portal.color}
            portalColor={portal.portalColor}
            onClick={() => handlePortalClick(portal.id)}
          />
        ))}
        
        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.5}
          panSpeed={0.5}
          rotateSpeed={0.5}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>
      
      {/* Sound manager */}
      <SoundManager />
    </>
  );
};

export default PluralityScene;
