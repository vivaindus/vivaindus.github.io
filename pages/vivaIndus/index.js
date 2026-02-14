import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';

export default function ShifaStore() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [infoContent, setInfoContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentHero, setCurrentHero] = useState(0);
    const [cardSliderIndices, setCardSliderIndices] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        country: 'India',
        state: '',
        district: '',
        city: ''
    });

    const WHATSAPP_NUMBER = "919074799742";

    useEffect(() => {
        // 1. Load Cart
        const savedCart = localStorage.getItem('shb_cart');
        if (savedCart) setCart(JSON.parse(savedCart));

        // 2. Load Products from CSV
        Papa.parse('/vivaIndus/Products.csv', {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setProducts(results.data);
                setLoading(false);
            }
        });

        // 3. Hero Slider Timer
        const timer = setInterval(() => {
            setCurrentHero(prev => (prev === 0 ? 1 : 0));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // GLightbox Initialization
    useEffect(() => {
        if (!loading && products.length > 0) {
            const initLightbox = async () => {
                const GLightbox = (await import('glightbox')).default;
                GLightbox({
                    selector: '.glightbox',
                    touchNavigation: true,
                    loop: true,
                    zoomable: true
                });
            };
            initLightbox();
        }
    }, [loading, products]);

    // Product Card Auto-Slider Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setCardSliderIndices(prev => {
                const updated = { ...prev };
                products.forEach((p, i) => {
                    const images = p.Image.split(',');
                    if (images.length > 1) {
                        updated[i] = ((prev[i] || 0) + 1) % images.length;
                    }
                });
                return updated;
            });
        }, 4000);
        return () => clearInterval(interval);
    }, [products]);

    // Functions
    const addToCart = (product) => {
        let newCart = [...cart];
        const exist = newCart.find(item => item.code === product.Code);
        
        // Clean the price immediately so the cart stores '₹2,997.50' instead of '?2997.5'
        const rawPrice = product['Aft.Disc'] || "0";
        const cleanPrice = "₹" + parseFloat(rawPrice.replace(/[^\d.]/g, '')).toLocaleString('en-IN');

        if (exist) {
            exist.qty += 1;
        } else {
            newCart.push({ 
                code: product.Code, 
                name: product.Name, 
                price: cleanPrice, 
                qty: 1 
            });
        }
        setCart(newCart);
        localStorage.setItem('shb_cart', JSON.stringify(newCart));
        alert(`${product.Name} added to cart!`);
    };

    const updateQty = (code, delta) => {
        const newCart = cart.map(item => 
            item.code === code ? { ...item, qty: item.qty + delta } : item
        ).filter(i => i.qty > 0);
        setCart(newCart);
        localStorage.setItem('shb_cart', JSON.stringify(newCart));
    };

    const openMoreInfo = (code) => {
        setInfoContent('Loading details...');
        setShowInfo(true);
        fetch(`/vivaIndus/details/${code}.html`)
            .then(res => res.ok ? res.text() : 'Specification coming soon...')
            .then(data => setInfoContent(data))
            .catch(() => setInfoContent('Error loading details.'));
    };

    const submitFinalOrder = async () => {
        if (!formData.name || !formData.state || !formData.city) {
            return alert("Please fill in all required details.");
        }

        let totalAmount = 0;
        cart.forEach(item => {
            // This removes the '₹' and commas so we can do the math
            const numericPrice = parseFloat(item.price.replace(/[^\d.]/g, ''));
            totalAmount += numericPrice * item.qty;
        });

        // 1. SAVE TO DATABASE
        const { error } = await supabase.from('orders').insert([{
            name: formData.name,
            address: `${formData.city}, ${formData.state} ${formData.district}`,
            items: cart,
            total: totalAmount
        }]);
        if (error) console.error("Database Error:", error);

        // 2. FORMAT WHATSAPP
        let msg = `📦 *NEW ORDER - SHIFA STORES*\n`;
        msg += `--------------------------\n`;
        cart.forEach((item, i) => {
            msg += `${i + 1}. *${item.name}* x ${item.qty}\n`;
        });
        msg += `--------------------------\n`;
        msg += `💰 * Total Amount: *₹${totalAmount.toLocaleString('en-IN')}*\n`;
        msg += `--------------------------\n\n`;
        msg += `👤 *CUSTOMER INFO:*\n`;
        msg += `Name: ${formData.name}\n`;
        msg += `Location: ${formData.city}, ${formData.state}`;
        if (formData.state === "Kerala") msg += ` (${formData.district})`;
        msg += `\nCountry: ${formData.country}\n\n`;
        msg += `_Order via shbstores.com_`;

        // Using encodeURIComponent ensures the ₹ and newlines are sent correctly
        const finalLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
        window.open(finalLink, '_blank');
        
        setCart([]);
        localStorage.removeItem('shb_cart');
        setShowCheckout(false);
    };

    return (
        <div className="shifa-app-root">
            <Head>
                <title>IndusViva Shopping | SHB Stores</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css" />
            </Head>

            {/* 1. STICKY HEADER */}
            <header className="main-header">
                <div className="header-container">
                    <div className="logo-area">
                        <div className="logo-wrapper">
                            <svg className="logo-icon" width="50" height="50" viewBox="0 0 120 120">
                                <defs>
                                    <linearGradient id="bagGradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#4EF08A"/><stop offset="100%" stopColor="#3EDC81"/>
                                    </linearGradient>
                                </defs>
                                <rect x="25" y="40" width="70" height="60" rx="12" fill="url(#bagGradient)"/>
                                <path d="M40 40 Q60 15 80 40" stroke="#0d2c6c" strokeWidth="6" fill="none"/>
                                <ellipse cx="60" cy="105" rx="35" ry="6" fill="#0d2c6c" opacity="0.2"/>
                            </svg>
                            <div className="brand-name">
                                <h1>Shifa Stores</h1>
                                <span>SHOP WITH TRUST</span>
                            </div>
                        </div>
                    </div>
                    <nav className="nav-links">
                        <a href="#" className="active">HOME</a>
                        <a href="#">ABOUT</a>
                        <a href="#">PRODUCTS</a>
                    </nav>
                </div>
            </header>

            {/* 2. HERO SLIDER */}
            <section className="hero-slider">
                <div className={`hero-slide ${currentHero === 0 ? 'active' : ''}`}>
                    <img src="/vivaIndus/images/banner1.jpg" alt="Banner 1" />
                </div>
                <div className={`hero-slide ${currentHero === 1 ? 'active' : ''}`}>
                    <img src="/vivaIndus/images/banner2.jpg" alt="Banner 2" />
                </div>
                <div className="slider-dots">
                    <span className={`dot ${currentHero === 0 ? 'active' : ''}`} onClick={() => setCurrentHero(0)}></span>
                    <span className={`dot ${currentHero === 1 ? 'active' : ''}`} onClick={() => setCurrentHero(1)}></span>
                </div>
            </section>

            {/* 3. HOW TO ORDER SECTION */}
            <div className="how-to-order">
                <h2><i className="fa-solid fa-certificate" style={{color:'var(--gold)'}}></i> Premium Wellness Store</h2>
                <p>Add products to your cart. Finalize your order via WhatsApp for secure processing.</p>
            </div>

            {/* 4. PRODUCT GRID */}
            <main className="product-grid">
                {loading ? <p style={{textAlign:'center', gridColumn:'1/-1', padding:'50px'}}>Loading Catalog...</p> : 
                products.map((p, i) => {
                    const images = p.Image.split(',').map(s => s.trim());
                    const currentImgIndex = cardSliderIndices[i] || 0;
                    const salePrice = "₹" + parseFloat(p['Aft.Disc'].replace(/[^\d.]/g, '')).toLocaleString('en-IN');
                    const mrpPrice = "₹" + parseFloat(p['MRP Price (INR)'].replace(/[^\d.]/g, '')).toLocaleString('en-IN');

                    return (
                        <div key={i} className="product-card">
                            <div className="product-image-container">
                                {images.map((img, imgIdx) => (
                                    <a 
                                        key={imgIdx}
                                        href={`/vivaIndus/images/${img}`} 
                                        className={`glightbox slide ${imgIdx === currentImgIndex ? 'active' : ''}`}
                                        data-gallery={`gallery-${i}`}
                                    >
                                        <img src={`/vivaIndus/images/${img}`} alt={p.Name} />
                                    </a>
                                ))}
                            </div>
                            <div className="product-info">
                                <h3>{p.Name}</h3>
                                <div className="price-container">
                                    <span className="mrp-price">MRP: {mrpPrice}</span>
                                    <span className="sale-price">{salePrice}</span>
                                    <span className="save-badge">OFFER PRICE</span>
                                </div>
                                <p>{p.Details.substring(0, 90)}...</p>
                                <button onClick={() => addToCart(p)} className="btn-whatsapp" style={{background:'var(--gold)', color:'var(--emerald-dark)', marginBottom:'10px'}}>
                                    <i className="fa-solid fa-cart-plus"></i> Add to Cart
                                </button>
                                <div style={{display:'flex', gap:'5px'}}>
                                    <button onClick={() => openMoreInfo(p.Code)} className="btn-info" style={{flex:1}}>
                                        <i className="fa-solid fa-circle-info"></i> Info
                                    </button>
                                    {p.WALink && (
                                        <a href={p.WALink} target="_blank" className="btn-info" style={{flex:1, textDecoration:'none', textAlign:'center'}}>
                                            <i className="fa-brands fa-whatsapp"></i> Catalog
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* 5. FLOATING WIDGETS */}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I have a question about Shifa Store products.`} className="whatsapp-support-btn" target="_blank">
                <i className="fa-brands fa-whatsapp"></i><span>Chat with Us</span>
            </a>

            <div className="floating-cart" onClick={() => setShowCart(true)}>
                <i className="fa-solid fa-cart-shopping"></i>
                <span className="cart-count">{cart.reduce((s, i) => s + i.qty, 0)}</span>
            </div>

            {/* 6. MODALS */}
            {/* Cart Modal */}
            {showCart && (
                <div className="modal" style={{display:'flex'}} onClick={(e) => e.target.className === 'modal' && setShowCart(false)}>
                    <div className="modal-content">
                        <span className="close-modal" onClick={() => setShowCart(false)}>&times;</span>
                        <h2 style={{color:'var(--emerald-dark)'}}><i className="fa-solid fa-cart-shopping"></i> Your Order</h2>
                        <div className="cart-items-list" style={{marginTop:'20px'}}>
                            {cart.length === 0 ? <p style={{textAlign:'center', padding:'20px'}}>Your cart is empty.</p> :
                            cart.map((item, idx) => (
                                <div key={idx} className="cart-item">
                                    <div className="cart-item-info">
                                        <h4>{item.name}</h4>
                                        <span className="cart-item-price">{item.price}</span>
                                    </div>
                                    <div className="cart-qty-controls">
                                        <button className="qty-btn" onClick={() => updateQty(item.code, -1)}>-</button>
                                        <span>{item.qty}</span>
                                        <button className="qty-btn" onClick={() => updateQty(item.code, 1)}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {cart.length > 0 && (
                            <button className="checkout-btn" onClick={() => {setShowCart(false); setShowCheckout(true)}}>
                                Proceed to Delivery Details
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="modal" style={{display:'flex'}} onClick={(e) => e.target.className === 'modal' && setShowCheckout(false)}>
                    <div className="modal-content">
                        <span className="close-modal" onClick={() => setShowCheckout(false)}>&times;</span>
                        <div className="checkout-header">
                            <i className="fa-solid fa-truck-fast fa-2x" style={{color:'var(--emerald-dark)'}}></i>
                            <h2>Delivery Details</h2>
                        </div>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter name" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <select value={formData.state} onChange={(e)=>setFormData({...formData, state:e.target.value})}>
                                <option value="">Select State</option>
                                <option value="Kerala">Kerala</option>
                                <option value="Karnataka">Karnataka</option>
                                <option value="Tamil Nadu">Tamil Nadu</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {formData.state === "Kerala" && (
                            <div className="form-group">
                                <label>District (Kerala)</label>
                                <select value={formData.district} onChange={(e)=>setFormData({...formData, district:e.target.value})}>
                                    <option value="">Select District</option>
                                    {['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="form-group">
                            <label>City / Major Landmark</label>
                            <input type="text" placeholder="e.g. MG Road, Kochi" value={formData.city} onChange={(e)=>setFormData({...formData, city:e.target.value})} />
                        </div>
                        <button className="checkout-btn" onClick={submitFinalOrder}>Confirm & Send WhatsApp</button>
                    </div>
                </div>
            )}

            {/* Info Modal */}
            {showInfo && (
                <div className="modal" style={{display:'flex'}} onClick={(e) => e.target.className === 'modal' && setShowInfo(false)}>
                    <div className="modal-content">
                        <span className="close-modal" onClick={() => setShowInfo(false)}>&times;</span>
                        <div dangerouslySetInnerHTML={{ __html: infoContent }} />
                    </div>
                </div>
            )}

            <footer style={{textAlign:'center', padding:'60px', background:'#fff', borderTop:'1px solid #eee'}}>
                <p><strong>SHB Stores | Authorized IndusViva Partner</strong></p>
                <p>WhatsApp Support: +91 90747 99742</p>
                <p>&copy; 2024 shbstores.com. All rights reserved.</p>
                <div className="social-links" style={{marginTop:'15px', fontSize:'1.5rem'}}>
                    <a href="#" style={{color:'#4267B2', margin:'0 10px'}}><i className="fa-brands fa-facebook"></i></a>
                    <a href="#" style={{color:'#E1306C', margin:'0 10px'}}><i className="fa-brands fa-instagram"></i></a>
                </div>
            </footer>
        </div>
    );
}
