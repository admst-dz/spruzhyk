import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Interface } from './components/Interface'
import { Home } from './components/Home'
import { Order } from './components/Order'
import { AuthModal } from './components/AuthModal'
import { useConfigurator } from './store'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, getUserRole } from './firebase'

function App() {
    const [screen, setScreen] = useState('home');
    const [showAuth, setShowAuth] = useState(false);

    const {
        activeProduct,
        setCurrentUser,
        setUserRole,
        setAuthLoading,
        currentUser,
        logout
    } = useConfigurator();

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
    }, []);

    // Кнопка профиля (ГЛОБАЛЬНАЯ - ТОЛЬКО ДЛЯ ГЛАВНОЙ)
    const ProfileButton = () => (
        <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
            {currentUser ? (
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-sm border border-black/5 animate-fade-in">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-black uppercase tracking-wider">
                          {currentUser.displayName || currentUser.email.split('@')[0]}
                      </span>
                    </div>
                    <button onClick={logout} className="text-xs text-red-500 font-bold hover:text-red-700 underline">
                        Выйти
                    </button>
                </div>
            ) : (
                <button onClick={() => setShowAuth(true)} className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition shadow-lg font-zen">
                    Войти
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* 1. ПОКАЗЫВАЕМ КНОПКУ ПРОФИЛЯ ТОЛЬКО НА ГЛАВНОЙ */}
            {screen === 'home' && <ProfileButton />}

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            {screen === 'home' && (
                <Home onStart={() => setScreen('configurator')} />
            )}

            {screen === 'order' && (
                <Order onBack={() => setScreen('configurator')} />
            )}

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
                                <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                                    <Experience />
                                </Canvas>
                            </div>

                            <div className="relative h-[55%] w-full z-10 md:absolute md:top-0 md:right-0 md:h-full md:w-[30%] pointer-events-none md:p-4 md:flex md:flex-col md:justify-center">
                                {/* ПЕРЕДАЕМ PROPS АВТОРИЗАЦИИ В ИНТЕРФЕЙС */}
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