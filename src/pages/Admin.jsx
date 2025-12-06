import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';


const Admin = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [queries, setQueries] = useState([]);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    // Product Form State
    const [product, setProduct] = useState({
        name: '',
        price: '',
        category: 'Premium Chiffon',
        featured: false,
        bestSelling: false,
        shortDescription: '',
        image: '',
        images: []
    });
    const [uploading, setUploading] = useState(false);

    // Category Management State
    const [newCategory, setNewCategory] = useState('');
    const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [migrationCategory, setMigrationCategory] = useState('');
    const [productsToMigrateCount, setProductsToMigrateCount] = useState(0);

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
        if (user) {
            if (activeTab === 'queries') fetchQueries();
            if (activeTab === 'products') fetchProducts();
            fetchCategories();
        }
    }, [activeTab, user]);

    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);



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

    const fetchCategories = async () => {
        try {
            const q = query(collection(db, "categories"), orderBy("name"));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                // Seed initial categories if empty
                const initialCategories = ['Premium Chiffon', 'Luxury Silk', 'Everyday Jersey', 'Niqab', 'Chador', 'Abaya'];
                for (const cat of initialCategories) {
                    await addDoc(collection(db, "categories"), { name: cat, createdAt: new Date() });
                }
                // Re-fetch to get the IDs
                const newQ = query(collection(db, "categories"), orderBy("name"));
                const newSnapshot = await getDocs(newQ);
                const cats = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCategories(cats);

                // Set default category for form
                setProduct(prev => ({ ...prev, category: initialCategories[0] }));
            } else {
                const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCategories(cats);
                // Set default for form if not set
                if (!product.category && cats.length > 0) {
                    setProduct(prev => ({ ...prev, category: cats[0].name }));
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
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

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const uploadedUrls = await Promise.all(
                Array.from(files).map(async (file) => {
                    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    const snapshot = await uploadBytes(storageRef, file);
                    return await getDownloadURL(snapshot.ref);
                })
            );

            setProduct(prev => ({
                ...prev,
                images: [...(prev.images || []), ...uploadedUrls],
                image: prev.image || uploadedUrls[0] // Set main image if empty
            }));

        } catch (error) {
            console.error("Error uploading images: ", error);
            alert("Failed to upload images");
        }
        setUploading(false);
    };

    const handleRemoveImage = (indexToRemove) => {
        setProduct(prev => {
            const newImages = prev.images.filter((_, index) => index !== indexToRemove);
            return {
                ...prev,
                images: newImages,
                image: newImages.length > 0 ? newImages[0] : ''
            };
        });
    };

    const handleAddImageUrl = () => {
        if (product.image && !product.images.includes(product.image)) {
            setProduct(prev => ({
                ...prev,
                images: [...(prev.images || []), prev.image],
                image: '' // Clear input after adding
            }));
        }
    };

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
                    image: product.images && product.images.length > 0 ? product.images[0] : product.image,
                    images: product.images || []
                });
                alert('Product updated successfully!');
                setEditingId(null);
            } else {
                await addDoc(collection(db, "products"), {
                    name: product.name,
                    price: product.price,
                    category: product.category || (categories[0]?.name),
                    featured: product.featured,
                    bestSelling: product.bestSelling,
                    shortDescription: product.shortDescription,
                    image: product.images && product.images.length > 0 ? product.images[0] : product.image,
                    images: product.images || [],
                    createdAt: new Date()
                });
                alert('Product added successfully!');
            }

            setProduct({
                name: '',
                price: '',
                category: categories[0]?.name || '',
                featured: false,
                bestSelling: false,
                shortDescription: '',
                image: '',
                images: []
            });
            fetchProducts(); // Refresh list
        } catch (error) {
            console.error("Error saving product: ", error);
            alert('Error saving product');
        }
        setUploading(false);
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await addDoc(collection(db, "categories"), {
                name: newCategory.trim(),
                createdAt: new Date()
            });
            setNewCategory('');
            fetchCategories();
            alert('Category added successfully');
        } catch (error) {
            console.error("Error adding category:", error);
            alert('Failed to add category');
        }
    };

    const initiateDeleteCategory = async (category) => {
        // Check if products exist in this category
        const q = query(collection(db, "products"), where("category", "==", category.name));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            setCategoryToDelete(category);
            setProductsToMigrateCount(snapshot.size);
            setIsMigrationModalOpen(true);
            setMigrationCategory(categories.find(c => c.name !== category.name)?.name || '');
        } else {
            if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
                await deleteCategory(category.id);
            }
        }
    };

    const handleMigrateAndDelete = async () => {
        if (!migrationCategory || !categoryToDelete) return;

        try {
            // Migrating products
            const q = query(collection(db, "products"), where("category", "==", categoryToDelete.name));
            const snapshot = await getDocs(q);

            const updatePromises = snapshot.docs.map(d =>
                updateDoc(doc(db, "products", d.id), { category: migrationCategory })
            );
            await Promise.all(updatePromises);

            // Delete category
            await deleteCategory(categoryToDelete.id);

            setIsMigrationModalOpen(false);
            setCategoryToDelete(null);
            setProductsToMigrateCount(0);
            fetchProducts(); // Refresh products if needed
        } catch (error) {
            console.error("Error migrating products:", error);
            alert("Failed to migrate products and delete category");
        }
    };

    const deleteCategory = async (id) => {
        try {
            await deleteDoc(doc(db, "categories", id));
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Failed to delete category");
        }
    };

    const handleEdit = (product) => {
        setProduct({
            name: product.name,
            price: product.price,
            category: product.category,
            featured: product.featured,
            bestSelling: product.bestSelling || false,
            shortDescription: product.shortDescription || '',
            image: product.image || '',
            images: product.images || (product.image ? [product.image] : [])
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
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'categories'
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Categories
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
                                        {categories.map((cat) => (
                                            <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
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
                                    <label className="block text-sm font-medium text-gray-700">Product Images</label>

                                    {/* Image Preview Grid */}
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        {product.images && product.images.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}

                                        {/* Upload Button */}
                                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-black cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                </svg>
                                                <p className="text-xs text-gray-500">Upload</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e.target.files)}
                                            />
                                        </label>
                                    </div>

                                    {/* Optional URL Input */}
                                    <div className="flex space-x-2">
                                        <input
                                            type="url"
                                            name="image"
                                            value={product.image}
                                            onChange={handleChange}
                                            placeholder="Or add image via URL (optional)"
                                            className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddImageUrl}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                                        >
                                            Add URL
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        You can upload multiple images or add them via URL. The first image will be the main cover.
                                    </p>
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
                    ) : activeTab === 'categories' ? (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">Manage Categories</h2>

                            {/* Add Category Form */}
                            <form onSubmit={handleAddCategory} className="flex gap-4 mb-8">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="New Category Name"
                                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                                />
                                <button
                                    type="submit"
                                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
                                >
                                    Add Category
                                </button>
                            </form>

                            {/* Categories List */}
                            <div className="bg-white border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {categories.map((cat) => (
                                            <tr key={cat.id}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                                                <td className="px-6 py-4 text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => initiateDeleteCategory(cat)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Migration Modal */}
                            {isMigrationModalOpen && categoryToDelete && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                        <h3 className="text-lg font-bold mb-4">Cannot Delete Category</h3>
                                        <p className="mb-4 text-gray-600">
                                            There are {productsToMigrateCount} products in "{categoryToDelete.name}".
                                            You must move them to another category before deleting.
                                        </p>

                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Move to:</label>
                                            <select
                                                value={migrationCategory}
                                                onChange={(e) => setMigrationCategory(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
                                            >
                                                {categories
                                                    .filter(c => c.name !== categoryToDelete.name)
                                                    .map(c => (
                                                        <option key={c.id || c.name} value={c.name}>{c.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => setIsMigrationModalOpen(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleMigrateAndDelete}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                            >
                                                Move & Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
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
            </div >
        </div >
    );
};

export default Admin;
