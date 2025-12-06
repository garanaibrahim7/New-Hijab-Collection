import React from 'react';

const Quotes = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-10 left-10 text-9xl font-serif text-gold-500">"</div>
                <div className="absolute bottom-10 right-10 text-9xl font-serif text-gold-500 rotate-180">"</div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-gray-800 leading-relaxed mb-8">
                        "Modesty (Haya) is not just an attire, it is an elegance that speaks louder than words."
                    </h2>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="h-px w-12 bg-gold-500"></div>
                        <p className="text-sm font-bold uppercase tracking-widest text-gold-600">
                            Islamic Womenware
                        </p>
                        <div className="h-px w-12 bg-gold-500"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Quotes;
