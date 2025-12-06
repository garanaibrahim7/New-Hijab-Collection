import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../data/products';
import ContactModal from '../components/ContactModal';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadProduct = async () => {
            const data = await fetchProductById(id);
            setProduct(data);
            setLoading(false);
        };
        loadProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <Link to="/" className="text-gold-600 hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-16">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Image Section */}
                        <div className="relative aspect-[3/4] md:aspect-auto md:h-[600px]">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Details Section */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 bg-gold-100 text-gold-800 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                                    {product.category}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <p className="text-2xl text-gold-600 font-bold">₹{product.price}</p>
                            </div>

                            <div className="prose text-gray-600 mb-8">
                                {product.shortDescription && (
                                    <p className="mb-4 font-medium text-gray-800">
                                        {product.shortDescription}
                                    </p>
                                )}
                                <p>
                                    Experience Beauty of Islam with our {product.name}. Crafted from the finest materials,
                                    this hijab offers both elegance and comfort for any occasion.
                                    Perfect for daily wear or special events.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full bg-black text-white py-4 rounded-full uppercase font-bold tracking-widest hover:bg-gold-600 transition-colors"
                                >
                                    Contact for Best Prices
                                </button>
                                <Link
                                    to="/"
                                    className="block w-full text-center py-4 border border-gray-300 rounded-full uppercase font-bold tracking-widest text-gray-600 hover:border-black hover:text-black transition-colors"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={product}
            />
        </div>
    );
};

export default ProductDetails;
