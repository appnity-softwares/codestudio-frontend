import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    Float,
    MeshDistortMaterial,
    PerspectiveCamera,
    Text,
    ContactShadows,
    Environment,
    PresentationControls
} from "@react-three/drei";
import * as THREE from "three";

interface BadgeProps {
    color?: string;
    label: string;
    subLabel?: string;
    icon?: string;
}

function BadgeObject({ color = "#38bdf8", label }: BadgeProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
        meshRef.current.position.y = Math.sin(time) * 0.1;
    });

    return (
        <group>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                scale={hovered ? 1.1 : 1}
            >
                {/* Main Badge Body */}
                <cylinderGeometry args={[1, 1, 0.2, 32]} />
                <MeshDistortMaterial
                    color={color}
                    speed={2}
                    distort={0.4}
                    radius={1}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Inner Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.11]}>
                <torusGeometry args={[0.8, 0.05, 16, 100]} />
                <meshStandardMaterial color="white" metalness={1} roughness={0} />
            </mesh>

            {/* Label in 3D */}
            <Text
                position={[0, 0, 0.15]}
                fontSize={0.2}
                color="white"
                font="/fonts/Inter-Bold.woff" // Assuming Inter is available or fallback
                anchorX="center"
                anchorY="middle"
            >
                {label.toUpperCase()}
            </Text>
        </group>
    );
}

export function ThreeBadge(props: BadgeProps) {
    return (
        <div className="h-[300px] w-full rounded-3xl bg-black/40 border border-white/5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <Canvas shadows className="cursor-grab active:cursor-grabbing">
                <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

                <PresentationControls
                    global
                    rotation={[0, 0.3, 0]}
                    polar={[-Math.PI / 3, Math.PI / 3]}
                    azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                >
                    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                        <BadgeObject {...props} />
                    </Float>
                </PresentationControls>

                <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
                <Environment preset="city" />
            </Canvas>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Elite Achievement</div>
                <h4 className="text-sm font-black text-white">{props.label}</h4>
                <p className="text-[10px] text-white/40 font-bold uppercase mt-1">{props.subLabel}</p>
            </div>

            {/* Interactive Glow */}
            <div className="absolute -inset-20 bg-primary/10 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity" />
        </div>
    );
}
