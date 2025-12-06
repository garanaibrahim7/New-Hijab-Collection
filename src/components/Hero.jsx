import React from 'react';
import bannerImage from '../assets/banner1.jpg';

import mobileBannerImage from '../assets/mobile_banner.jpg';

const Hero = () => {
    return (
        <section id="home" className="relative h-screen w-full overflow-hidden">
            {/* Banner Image */}
            <div className="absolute inset-0">
                <picture className="w-full h-full block">
                    <source media="(max-width: 768px)" srcSet={mobileBannerImage} />
                    <img
                        src={bannerImage}
                        alt="Elegant Hijab Fashion"
                        className="w-full h-full object-cover object-center"
                    />
                </picture>
                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center md:justify-end md:pr-20">
                <div className="text-center text-white p-6 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tighter animate-fade-in-up drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                        <span className="text-gold-400 font-serif italic drop-shadow-md">Modesty</span>
                        {' '}and {' '}
                        <span className="text-gold-400 font-serif italic drop-shadow-md">Faith</span>
                    </h1>
                    <p className="text-xl md:text-2xl lg:text-3xl font-light tracking-wide mb-10 animate-fade-in-up delay-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-gray-100">
                        Discover the timeless beauty of Islamic Womenware
                    </p>
                    <a
                        href="#collection"
                        className="group relative inline-flex items-center justify-center px-10 py-4 overflow-hidden font-medium tracking-tighter text-white bg-gold-600 rounded-full hover:bg-gold-500 transition-all duration-300 ease-out shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] hover:shadow-gold-500/50"
                    >
                        <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                        <span className="relative uppercase tracking-widest text-sm font-bold drop-shadow-sm">Shop Collection</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
