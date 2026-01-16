import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useConfigurator } from '../store'
import { Decal, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// --- 1. ГЕНЕРАТОР УЗОРОВ (Canvas) ---
function createPatternTexture(type) {
    // Если "пустой" - возвращаем null
    if (type === 'blank') return null;

    const size = 128; // Увеличил разрешение для четкости
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Прозрачный фон
    ctx.clearRect(0, 0, size, size);

    // Настройки линий: черные, толстые, четкие
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'square';

    if (type === 'lined') {
        // Линейка (линия внизу)
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.lineTo(size, size);
        ctx.stroke();
    }
    else if (type === 'grid') {
        // Клетка (буква L в углу)
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.lineTo(size, size);
        ctx.lineTo(size, 0);
        ctx.stroke();
    }
    else if (type === 'dotted') {
        // Точка (круг по центру)
        ctx.beginPath();
        ctx.arc(size/2, size/2, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Anisotropy делает линии четкими под углом
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

    // --- РАЗМЕРЫ ---
    const dims = format === 'A5'
        ? { w: 1.5, h: 2.1 }
        : { w: 1.05, h: 1.48 };

    const coverThick = 0.05;
    const paperThick = 0.25;
    const spineWidth = coverThick;

    // --- СОЗДАНИЕ ТЕКСТУРЫ ---
    const generatedTexture = useMemo(() => {
        const tex = createPatternTexture(paperPattern);
        if (tex) {
            // Настраиваем частоту повторения
            // A5 = 2.1 высотой, A6 = 1.48. Масштабируем сетку.
            const scale = format === 'A5' ? 1 : 0.7;
            tex.repeat.set(16 * scale, 24 * scale);
            tex.needsUpdate = true;
        }
        return tex;
    }, [paperPattern, format]);

    // Логотип
    const logoMap = useTexture(logoTexture || '/vite.svg')

    // --- АНИМАЦИЯ ---
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

    // Координаты слоев по оси Z (снизу вверх)
    // Z=0 - Центр задней обложки
    const zCover = 0;
    // Центр бумаги = Половина толщины обложки + Половина толщины бумаги
    const zPaperCenter = (coverThick + paperThick) / 2;
    // Поверхность бумаги = Центр бумаги + Половина толщины бумаги
    const zPaperSurface = zPaperCenter + (paperThick / 2);
    // Слой узора = Поверхность бумаги + Чуть-чуть (0.005)
    const zPattern = zPaperSurface + 0.005;


    return (
        <group ref={group} {...props} dispose={null}>

            {/* === НИЖНЯЯ ЧАСТЬ === */}
            <group>
                {/* Обложка */}
                <mesh position={[0, 0, zCover]}>
                    <boxGeometry args={[dims.w, dims.h, coverThick]} />
                    <meshStandardMaterial ref={coverMat} color={coverColor} roughness={0.4} />
                </mesh>

                {/* Блок Бумаги */}
                <mesh position={[0, 0, zPaperCenter]}>
                    <boxGeometry args={[dims.w - 0.05, dims.h - 0.05, paperThick]} />
                    <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
                </mesh>

                {/* === СЛОЙ С РИСУНКОМ (ИСПРАВЛЕННАЯ ПОЗИЦИЯ) === */}
                {generatedTexture && (
                    <mesh
                        // Теперь позиция расчитана математически точно поверх бумаги
                        position={[0, 0, zPattern]}
                        rotation={[0, 0, 0]}
                    >
                        {/* Отступ от краев листа */}
                        <planeGeometry args={[dims.w - 0.15, dims.h - 0.15]} />
                        <meshBasicMaterial
                            map={generatedTexture}
                            transparent={true}
                            opacity={0.4} // Прозрачность, чтобы линии были нежно-серыми, а не угольно-черными
                            depthWrite={false} // Важно: предотвращает визуальные артефакты (z-fighting)
                        />
                    </mesh>
                )}
            </group>


            {/* === ВЕРХНЯЯ ЧАСТЬ (ОБЛОЖКА) === */}
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