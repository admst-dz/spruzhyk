import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Interface } from './components/Interface'
import { Home } from './components/Home'
import { Order } from './components/Order' // <-- ИМПОРТ
import { useConfigurator } from './store'

function App() {
    const [screen, setScreen] = useState('home');
    const { activeProduct } = useConfigurator();

    return (
        <>
            {/* 1. ГЛАВНАЯ */}
            {screen === 'home' && (
                <Home onStart={() => setScreen('configurator')} />
            )}

            {/* 2. ЗАКАЗ (НОВЫЙ ЭКРАН) */}
            {screen === 'order' && (
                <Order onBack={() => setScreen('configurator')} />
            )}

            {/* 3. КОНСТРУКТОР */}
            {screen === 'configurator' && (
                <div className="fixed inset-0 w-full h-full bg-[#E5E5E5] overflow-hidden font-sans flex flex-col md:block">

                    <button
                        onClick={() => setScreen('home')}
                        className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-xs md:text-sm font-bold text-[#1a1a1a] font-zen active:scale-95 transition-transform border border-black/5"
                    >
                        ← В Меню
                    </button>

                    {activeProduct === 'calendar' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center font-zen">
                            <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a]/20 uppercase tracking-[0.5em] text-center px-4">
                                В Разработке
                            </h1>
                            <p className="mt-4 text-[#1a1a1a]/40 uppercase tracking-widest text-sm md:text-base">
                                Раздел "Настольный календарь" скоро появится
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full h-[45%] md:absolute md:inset-0 md:w-[75%] md:h-full bg-[#dcdcdc] md:bg-transparent">
                                <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                                    <Experience />
                                </Canvas>
                            </div>

                            <div className="relative h-[55%] w-full z-10 md:absolute md:top-0 md:right-0 md:h-full md:w-[30%] pointer-events-none md:p-4 md:flex md:flex-col md:justify-center">
                                {/* Передаем функцию переключения экрана в интерфейс */}
                                <Interface onFinish={() => setScreen('order')} />
                            </div>
                        </>
                    )}

                </div>
            )}
        </>
    )
}

export default App