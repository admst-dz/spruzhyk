import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Interface } from './components/Interface'
import { Home } from './components/Home'
import { useConfigurator } from './store'

function App() {
    const [screen, setScreen] = useState('home');

    return (
        <>
            {screen === 'home' && (
                <Home onStart={() => setScreen('configurator')} />
            )}

            {screen === 'configurator' && (
                // Используем fixed для мобилки, чтобы избежать скачков при скролле браузера
                <div className="fixed inset-0 w-full h-full bg-[#E5E5E5] overflow-hidden font-sans flex flex-col md:block">

                    <button
                        onClick={() => setScreen('home')}
                        className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-xs md:text-sm font-bold text-[#1a1a1a] font-zen active:scale-95 transition-transform border border-black/5"
                    >
                        ← Назад
                    </button>

                    {/* 3D СЦЕНА */}
                    {/* Mobile: 45% высоты. Desktop: 75% ширины */}
                    <div className="relative w-full h-[45%] md:absolute md:inset-0 md:w-[75%] md:h-full bg-[#dcdcdc] md:bg-transparent">
                        <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                            <Experience />
                        </Canvas>
                    </div>

                    {/* ИНТЕРФЕЙС */}
                    {/* Mobile: Занимает оставшиеся 55% высоты. Desktop: Справа */}
                    <div className="relative h-[55%] w-full z-10 md:absolute md:top-0 md:right-0 md:h-full md:w-[30%] pointer-events-none md:p-4 md:flex md:flex-col md:justify-center">
                        <Interface />
                    </div>

                </div>
            )}
        </>
    )
}

export default App