import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts, fetchBestSellingProducts } from '../data/products';

const Collection = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);

    useEffect(() => {
        const loadProducts = async () => {
            const featured = await fetchFeaturedProducts();
            setFeaturedProducts(featured);
            const bestSelling = await fetchBestSellingProducts();
            setBestSellingProducts(bestSelling);
        };
        loadProducts();
    }, []);

    return (
        <section id="collection" className="py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Featured Collection */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-widest">
                            Our <span className="text-gold-500 font-serif italic">Collection</span>
                        </h2>
                        <div className="w-24 h-1 bg-gold-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="relative overflow-hidden aspect-[3/4]">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                                        <Link to={`/product/${product.id}`} className="bg-white text-black px-8 py-3 rounded-full uppercase text-sm font-bold hover:bg-gold-500 hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 inline-block">
                                            View Details
                                        </Link>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        New
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-lg font-medium mb-2 text-gray-800 group-hover:text-gold-600 transition-colors">{product.name}</h3>
                                    <p className="text-gold-600 font-bold text-xl">₹{product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Selling Collection */}
                <div id="best-selling" className="scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-widest">
                            Best Selling <span className="text-gold-500 font-serif italic">Collection</span>
                        </h2>
                        <div className="w-24 h-1 bg-gold-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
                        {bestSellingProducts.map((product) => (
                            <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="relative overflow-hidden aspect-[3/4]">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                                        <Link to={`/product/${product.id}`} className="bg-white text-black px-8 py-3 rounded-full uppercase text-sm font-bold hover:bg-gold-500 hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 inline-block">
                                            View Details
                                        </Link>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gold-600">
                                        Best Selling
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-lg font-medium mb-2 text-gray-800 group-hover:text-gold-600 transition-colors">{product.name}</h3>
                                    <p className="text-gold-600 font-bold text-xl">₹{product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-16">
                    <Link to="/products" className="inline-block px-10 py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest text-sm font-semibold rounded-full">
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Collection;
