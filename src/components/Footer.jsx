import React from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Footer = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = React.useState({ type: '', message: '' });
    const [submitting, setSubmitting] = React.useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await addDoc(collection(db, "queries"), {
                type: 'general',
                customerName: formData.name,
                email: formData.email,
                message: formData.message,
                status: 'pending',
                createdAt: new Date()
            });

            setStatus({ type: 'success', message: 'Thank you! We will contact you soon.' });
            setFormData({ name: '', email: '', message: '' });

            // Clear success message after 3 seconds
            setTimeout(() => {
                setStatus({ type: '', message: '' });
            }, 3000);

        } catch (error) {
            console.error("Error submitting query:", error);
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        }
        setSubmitting(false);
    };

    return (
        <footer id="contact" className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-2xl font-bold text-gold-500 mb-6 uppercase tracking-wider">Contact Us</h3>
                        <div className="space-y-4 text-gray-300">
                            <p className="flex items-center">
                                <span className="mr-3 text-gold-500">📍</span>
                                Pratapnagar Main Road, Mithi Khadi Bazar, Limbayat, Surat - 395 210
                            </p>
                            <p className="flex items-center">
                                <span className="mr-3 text-gold-500">📞</span>
                                <a href="tel:7046949205">
                                    +91 70469 49205 - Tap to Call
                                </a>
                            </p>
                            <p className="flex items-center">
                                <span className="mr-3 text-gold-500">✉️</span>
                                moingarana24@gmail.com
                            </p>
                            <a
                                href="https://wa.me/7046949205"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-4 text-green-400 hover:text-green-300 transition-colors"
                            >
                                <span className="mr-2 text-xl">💬</span> Chat on WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <h3 className="text-2xl font-bold text-gold-500 mb-6 uppercase tracking-wider">Send Message or Feedback</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {status.message && (
                                <div className={`p-3 rounded text-sm ${status.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                                    {status.message}
                                </div>
                            )}
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Name"
                                className="w-full bg-gray-800 border border-gray-700 p-3 rounded focus:outline-none focus:border-gold-500 transition-colors"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Your Email"
                                className="w-full bg-gray-800 border border-gray-700 p-3 rounded focus:outline-none focus:border-gold-500 transition-colors"
                                required
                            />
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Your Message"
                                rows="3"
                                className="w-full bg-gray-800 border border-gray-700 p-3 rounded focus:outline-none focus:border-gold-500 transition-colors"
                                required
                            ></textarea>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full font-bold py-3 px-6 rounded transition-colors uppercase tracking-wide ${submitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-gold-500 hover:bg-gold-600 text-white'
                                    }`}
                            >
                                {submitting ? 'Sending...' : 'Submit'}
                            </button>
                        </form>
                    </div>

                    {/* Map */}
                    <div className="h-64 md:h-auto rounded-lg overflow-hidden">
                        <h3 className="text-2xl font-bold text-gold-500 mb-6 uppercase tracking-wider">Our Location</h3>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d336.9122133147429!2d72.85605463430201!3d21.17759440461225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1764935131102!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Location Map"
                        ></iframe>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    <p className="mb-2">&copy; 2025 New Hijab Collection. All rights reserved.</p>
                    <div className="flex justify-center items-center space-x-4 text-xs text-gray-600">
                        <span>Owner: Moin Garana</span>
                        <span>•</span>
                        <span>Developer: <a href="https://garanaibrahim7.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gold-500 transition-colors">Ibrahim Garana</a></span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
