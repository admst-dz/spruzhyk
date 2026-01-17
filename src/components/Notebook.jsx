import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useConfigurator } from '../store'
import { Decal, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// --- ГЕНЕРАТОР УЗОРОВ ---
function createPatternTexture(type) {
    if (type === 'blank') return null;
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'square';

    if (type === 'lined') {
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.lineTo(size, size);
        ctx.stroke();
    }
    else if (type === 'grid') {
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.lineTo(size, size);
        ctx.lineTo(size, 0);
        ctx.stroke();
    }
    else if (type === 'dotted') {
        ctx.beginPath();
        ctx.arc(size/2, size/2, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    return texture;
}

export function Notebook(props) {
    const {
        format,
        coverColor, hasElastic, elasticColor,
        logoTexture, logoPosition,
        isNotebookOpen, paperPattern
    } = useConfigurator()

    const group = useRef()
    const frontCoverGroup = useRef()
    const coverMat = useRef()
    const elasticMat = useRef()

    const dims = format === 'A5' ? { w: 1.5, h: 2.1 } : { w: 1.05, h: 1.48 };
    const coverThick = 0.05;
    const paperThick = 0.25;
    const spineWidth = coverThick;

    const generatedTexture = useMemo(() => {
        const tex = createPatternTexture(paperPattern);
        if (tex) {
            const scale = format === 'A5' ? 1 : 0.7;
            tex.repeat.set(16 * scale, 24 * scale);
            tex.needsUpdate = true;
        }
        return tex;
    }, [paperPattern, format]);

    const logoMap = useTexture(logoTexture || '/vite.svg')

    useFrame((state, delta) => {
        if(coverMat.current) easing.dampC(coverMat.current.color, coverColor, 0.25, delta)
        if(elasticMat.current) easing.dampC(elasticMat.current.color, elasticColor, 0.25, delta)

        const targetRotation = isNotebookOpen ? -Math.PI * 0.98 : 0;
        if (frontCoverGroup.current) {
            easing.dampE(frontCoverGroup.current.rotation, [0, targetRotation, 0], 0.35, delta)
        }

        const targetX = isNotebookOpen ? dims.w / 2 : 0;
        easing.damp3(group.current.position, [targetX, 0, 0], 0.35, delta);
    })

    // Слои
    const zPaperCenter = (coverThick + paperThick) / 2;
    const zPaperSurface = zPaperCenter + (paperThick / 2);
    const zPattern = zPaperSurface + 0.005;

    return (
        // УБРАНЫ ВСЕ shadow свойства
        <group ref={group} {...props} dispose={null}>

            {/* ЗАДНЯЯ ЧАСТЬ */}
            <group>
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[dims.w, dims.h, coverThick]} />
                    <meshStandardMaterial ref={coverMat} color={coverColor} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0, zPaperCenter]}>
                    <boxGeometry args={[dims.w - 0.05, dims.h - 0.05, paperThick]} />
                    <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
                </mesh>
                {generatedTexture && (
                    <mesh position={[0, 0, zPattern]} rotation={[0, 0, 0]}>
                        <planeGeometry args={[dims.w - 0.15, dims.h - 0.15]} />
                        <meshBasicMaterial map={generatedTexture} transparent={true} opacity={0.4} depthWrite={false} />
                    </mesh>
                )}
            </group>

            {/* ПЕРЕДНЯЯ ЧАСТЬ */}
            <group ref={frontCoverGroup} position={[-dims.w/2, 0, paperThick + coverThick]} rotation={[0, 0, 0]}>
                <mesh position={[dims.w/2, 0, 0]}>
                    <boxGeometry args={[dims.w, dims.h, coverThick]} />
                    <meshStandardMaterial color={coverColor} roughness={0.4} />

                    {logoTexture && (
                        <Decal
                            position={[logoPosition[0] * (format === 'A6' ? 0.8 : 1), logoPosition[1], coverThick/2 + 0.001]}
                            rotation={[0, 0, 0]}
                            scale={[0.6, 0.6, 1]}
                        >
                            <meshPhysicalMaterial
                                map={logoMap}
                                transparent
                                polygonOffset
                                polygonOffsetFactor={-1}
                                roughness={0.6}
                            />
                        </Decal>
                    )}
                </mesh>

                {hasElastic && (
                    <group position={[dims.w * 0.85, 0, 0]}>
                        <mesh position={[0, 0, coverThick + 0.005]}>
                            <boxGeometry args={[0.12, dims.h + 0.02, 0.025]} />
                            <meshStandardMaterial ref={elasticMat} color={elasticColor} roughness={0.9} />
                        </mesh>
                    </group>
                )}
            </group>

            {/* КОРЕШОК */}
            <mesh position={[-dims.w/2 - spineWidth/2, 0, zPaperCenter]}>
                <boxGeometry args={[spineWidth, dims.h, paperThick + coverThick*2]} />
                <meshStandardMaterial color={coverColor} roughness={0.4} />
            </mesh>

        </group>
    )
}