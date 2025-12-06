import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

// Fallback static data
const staticProducts = [
    { id: 101, name: 'Classic Black Chiffon', price: '1000', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ37f8snrmEHDFgtlyrwKylZa5biG3lziaUJw&s', category: 'Premium Chiffon', featured: true },
    { id: 102, name: 'Rose Dust Chiffon', price: '1050', image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Premium Chiffon', featured: true },
    { id: 103, name: 'Navy Blue Chiffon', price: '1000', image: 'https://images.unsplash.com/photo-1601567873138-0c621896c364?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Premium Chiffon', featured: false },
    { id: 104, name: 'Emerald Green Chiffon', price: '1100', image: 'https://images.unsplash.com/photo-1564495584620-f5c7969d7539?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Premium Chiffon', featured: true },
    { id: 201, name: 'Golden Silk Wrap', price: '1500', image: 'https://images.unsplash.com/photo-1621609764095-6491961075f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Luxury Silk', featured: true },
    { id: 202, name: 'Silver Grey Silk', price: '1450', image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Luxury Silk', featured: false },
    { id: 203, name: 'Royal Maroon Silk', price: '1600', image: 'https://images.unsplash.com/photo-1594575111057-47b35c5f98f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Luxury Silk', featured: false },
    { id: 301, name: 'Beige Premium Jersey', price: '800', image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Everyday Jersey', featured: true },
    { id: 302, name: 'Charcoal Jersey', price: '850', image: 'https://images.unsplash.com/photo-1601567873138-0c621896c364?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Everyday Jersey', featured: false },
    { id: 303, name: 'Taupe Jersey', price: '800', image: 'https://images.unsplash.com/photo-1564495584620-f5c7969d7539?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Everyday Jersey', featured: false },
    { id: 304, name: 'Mocha Jersey', price: '850', image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Everyday Jersey', featured: true },
    { id: 305, name: 'Olive Green Cotton', price: '1100', image: 'https://images.unsplash.com/photo-1564495584620-f5c7969d7539?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Everyday Jersey', featured: false },
    { id: 306, name: 'Navy Blue Pleated', price: '1200', image: 'https://images.unsplash.com/photo-1601567873138-0c621896c364?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Everyday Jersey', featured: false },
];

export const fetchProducts = async () => {
    try {
        console.log("Fetching all products from Firestore...");
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched products:", products);
        return products.length > 0 ? products : staticProducts;
    } catch (error) {
        console.error("Error fetching products:", error);
        return staticProducts;
    }
};

export const fetchFeaturedProducts = async () => {
    try {
        console.log("Fetching featured products from Firestore...");
        const q = query(collection(db, "products"), where("featured", "==", true));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched featured products:", products);
        return products.length > 0 ? products.slice(0, 6) : staticProducts.filter(p => p.featured).slice(0, 6);
    } catch (error) {
        console.error("Error fetching featured products:", error);
        return staticProducts.filter(p => p.featured).slice(0, 6);
    }
};

export const fetchBestSellingProducts = async () => {
    try {
        console.log("Fetching best selling products from Firestore...");
        const q = query(collection(db, "products"), where("bestSelling", "==", true));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched best selling products:", products);
        return products.length > 0 ? products.slice(0, 6) : staticProducts.slice(0, 6);
    } catch (error) {
        console.error("Error fetching best selling products:", error);
        return staticProducts.slice(0, 6);
    }
};

export const fetchProductsByCategory = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allProducts = products.length > 0 ? products : staticProducts;

        const categories = {};
        allProducts.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = [];
            }
            categories[product.category].push(product);
        });
        return Object.entries(categories).map(([title, products]) => ({ title, products }));
    } catch (error) {
        console.error("Error fetching products by category:", error);
        const categories = {};
        staticProducts.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = [];
            }
            categories[product.category].push(product);
        });
        return Object.entries(categories).map(([title, products]) => ({ title, products }));
    }
};

export const fetchProductById = async (id) => {
    try {
        // Try to find in static products first if it's a number (legacy id)
        if (typeof id === 'number' || !isNaN(id)) {
            const product = staticProducts.find(p => p.id == id);
            if (product) return product;
        }

        // Fetch from Firestore
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            // Fallback to searching static products by string id if needed
            return staticProducts.find(p => p.id == id);
        }
    } catch (error) {
        console.error("Error fetching product by id:", error);
        return staticProducts.find(p => p.id == id);
    }
};
