import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useConfigurator } from '../store'
import { Decal, useTexture, useGLTF } from '@react-three/drei'
import termosModelUrl from '../assets/termos3.glb?url'

function LogoDecal({ texture, x, y, z, rotation = 0, scale = 0.6 }) {
    const map = useTexture(texture);
    return (
        <Decal position={[x, y, z]} rotation={[0, 0, rotation]} scale={[scale, scale, 1]}>
            <meshPhysicalMaterial map={map} transparent polygonOffset polygonOffsetFactor={-1} roughness={0.5} />
        </Decal>
    );
}

function ThermosMesh({ geo, matRef, color, metalness = 0.7, roughness = 0.25, logos = [] }) {
    return (
        <mesh geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial ref={matRef} color={color} metalness={metalness} roughness={roughness} />
            {logos.map(logo => (
                <LogoDecal
                    key={logo.id}
                    texture={logo.texture}
                    x={logo.position[0]}
                    y={logo.position[1]}
                    z={0.35}
                    rotation={logo.rotation ?? 0}
                    scale={logo.scale ?? 0.6}
                />
            ))}
        </mesh>
    );
}

export function Thermos(props) {
    const { thermosBodyColor, thermosCapColor, thermosLogos } = useConfigurator();
    const { nodes } = useGLTF(termosModelUrl);

    useEffect(() => {
        if (nodes) {
            console.group('🔍 THERMOS NODE NAMES:');
            Object.entries(nodes).forEach(([name, node]) => {
                console.log(name, node.type, node.geometry ? '[ MESH ]' : '');
            });
            console.groupEnd();
        }
    }, [nodes]);

    const { bodyGeo, capGeo, otherGeos } = useMemo(() => {
        if (!nodes) return { bodyGeo: null, capGeo: null, otherGeos: [] };

        const meshEntries = Object.entries(nodes).filter(([, n]) => n.geometry);

        let bodyGeo = null;
        let capGeo = null;
        const otherGeos = [];

        for (const [name, node] of meshEntries) {
            const lower = name.toLowerCase();
            if (!capGeo && (lower.includes('cap') || lower.includes('lid') || lower.includes('top') || lower.includes('cover') || lower.includes('крышк'))) {
                capGeo = node.geometry;
            } else if (!bodyGeo && (lower.includes('body') || lower.includes('cylinder') || lower.includes('main') || lower.includes('thermos') || lower.includes('терм') || lower.includes('корп'))) {
                bodyGeo = node.geometry;
            } else {
                otherGeos.push({ name, geo: node.geometry });
            }
        }

        // Fallback: if no named match, assign by order
        if (!bodyGeo && !capGeo) {
            if (meshEntries.length === 1) {
                bodyGeo = meshEntries[0][1].geometry;
            } else if (meshEntries.length >= 2) {
                // First mesh = body, last mesh = cap
                bodyGeo = meshEntries[0][1].geometry;
                capGeo = meshEntries[meshEntries.length - 1][1].geometry;
                for (let i = 1; i < meshEntries.length - 1; i++) {
                    otherGeos.push({ name: meshEntries[i][0], geo: meshEntries[i][1].geometry });
                }
            }
        } else if (bodyGeo && !capGeo && otherGeos.length > 0) {
            capGeo = otherGeos[otherGeos.length - 1].geo;
            otherGeos.splice(otherGeos.length - 1, 1);
        }

        return { bodyGeo, capGeo, otherGeos };
    }, [nodes]);

    const bodyMatRef = useRef();
    const capMatRef = useRef();

    useFrame((_, delta) => {
        if (bodyMatRef.current) easing.dampC(bodyMatRef.current.color, thermosBodyColor, 0.25, delta);
        if (capMatRef.current) easing.dampC(capMatRef.current.color, thermosCapColor, 0.25, delta);
    });

    return (
        <group {...props} dispose={null}>
            {bodyGeo && (
                <ThermosMesh
                    geo={bodyGeo}
                    matRef={bodyMatRef}
                    color={thermosBodyColor}
                    logos={thermosLogos}
                />
            )}
            {capGeo && (
                <ThermosMesh
                    geo={capGeo}
                    matRef={capMatRef}
                    color={thermosCapColor}
                    metalness={0.5}
                    roughness={0.35}
                />
            )}
            {otherGeos.map(({ name, geo }) => (
                <mesh key={name} geometry={geo} castShadow receiveShadow>
                    <meshStandardMaterial color={thermosBodyColor} metalness={0.7} roughness={0.25} />
                </mesh>
            ))}
        </group>
    );
}

useGLTF.preload(termosModelUrl);
