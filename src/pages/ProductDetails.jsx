import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../data/products';
import ContactModal from '../components/ContactModal';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const scrollContainerRef = React.useRef(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadProduct = async () => {
            const data = await fetchProductById(id);
            setProduct(data);
            setLoading(false);
        };
        loadProduct();
    }, [id]);

    // Handle Auto-scroll
    useEffect(() => {
        if (!product?.images?.length || !isAutoScrolling) return;

        const interval = setInterval(() => {
            const nextIndex = (selectedImageIndex + 1) % product.images.length;
            scrollToImage(nextIndex);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedImageIndex, isAutoScrolling, product]);

    const scrollToImage = (index) => {
        setSelectedImageIndex(index);
        if (scrollContainerRef.current) {
            const width = scrollContainerRef.current.offsetWidth;
            scrollContainerRef.current.scrollTo({
                left: width * index,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const width = scrollContainerRef.current.offsetWidth;
            const scrollLeft = scrollContainerRef.current.scrollLeft;
            const newIndex = Math.round(scrollLeft / width);
            if (newIndex !== selectedImageIndex) {
                setSelectedImageIndex(newIndex);
            }
        }
    };

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

    // Determine images list (use single image if array not present)
    const images = product.images && product.images.length > 0 ? product.images : [product.image];

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-16">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Image Section - Carousel */}
                        <div className="flex flex-col gap-4">
                            <div
                                className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 group"
                                onMouseEnter={() => setIsAutoScrolling(false)}
                                onMouseLeave={() => setIsAutoScrolling(true)}
                                onTouchStart={() => setIsAutoScrolling(false)}
                                onTouchEnd={() => setIsAutoScrolling(true)}
                            >
                                <div
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                                    style={{ scrollBehavior: 'smooth' }}
                                >
                                    {images.map((img, idx) => (
                                        <div key={idx} className="w-full h-full flex-shrink-0 snap-center">
                                            <img
                                                src={img}
                                                alt={`${product.name} - View ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Carousel Indicators */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    scrollToImage(idx);
                                                }}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === selectedImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                                                    } shadow-sm`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => scrollToImage(idx)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all snap-start ${idx === selectedImageIndex
                                                ? 'border-black opacity-100'
                                                : 'border-transparent opacity-70 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
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
