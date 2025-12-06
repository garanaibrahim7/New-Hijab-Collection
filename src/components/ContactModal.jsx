import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const ContactModal = ({ isOpen, onClose, product }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addDoc(collection(db, "queries"), {
                productId: product.id,
                productName: product.name,
                productImage: product.image,
                productPrice: product.price,
                customerName: customerName,
                phoneNumber: phoneNumber,
                status: 'pending',
                createdAt: new Date()
            });
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setPhoneNumber('');
                setCustomerName('');
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Error saving query:", error);
            alert("Failed to submit query. Please try again.");
        }
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Get Best Price</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Request Sent!</h4>
                            <p className="text-gray-600">We will contact you shortly.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-lg">
                                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                                <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-gold-600 font-bold text-sm">₹{product.price}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Enter your mobile number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                    <p className="mt-2 text-xs text-gray-500">We'll call you to discuss the best price and delivery.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-3 rounded-full font-bold uppercase tracking-wider text-white transition-all ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gold-600'
                                        }`}
                                >
                                    {submitting ? 'Sending...' : 'Request Callback'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactModal;
