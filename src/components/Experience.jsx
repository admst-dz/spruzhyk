import { PresentationControls, Stage, Environment } from '@react-three/drei'
import { Notebook } from './Notebook'
import { Calendar } from './Calendar'
import { useConfigurator } from '../store'
import { useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber' // Импортируем хуки для доступа к камере
import { easing } from 'maath'
import { Sketchbook } from './Sketchbook'

// --- НОВЫЙ КОМПОНЕНТ: УПРАВЛЕНИЕ КАМЕРОЙ ---
// Он берет управление зумом на себя и делает это плавно
function CameraUpdater({ targetZoom }) {
    const { camera } = useThree()

    useFrame((state, delta) => {
        // Плавная интерполяция зума (damp)
        // camera.zoom меняется от текущего к targetZoom
        easing.damp(camera, 'zoom', targetZoom, 0.25, delta)

        // Обязательно обновляем матрицу камеры, иначе зум не применится визуально
        camera.updateProjectionMatrix()
    })

    return null
}

export const Experience = () => {
    const { activeProduct, zoomLevel } = useConfigurator()

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Базовый зум (начальный размер)
    // Мобилка требует зум поменьше (камера дальше), десктоп побольше.
    // Notebook побольше, Calendar поменьше.
    const baseZoom = isMobile
        ? (activeProduct === 'calendar' ? 0.6 : 0.8)
        : (activeProduct === 'calendar' ? 0.8 : 1.0);

    // Итоговый зум = База * То, что накликали кнопками
    const finalZoom = baseZoom * zoomLevel;

    return (
        <>
            {/* Вставляем наш компонент управления камерой */}
            <CameraUpdater targetZoom={finalZoom} />

            <Environment preset="city" />

            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <directionalLight position={[-10, 5, 2]} intensity={0.5} />

            <PresentationControls
                speed={1.5}
                global
                // Убираем проп zoom отсюда, так как теперь мы управляем камерой напрямую
                polar={[-0.1, Math.PI / 4]}
            >
                {/* contactShadow={false} -> Убирает тень снизу */}
                <Stage environment={null} intensity={0} contactShadow={false}>
                    {activeProduct === 'notebook' && <Notebook />}
                    {activeProduct === 'calendar' && <Calendar />}
                    {activeProduct === 'sketchbook' && <Sketchbook />}
                </Stage>
            </PresentationControls>
        </>
    )
}