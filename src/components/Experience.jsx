import { PresentationControls, Stage, Environment } from '@react-three/drei'
import { Notebook } from './Notebook'
import { Calendar } from './Calendar'
import { useConfigurator } from '../store'

export const Experience = () => {
    const { activeProduct } = useConfigurator()

    return (
        <>
            <Environment preset="city" />

            {/* Освещение (так как shadows выключили, добавим света для объема) */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <directionalLight position={[-10, 5, 2]} intensity={0.5} />

            <PresentationControls
                speed={1.5}
                global
                zoom={0.7}
                polar={[-0.1, Math.PI / 4]} // Ограничение вращения по вертикали
            >
                {/* Stage сам центрирует модель */}
                <Stage environment={null} intensity={0} contactShadow={false}>
                    {activeProduct === 'notebook' && <Notebook />}
                    {activeProduct === 'calendar' && <Calendar />}
                </Stage>
            </PresentationControls>
        </>
    )
}