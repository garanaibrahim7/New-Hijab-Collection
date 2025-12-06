import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e, item) => {
        e.preventDefault();
        const targetId = item.toLowerCase().replace(' ', '-');
        setIsOpen(false); // Close menu immediately

        if (isHome) {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/');
            // Add a delay to allow navigation to complete before scrolling
            setTimeout(() => {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                } else if (targetId === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 300);
        }
    };

    return (
        <>
            <header
                className={`fixed w-full z-50 transition-all duration-300 ${scrolled || !isHome || isOpen ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-6'
                    }`}
            >
                <div className="container mx-auto px-6 flex justify-between items-center relative z-50">
                    <Link to="/" className={`text-2xl font-bold tracking-widest uppercase transition-colors duration-300 ${scrolled || !isHome || isOpen ? 'text-black' : 'text-white'}`}>
                        New {' '}
                        <span className="text-gold-500">Hijab</span>
                        {' '}
                        Collection
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-10">
                        {['Home', 'Collection', 'Best Selling', 'Contact'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                onClick={(e) => handleNavClick(e, item)}
                                className={`font-medium uppercase text-sm tracking-wide transition-colors duration-300 hover:text-gold-500 ${scrolled || !isHome ? 'text-gray-800' : 'text-white/90 hover:text-white'
                                    }`}
                            >
                                {item}
                            </a>
                        ))}
                        <Link
                            to="/products"
                            className={`font-medium uppercase text-sm tracking-wide transition-colors duration-300 hover:text-gold-500 ${scrolled || !isHome ? 'text-gray-800' : 'text-white/90 hover:text-white'
                                }`}
                        >
                            All Products
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className={`md:hidden focus:outline-none transition-colors duration-300 ${scrolled || !isHome || isOpen ? 'text-black' : 'text-white'}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Nav */}
            <div
                className={`md:hidden fixed inset-0 z-[100] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ backgroundColor: '#ffffff' }}
            >
                <button
                    className="absolute top-6 right-6 text-black focus:outline-none"
                    onClick={() => setIsOpen(false)}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex flex-col h-full justify-center items-center space-y-8 bg-white">
                    {['Home', 'Collection', 'Best Selling', 'Contact'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(' ', '-')}`}
                            className="text-2xl font-bold text-gray-900 hover:text-gold-500 uppercase tracking-widest transition-colors"
                            onClick={(e) => handleNavClick(e, item)}
                        >
                            {item}
                        </a>
                    ))}
                    <Link
                        to="/products"
                        className="text-2xl font-bold text-gray-900 hover:text-gold-500 uppercase tracking-widest transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        All Products
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Header;
