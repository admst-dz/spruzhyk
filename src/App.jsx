import { useState, useEffect } from 'react' // Добавили useEffect
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Interface } from './components/Interface'
import { Home } from './components/Home'
import { Order } from './components/Order'
import { useConfigurator } from './store'
// --- ИМПОРТЫ ДЛЯ АВТОРИЗАЦИИ И ДИЛЕРА ---
import { DealerDashboard } from './components/DealerDashboard'
import { AuthModal } from './components/AuthModal'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, getUserRole } from './firebase'

function App() {
    const [screen, setScreen] = useState('home');
    // --- СОСТОЯНИЕ ДЛЯ ОКНА ВХОДА ---
    const [showAuth, setShowAuth] = useState(false);

    const {
        activeProduct,
        // --- ДАННЫЕ ЮЗЕРА ИЗ STORE ---
        setCurrentUser,
        setUserRole,
        setAuthLoading,
        currentUser,
        userRole,
        logout
    } = useConfigurator();

    // --- ЛОГИКА: ПРОВЕРКА РОЛИ И ПЕРЕНАПРАВЛЕНИЕ ДИЛЕРА ---
    useEffect(() => {
        if (userRole === 'dealer') {
            setScreen('dealer');
        } else if (screen === 'dealer' && userRole !== 'dealer') {
            setScreen('home');
        }
    }, [userRole, screen]);

    // --- ЛОГИКА: СЛУШАТЕЛЬ FIREBASE (ВОШЕЛ/ВЫШЕЛ) ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setAuthLoading(true);
            if (user) {
                const role = await getUserRole(user.uid);
                setCurrentUser(user);
                setUserRole(role || 'client');
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [setCurrentUser, setUserRole, setAuthLoading]);

    return (
        <>
            {/* --- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ --- */}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            {screen === 'home' && (
                <Home
                    onStart={() => setScreen('configurator')}
                    // Передаем пропсы для кнопки "Войти/Профиль" на главной
                    onAuth={() => setShowAuth(true)}
                    user={currentUser}
                    logout={logout}
                />
            )}

            {screen === 'order' && (
                <Order onBack={() => setScreen('configurator')} />
            )}

            {/* --- ЭКРАН КАБИНЕТА ДИЛЕРА --- */}
            {screen === 'dealer' && (
                <DealerDashboard onBack={() => setScreen('home')} />
            )}

            {/* ВАШ КОД БЕЗ ИЗМЕНЕНИЙ (добавлены только пропсы в Interface) */}
            {screen === 'configurator' && (
                <div className="fixed inset-0 w-full h-full bg-[#E5E5E5] overflow-hidden font-sans flex flex-col md:block">

                    <button
                        onClick={() => setScreen('home')}
                        className="absolute top-6 left-6 z-50 px-6 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-sm font-bold text-black hover:bg-white font-zen active:scale-95 transition-all border border-black/10"
                    >
                        ← В Меню
                    </button>

                    {activeProduct === 'calendar' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center font-zen bg-[#E5E5E5] select-none">
                            <h1 className="text-4xl md:text-8xl font-black tracking-[0.1em] uppercase text-center px-4 text-[#cfcfcf]"
                                style={{ textShadow: '2px 2px 0px #ffffff, -1px -1px 0px rgba(0,0,0,0.1)' }}
                            >
                                В Разработке
                            </h1>
                            <p className="mt-8 text-black font-bold uppercase tracking-[0.2em] text-xs md:text-sm text-center opacity-60">
                                Раздел "Настольный календарь" скоро появится
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full h-[45%] md:absolute md:inset-0 md:w-[75%] md:h-full bg-[#dcdcdc] md:bg-transparent">
                                {/* ОБНОВЛЕННЫЕ НАСТРОЙКИ РЕНДЕРА */}
                                <Canvas
                                    shadows
                                    dpr={[1, 2]} // Адаптация под ретину (Safari/iPhone)
                                    camera={{ position: [0, 0, 4.5], fov: 45 }}
                                    gl={{
                                        antialias: true,
                                        preserveDrawingBuffer: true,
                                        logarithmicDepthBuffer: true // Важно для z-fighting
                                    }}
                                >
                                    <Experience />
                                </Canvas>
                            </div>

                            <div className="relative h-[55%] w-full z-10 md:absolute md:top-0 md:right-0 md:h-full md:w-[30%] pointer-events-none md:p-4 md:flex md:flex-col md:justify-center">
                                {/* Передаем пропсы для кнопки Войти внутри сайдбара конфигуратора */}
                                <Interface
                                    onFinish={() => setScreen('order')}
                                    onAuth={() => setShowAuth(true)}
                                    user={currentUser}
                                    logout={logout}
                                />
                            </div>
                        </>
                    )}

                </div>
            )}
        </>
    )
}

export default App