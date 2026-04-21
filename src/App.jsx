import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Interface } from './components/Interface'
import { Home } from './components/Home'
import { Order } from './components/Order'
import { DealerDashboard } from './components/DealerDashboard'
import { AuthModal } from './components/AuthModal'
import { ClientDashboard } from './components/ClientDashboard' // ПРОВЕРЬТЕ ЭТОТ ИМПОРТ
import { useConfigurator } from './store'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, getUserRole } from './firebase'
import { Sketchbook } from './components/Sketchbook'
import { SketchbookInterface } from './components/SketchbookInterface'

function App() {
    const [screen, setScreen] = useState('home');
    const [showAuth, setShowAuth] = useState(false);
    const [pendingSuccessToast, setPendingSuccessToast] = useState(false);

    const {
        activeProduct,
        setCurrentUser,
        setUserRole,
        setAuthLoading,
        currentUser,
        userRole,
        logout,
        theme
    } = useConfigurator();

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    // --- ЛОГИКА: ПРОВЕРКА РОЛИ И РОУТИНГ ---
    useEffect(() => {
        if (userRole === 'dealer') {
            setScreen('dealer');
        } else if (userRole === 'client') {
            setScreen('client_dashboard'); // <--- ВАЖНО: Роут для клиента
        } else if (!userRole && (screen === 'dealer' || screen === 'client_dashboard')) {
            setScreen('home');
        }
    }, [userRole, screen]);

    // ... остальной код (без изменений с прошлого рабочего варианта)

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


            {/* --- ЭКРАН: ГЛАВНАЯ СТРАНИЦА --- */}
            {screen === 'home' && (
                <Home
                    onStart={() => setScreen('configurator')}
                    onAuth={() => setShowAuth(true)}
                    user={currentUser}
                    logout={logout}
                />
            )}


            {/* --- ЭКРАН: КОРЗИНА ГОСТЯ --- */}
            {/* Доступно только для незарегистрированных пользователей */}
            {screen === 'order' && (
                <Order
                    onBack={() => setScreen('configurator')}
                    onSuccess={() => {
                        setPendingSuccessToast(true);
                        setShowAuth(true);
                    }}
                />
            )}


            {/* --- ЭКРАН: КАБИНЕТ ДИЛЕРА --- */}
            {screen === 'dealer' && (
                <DealerDashboard onBack={() => setScreen('home')} />
            )}


            {/* --- ЭКРАН: УМНЫЙ ДАШБОРД КЛИЕНТА (ПЛ, ПКЛ, КЛ) --- */}
            {screen === 'client_dashboard' && (
                <ClientDashboard
                    onOpenConfigurator={() => setScreen('configurator')}
                    onBack={() => setScreen('home')}
                    showSuccessToast={pendingSuccessToast}
                    onSuccessToastShown={() => setPendingSuccessToast(false)}
                />
            )}


            {/* --- ЭКРАН: 3D КОНСТРУКТОР --- */}
            {screen === 'configurator' && (
                <div className="fixed inset-0 w-full h-full bg-[#E5E5E5] dark:bg-[#080B13] overflow-hidden font-sans flex flex-col md:block transition-colors duration-300">

                    <button
                        onClick={() => setScreen(currentUser ? (userRole === 'dealer' ? 'dealer' : 'client_dashboard') : 'home')}
                        className="absolute top-6 left-6 z-50 px-6 py-2 bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-full shadow-lg dark:shadow-none text-sm font-bold text-black dark:text-white hover:bg-white dark:hover:bg-white/10 font-zen active:scale-95 transition-all border border-black/10 dark:border-white/10"
                    >
                        ← {currentUser ? 'В Кабинет' : 'В Меню'}
                    </button>

                    {activeProduct === 'calendar' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center font-zen bg-[#E5E5E5] dark:bg-[#080B13] select-none transition-colors duration-300">
                            <h1 className="text-4xl md:text-8xl font-black tracking-[0.1em] uppercase text-center px-4 text-[#cfcfcf] dark:text-white/10"
                                style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.5), -1px -1px 0px rgba(0,0,0,0.1)' }}
                            >
                                В Разработке
                            </h1>
                            <p className="mt-8 font-bold uppercase tracking-[0.2em] text-xs md:text-sm text-center text-black/60 dark:text-white/30">
                                Раздел "Настольный календарь" скоро появится
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full h-[45%] md:absolute md:inset-0 md:w-[75%] md:h-full bg-[#dcdcdc] dark:bg-[#0A0E1A] md:bg-transparent dark:md:bg-transparent">
                                <Canvas
                                    shadows
                                    dpr={[1, 2]} // Адаптация под ретину (Safari/iPhone)
                                    camera={{ position: [0, 0, 4.5], fov: 45 }}
                                    gl={{
                                        antialias: true,
                                        preserveDrawingBuffer: true,
                                        logarithmicDepthBuffer: true // Важно для устранения z-fighting в Safari
                                    }}
                                >
                                    <Experience />
                                </Canvas>
                            </div>

                            <div className="relative h-[55%] w-full z-10 md:absolute md:top-0 md:right-0 md:h-full md:w-[30%] pointer-events-none md:p-4 md:flex md:flex-col md:justify-center">
                                <Interface
                                    // Кнопка "В Корзину": Гостей кидаем в Order, Авторизованных - в их Dashboard (вкладка согласования)
                                    onFinish={() => setScreen(currentUser ? 'client_dashboard' : 'order')}
                                    onAuth={() => setShowAuth(true)}
                                    user={currentUser}
                                    logout={logout}
                                />
                            </div>
                        </>
                    )}

                </div>
            )}

            {/* --- ЭКРАН: КОНСТРУКТОР БЛОКНОТА --- */}
            {screen === 'sketchbook_configurator' && (
                <div className="fixed inset-0 w-full h-full bg-[#E5E5E5] dark:bg-[#080B13] overflow-hidden font-sans flex flex-col md:block transition-colors duration-300">
                    <button onClick={() => setScreen('home')} className="absolute top-6 left-6 z-50 px-6 py-2 bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-full shadow-lg dark:shadow-none text-sm font-bold text-black dark:text-white hover:bg-white dark:hover:bg-white/10 font-zen active:scale-95 transition-all border border-black/10 dark:border-white/10">
                        ← В Меню
                    </button>
                    <>
                        <div className="relative w-full h-[45%] md:absolute md:inset-0 md:w-[75%] md:h-full bg-[#dcdcdc] dark:bg-[#0A0E1A] md:bg-transparent dark:md:bg-transparent">
                            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true }}>
                                {/* Освещение и контролы */}
                                <ambientLight intensity={0.6} />
                                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                                <directionalLight position={[-10, 5, 2]} intensity={0.5} />
                                <Experience /> {/* В Experience.jsx нужно добавить логику для Sketchbook */}
                            </Canvas>
                        </div>
                        <div className="relative h-[55%] w-full z-10 md:absolute md:top-0 md:right-0 md:h-full md:w-[30%] pointer-events-none md:p-4 md:flex md:flex-col md:justify-center">
                            {/* НОВЫЙ ИНТЕРФЕЙС БЛОКНОТА */}
                            <SketchbookInterface onFinish={() => setScreen(currentUser ? 'client_dashboard' : 'order')} />
                        </div>
                    </>
                </div>
            )}
        </>
    )
}

export default App