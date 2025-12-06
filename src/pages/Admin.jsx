import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { storage } from '../firebase';


const Admin = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [queries, setQueries] = useState([]);
    const navigate = useNavigate();

    // Product Form State
    const [product, setProduct] = useState({
        name: '',
        price: '',
        category: 'Premium Chiffon',
        featured: false,
        bestSelling: false,
        shortDescription: '',
        image: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                navigate('/login');
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'queries' && user) {
            fetchQueries();
        }
    }, [activeTab, user]);

    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (activeTab === 'products' && user) {
            fetchProducts();
        }
    }, [activeTab, user]);

    const fetchProducts = async () => {
        try {
            const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchQueries = async () => {
        try {
            const q = query(collection(db, "queries"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const queriesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setQueries(queriesData);
        } catch (error) {
            console.error("Error fetching queries:", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /*
    // Future Firebase Storage Logic
    // const handleImageUpload = async (file) => {
    //     if (!file) return null;
    //     try {
    //         const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    //         const snapshot = await uploadBytes(storageRef, file);
    //         const url = await getDownloadURL(snapshot.ref);
    //         return url;
    //     } catch (error) {
    //         console.error("Error uploading image: ", error);
    //         throw error;
    //     }
    // };
    */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            if (editingId) {
                const productRef = doc(db, "products", editingId);
                await updateDoc(productRef, {
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    featured: product.featured,
                    bestSelling: product.bestSelling,
                    shortDescription: product.shortDescription,
                    image: product.image
                });
                alert('Product updated successfully!');
                setEditingId(null);
            } else {
                await addDoc(collection(db, "products"), {
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    featured: product.featured,
                    bestSelling: product.bestSelling,
                    shortDescription: product.shortDescription,
                    image: product.image,
                    createdAt: new Date()
                });
                alert('Product added successfully!');
            }

            setProduct({
                name: '',
                price: '',
                category: 'Premium Chiffon',
                featured: false,
                bestSelling: false,
                shortDescription: '',
                image: ''
            });
            fetchProducts(); // Refresh list
        } catch (error) {
            console.error("Error saving product: ", error);
            alert('Error saving product');
        }
        setUploading(false);
    };

    const handleEdit = (product) => {
        setProduct({
            name: product.name,
            price: product.price,
            category: product.category,
            featured: product.featured,
            bestSelling: product.bestSelling || false,
            shortDescription: product.shortDescription || '',
            image: product.image
        });
        setEditingId(product.id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteDoc(doc(db, "products", id));
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product");
            }
        }
    };

    const handleToggleFeatured = async (product) => {
        try {
            const productRef = doc(db, "products", product.id);
            await updateDoc(productRef, {
                featured: !product.featured
            });
            setProducts(products.map(p =>
                p.id === product.id ? { ...p, featured: !p.featured } : p
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const handleToggleBestSelling = async (product) => {
        try {
            const productRef = doc(db, "products", product.id);
            await updateDoc(productRef, {
                bestSelling: !product.bestSelling
            });
            setProducts(products.map(p =>
                p.id === product.id ? { ...p, bestSelling: !p.bestSelling } : p
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const handleResolve = async (queryId) => {
        try {
            const queryRef = doc(db, "queries", queryId);
            await updateDoc(queryRef, {
                status: 'resolved'
            });
            // Update local state
            setQueries(queries.map(q =>
                q.id === queryId ? { ...q, status: 'resolved' } : q
            ));
        } catch (error) {
            console.error("Error resolving query:", error);
            alert("Failed to update status");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'products'
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Add Products
                    </button>
                    <button
                        onClick={() => setActiveTab('queries')}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'queries'
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Customer Queries
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    {activeTab === 'products' ? (
                        <>
                            <h2 className="text-xl font-semibold mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={product.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={product.price}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        value={product.category}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option>Premium Chiffon</option>
                                        <option>Luxury Silk</option>
                                        <option>Everyday Jersey</option>
                                        <option>Niqab</option>
                                        <option>Chador</option>
                                        <option>Abaya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Short Description</label>
                                    <textarea
                                        name="shortDescription"
                                        value={product.shortDescription}
                                        onChange={handleChange}
                                        rows="3"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="Brief description of the product..."
                                    />
                                </div>

                                <div className="flex space-x-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={product.featured}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Featured Product</label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={product.image}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                    {product.image && (
                                        <div className="mt-2 h-20 w-20 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                            <img src={product.image} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                    )}

                                    {/* 
                                    // Future File Upload Input
                                    <input 
                                        type="file" 
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setUploading(true);
                                                try {
                                                    const url = await handleImageUpload(file);
                                                    setProduct(prev => ({ ...prev, image: url }));
                                                    alert('Image uploaded successfully!');
                                                } catch (error) {
                                                    alert('Upload failed');
                                                }
                                                setUploading(false);
                                            }
                                        }}
                                    /> 
                                    */}
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${uploading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}
                                >
                                    {uploading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                                </button>
                            </form>

                            <div className="mt-12">
                                <h3 className="text-xl font-semibold mb-6">Product List</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Selling</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {products.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                <img className="h-10 w-10 rounded-full object-cover" src={p.image} alt="" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                                <div className="text-sm text-gray-500">₹{p.price}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {p.category}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleToggleFeatured(p)}
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.featured
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                        >
                                                            {p.featured ? 'Featured' : 'Standard'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleToggleBestSelling(p)}
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.bestSelling
                                                                ? 'bg-gold-100 text-gold-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                        >
                                                            {p.bestSelling ? 'Best Selling' : 'Standard'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                        <button
                                                            onClick={() => handleEdit(p)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {products.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                        No products found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Customer Queries</h2>
                                <button
                                    onClick={fetchQueries}
                                    className="text-sm text-gold-600 hover:text-gold-700 underline"
                                >
                                    Refresh
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product / Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {queries.map((query) => (
                                            <tr key={query.id} className={query.status === 'resolved' ? 'bg-gray-50' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {query.createdAt?.toDate ? query.createdAt.toDate().toLocaleDateString('en-GB') : 'Just now'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {query.type === 'general' ? (
                                                        <div>
                                                            <div className="flex items-center mb-1">
                                                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded mr-2">General Inquiry</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 line-clamp-2 max-w-xs" title={query.message}>{query.message}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                <img className="h-10 w-10 rounded-full object-cover" src={query.productImage} alt="" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{query.productName}</div>
                                                                <div className="text-sm text-gray-500">₹{query.productPrice}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{query.customerName || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {query.phoneNumber ? (
                                                            <span>{query.phoneNumber}</span>
                                                        ) : (
                                                            <a href={`mailto:${query.email}`} className="text-indigo-600 hover:text-indigo-900">{query.email}</a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${query.status === 'resolved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {query.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                    {query.phoneNumber && (
                                                        <a
                                                            href={`tel:${query.phoneNumber}`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Call
                                                        </a>
                                                    )}
                                                    {query.email && (
                                                        <a
                                                            href={`mailto:${query.email}`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Email
                                                        </a>
                                                    )}
                                                    {query.status !== 'resolved' && (
                                                        <button
                                                            onClick={() => handleResolve(query.id)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Resolve
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {queries.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                    No queries found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Admin;
