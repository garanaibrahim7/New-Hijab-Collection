import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProductsByCategory } from '../data/products';
const AllProducts = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadProducts = async () => {
            const data = await fetchProductsByCategory();
            setCategories(data);
            setLoading(false);
        };
        loadProducts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-2">
                            All <span className="text-gold-500 font-serif italic">Products</span>
                        </h1>
                        <p className="text-gray-500">Explore our complete collection of premium hijabs.</p>
                    </div>
                    {/* <Link
                        to="/"
                        className="mt-4 md:mt-0 px-6 py-2 border border-gray-300 rounded-full hover:border-gold-500 hover:text-gold-500 transition-colors uppercase text-sm font-bold tracking-wide"
                    >
                        ← Back to Home
                    </Link> */}
                </div>

                {/* Categories */}
                <div className="space-y-20">
                    {categories.map((category, index) => (
                        <section key={index} id={category.title.toLowerCase().replace(' ', '-')}>
                            <div className="flex items-center mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 uppercase tracking-wider mr-4">
                                    {category.title}
                                </h2>
                                <div className="flex-grow h-px bg-gray-200"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {category.products.map((product) => (
                                    <div key={product.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                                        <div className="relative overflow-hidden aspect-[3/4]">
                                            <Link to={`/product/${product.id}`}>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </Link>
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                                                <Link
                                                    to={`/product/${product.id}`}
                                                    className="bg-white text-black px-6 py-2 rounded-full uppercase text-xs font-bold hover:bg-gold-500 hover:text-white transition-colors pointer-events-auto shadow-lg"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <Link to={`/product/${product.id}`}>
                                                <h3 className="text-md font-medium text-gray-800 mb-1 hover:text-gold-600 transition-colors">{product.name}</h3>
                                            </Link>
                                            <p className="text-gold-600 font-bold">₹{product.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AllProducts;
