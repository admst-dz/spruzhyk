import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Interface } from './components/Interface'
import { Home } from './components/Home'
import { Order } from './components/Order'
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

            {/* 2. ЗАКАЗ */}
            {screen === 'order' && (
                <Order onBack={() => setScreen('configurator')} />
            )}

            {/* 3. КОНСТРУКТОР */}
            {screen === 'configurator' && (
                <div className="fixed inset-0 w-full h-full bg-[#E5E5E5] overflow-hidden font-sans flex flex-col md:block">

                    {/* Кнопка "В Меню" - ТЕКСТ ЧЕРНЫЙ */}
                    <button
                        onClick={() => setScreen('home')}
                        className="absolute top-6 left-6 z-50 px-6 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-sm font-bold text-black hover:bg-white font-zen active:scale-95 transition-all border border-black/10"
                    >
                        ← В Меню
                    </button>

                    {activeProduct === 'calendar' ? (
                        /* === СТРАНИЦА "В РАЗРАБОТКЕ" === */
                        <div className="w-full h-full flex flex-col items-center justify-center font-zen bg-[#E5E5E5] select-none">
                            <h1 className="text-4xl md:text-8xl font-black tracking-[0.1em] uppercase text-center px-4 text-[#0f0f0f]"
                                style={{ textShadow: '2px 2px 0px #ffffff, -1px -1px 0px rgba(0,0,0,0.1)' }}
                            >
                                В Разработке
                            </h1>
                            <p className="mt-8 text-black font-bold uppercase tracking-[0.2em] text-xs md:text-sm text-center opacity-60">
                                Раздел "Настольный календарь" скоро появится
                            </p>
                        </div>
                    ) : (
                        /* === ЕЖЕДНЕВНИК (Сцена + Интерфейс) === */
                        <>
                            <div className="relative w-full h-[45%] md:absolute md:inset-0 md:w-[75%] md:h-full bg-[#dcdcdc] md:bg-transparent">
                                <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                                    <Experience />
                                </Canvas>
                            </div>

                            <div className="relative h-[55%] w-full z-10 md:absolute md:top-0 md:right-0 md:h-full md:w-[30%] pointer-events-none md:p-4 md:flex md:flex-col md:justify-center">
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