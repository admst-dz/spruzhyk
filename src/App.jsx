import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Interface } from './components/Interface'
import { Home } from './components/Home'

function App() {
    const [screen, setScreen] = useState('home');

    return (
        <>
            {/* 1. ГЛАВНАЯ */}
            {screen === 'home' && (
                <Home onStart={() => setScreen('configurator')} />
            )}

            {/* 2. КОНСТРУКТОР */}
            {screen === 'configurator' && (
                <div className="relative w-full h-screen bg-[#E5E5E5] overflow-hidden font-sans">

                    {/* Кнопка НАЗАД */}
                    <button
                        onClick={() => setScreen('home')}
                        className="absolute top-6 left-6 z-50 px-6 py-2 bg-white rounded-full shadow-lg text-sm font-bold text-gray-800 hover:scale-105 transition-transform"
                    >
                        ← Назад
                    </button>

                    {/* 3D СЦЕНА */}
                    {/* Сдвигаем сцену немного влево (w-3/4), чтобы освободить место для широкого синего меню справа */}
                    <div className="absolute inset-0 z-0 w-full md:w-[75%]">
                        <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                            {/* Светло-серый фон сцены */}
                            <color attach="background" args={['#dcdcdc']} />
                            <Experience />
                        </Canvas>
                    </div>

                    {/* ИНТЕРФЕЙС (Плавает справа) */}
                    <div className="absolute top-0 right-0 h-full w-full md:w-[30%] pointer-events-none p-4 flex flex-col justify-center">
                        {/* Передаем управление кликами внутрь */}
                        <Interface />
                    </div>

                </div>
            )}
        </>
    )
}

export default App