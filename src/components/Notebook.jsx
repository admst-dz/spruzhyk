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
    ctx.strokeStyle = '#000000'; ctx.fillStyle = '#000000';
    ctx.lineWidth = 4; ctx.lineCap = 'square';
    if (type === 'lined') { ctx.beginPath(); ctx.moveTo(0, size); ctx.lineTo(size, size); ctx.stroke(); }
    else if (type === 'grid') { ctx.beginPath(); ctx.moveTo(0, size); ctx.lineTo(size, size); ctx.lineTo(size, 0); ctx.stroke(); }
    else if (type === 'dotted') { ctx.beginPath(); ctx.arc(size/2, size/2, 5, 0, 2 * Math.PI); ctx.fill(); }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 16;
    return texture;
}

export function Notebook(props) {
    const {
        format, bindingType,
        coverColor, hasElastic, elasticColor, spiralColor,
        logoTexture, logoPosition,
        isNotebookOpen, paperPattern
    } = useConfigurator()

    const group = useRef()
    const frontCoverGroup = useRef()
    const coverMat = useRef()
    const elasticMat = useRef()
    const spiralMat = useRef()

    // РАЗМЕРЫ
    const dims = format === 'A5' ? { w: 1.5, h: 2.1 } : { w: 1.05, h: 1.48 };

    // Толщина материалов
    const coverThick = bindingType === 'spiral' ? 0.03 : 0.05;
    const paperThick = 0.25; // Толщина всего блока

    // ПРУЖИНА
    const spiralCount = format === 'A5' ? 24 : 16;
    const spiralPitch = dims.h / (spiralCount + 1);
    const holeOffset = 0.12;
    const holeDiameter = 0.022;

    // Радиус кольца: должен быть чуть больше половины толщины всего "бутерброда"
    // (Обложка + Бумага + Обложка) / 2 + Запас
    const totalThickness = coverThick + paperThick + coverThick;
    const spiralRingRadius = (totalThickness / 2) + 0.04;

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
        if(spiralMat.current) easing.dampC(spiralMat.current.color, spiralColor === '#Silver' ? '#CCCCCC' : spiralColor, 0.25, delta)

        const targetRotation = isNotebookOpen ? -Math.PI * 0.98 : 0;
        if (frontCoverGroup.current) {
            easing.dampE(frontCoverGroup.current.rotation, [0, targetRotation, 0], 0.35, delta)
        }

        const centerOffset = isNotebookOpen ? (bindingType === 'spiral' ? 0.15 : 0) : 0;
        const targetX = (isNotebookOpen ? dims.w / 2 : 0) + centerOffset;
        easing.damp3(group.current.position, [targetX, 0, 0], 0.35, delta);
    })

    // Z-координаты слоев
    const zPaperCenter = (coverThick + paperThick) / 2;
    const zPaperSurface = zPaperCenter + (paperThick/2);
    const zPattern = zPaperSurface + 0.005;

    return (
        <group ref={group} {...props} dispose={null}>

            {/* === 1. ЗАДНЯЯ ЧАСТЬ === */}
            <group>
                {/* Задняя обложка */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[dims.w, dims.h, coverThick]} />
                    <meshStandardMaterial ref={coverMat} color={coverColor} roughness={0.4} />
                </mesh>

                {/* Бумага */}
                <mesh position={[bindingType === 'spiral' ? holeOffset/1.2 : 0, 0, zPaperCenter]}>
                    <boxGeometry args={[dims.w - (bindingType==='spiral' ? holeOffset : 0.05), dims.h - 0.05, paperThick]} />
                    <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
                </mesh>

                {/* Линовка */}
                {generatedTexture && (
                    <mesh position={[bindingType === 'spiral' ? holeOffset/1.2 : 0, 0, zPattern]} rotation={[0, 0, 0]}>
                        <planeGeometry args={[dims.w - 0.25, dims.h - 0.15]} />
                        <meshBasicMaterial map={generatedTexture} transparent={true} opacity={0.4} depthWrite={false} />
                    </mesh>
                )}

                {/* ДЫРКИ НА ЗАДНЕЙ ОБЛОЖКЕ + БУМАГЕ */}
                {/* Рисуем длинные черные цилиндры, которые проходят насквозь */}
                {bindingType === 'spiral' && Array.from({ length: spiralCount }).map((_, i) => (
                    <mesh key={i} position={[-dims.w/2 + holeOffset/2, (i - (spiralCount-1)/2) * spiralPitch, zPaperCenter]} rotation={[Math.PI/2, 0, 0]}>
                        <cylinderGeometry args={[holeDiameter, holeDiameter, totalThickness + 0.05, 16]} />
                        <meshBasicMaterial color="#111111" />
                    </mesh>
                ))}
            </group>


            {/* === 2. ПЕРЕДНЯЯ ЧАСТЬ (Вращается) === */}
            <group
                ref={frontCoverGroup}
                // Ось вращения для спирали - центр отверстий
                position={bindingType === 'spiral' ? [-dims.w/2 + holeOffset/2, 0, zPaperCenter + paperThick/2] : [-dims.w/2, 0, paperThick + coverThick]}
                rotation={[0, 0, 0]}
            >
                <group position={[dims.w/2 - (bindingType==='spiral' ? holeOffset/2 : 0), 0, bindingType==='spiral' ? coverThick/2 + 0.01 : 0]}>

                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[dims.w, dims.h, coverThick]} />
                        <meshStandardMaterial color={coverColor} roughness={0.4} />
                        {logoTexture && (
                            <Decal position={[logoPosition[0], logoPosition[1], coverThick/2+0.001]} rotation={[0,0,0]} scale={[0.6,0.6,1]}>
                                <meshPhysicalMaterial map={logoMap} transparent polygonOffset polygonOffsetFactor={-1} roughness={0.6}/>
                            </Decal>
                        )}
                    </mesh>

                    {/* Дырки в передней обложке (для визуализации при открытии) */}
                    {bindingType === 'spiral' && Array.from({ length: spiralCount }).map((_, i) => (
                        <mesh key={i} position={[-dims.w/2 + holeOffset/2, (i - (spiralCount-1)/2) * spiralPitch, 0]} rotation={[Math.PI/2, 0, 0]}>
                            <cylinderGeometry args={[holeDiameter, holeDiameter, coverThick + 0.02, 16]} />
                            <meshBasicMaterial color="#111111" />
                        </mesh>
                    ))}

                    {hasElastic && (
                        <mesh position={[dims.w/2 - 0.1, 0, coverThick + 0.005]}>
                            <boxGeometry args={[0.12, dims.h + 0.02, 0.025]} />
                            <meshStandardMaterial ref={elasticMat} color={elasticColor} roughness={0.9} />
                        </mesh>
                    )}
                </group>
            </group>


            {/* === 3. КОРЕШОК / ПРУЖИНА === */}

            {bindingType === 'hard' ? (
                // ТВЕРДЫЙ ПЕРЕПЛЕТ (Сплошной)
                <mesh position={[-dims.w/2 - coverThick/2, 0, zPaperCenter]}>
                    <boxGeometry args={[coverThick, dims.h, paperThick + coverThick*2]} />
                    <meshStandardMaterial color={coverColor} roughness={0.4} />
                </mesh>
            ) : (
                // ПРУЖИНА (WIRE-O)
                // УБРАЛИ лишнюю геометрию сзади. Остались только кольца.
                <group position={[-dims.w/2 + holeOffset/2, 0, zPaperCenter]}>
                    {Array.from({ length: spiralCount }).map((_, i) => (
                        <mesh
                            key={i}
                            position={[0, (i - (spiralCount-1)/2) * spiralPitch, 0]}
                            // Кольца строго перпендикулярны (параллельны основанию)
                            rotation={[Math.PI/2, 0, 0]}
                        >
                            {/* radius = spiralRingRadius, tube = 0.015 (толщина проволоки) */}
                            <torusGeometry args={[spiralRingRadius, 0.015, 12, 32]} />
                            <meshStandardMaterial
                                ref={spiralMat}
                                color={spiralColor === '#Silver' ? '#CCCCCC' : spiralColor}
                                metalness={0.5}
                                roughness={0.4}
                            />
                        </mesh>
                    ))}
                </group>
            )}

        </group>
    )
}