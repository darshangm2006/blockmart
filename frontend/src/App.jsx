import { useState, useEffect } from "react";

import {
  Search,
  ShoppingCart,
  User,
  Heart,
  ShieldCheck,
  Truck,
  Zap,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (window.location.port === "5173"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : window.location.origin);

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");
  const [maxPrice, setMaxPrice] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blockmart-cart") || "[]");
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blockmart-wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [reviews, setReviews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blockmart-reviews") || "{}");
    } catch {
      return {};
    }
  });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [transactions, setTransactions] = useState([]);

  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [buying, setBuying] = useState(false);
  const [verifyingTransaction, setVerifyingTransaction] = useState(false);
  const [transactionVerification, setTransactionVerification] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // LOGIN STATES
  const [loginMobile, setLoginMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [registerName, setRegisterName] = useState("");
  const [registerMobile, setRegisterMobile] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("buyer");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("1");
  const [productLoading, setProductLoading] = useState(false);

  const normalizeProductName = (value = "") =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const productImages = {
    "nova x1 smartphone": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    "pixelpro 5g phone": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    "i phone": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    "voltmax power bank": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80",
    "clearview smart tv": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80",
    "keycraft mechanical keyboard": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    "glide wireless mouse": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
    "soundbeat wireless headphones": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    "bassbox bluetooth speaker": "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80",
    "lenspro action camera": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80",
    "urban classic sneakers": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    "aerorun sports shoes": "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=80",
    "northline denim jacket": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    "softweave cotton t shirt": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    "luna casual handbag": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    "aerobrew coffee maker": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    "purehome air purifier": "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&w=900&q=80",
    "chefmate nonstick cookware set": "https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=900&q=80",
    "glownest led desk lamp": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    "cloudrest memory foam pillow": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    "the focus habit planner": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
    "world atlas illustrated edition": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    "the startup handbook": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
    "classic mystery collection": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
    "everyday laptop backpack": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    "travel organizer pouch": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
    "secureguard laptop sleeve": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
    "steeledge analog watch": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    "fittrack smart watch": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
    "everyday sunglasses": "https://images.unsplash.com/photo-1577803947579-9f6d3a4b8d7b?auto=format&fit=crop&w=900&q=80",
  };

  const fallbackProductImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80"
  ];

  const getProductImage = (productName = "") => {
    const normalizedName = normalizeProductName(productName);
    const exactMatch = productImages[normalizedName];

    if (exactMatch) {
      return exactMatch;
    }

    const fallbackIndex = normalizedName.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % fallbackProductImages.length;
    return fallbackProductImages[fallbackIndex];
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : data.products || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("blockmart-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("blockmart-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("blockmart-reviews", JSON.stringify(reviews));
  }, [reviews]);

  const getAlertMessage = (payload, fallback) => {
    if (!payload) return fallback;
    if (typeof payload === "string") return payload;
    if (typeof payload.message === "string") return payload.message;
    if (typeof payload.detail === "string") return payload.detail;
    if (payload.detail && typeof payload.detail.message === "string") {
      const reasons = Array.isArray(payload.detail.reasons)
        ? `\n${payload.detail.reasons.join("\n")}`
        : "";
      return `${payload.detail.message} (Risk: ${payload.detail.risk_level || "HIGH"})${reasons}`;
    }
    return fallback;
  };

  // ADD TO CART
  const addToCart = (product) => {
    if (!product.stock) return;
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(cart.map((item) => item.id === product.id
        ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
        : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

  };

  const buyNow = (product) => {
    if (!product.stock) return;
    const item = { ...product, quantity: 1 };
    setCart((currentCart) => {
      const existingItem = currentCart.find((cartItem) => cartItem.id === product.id);

      if (existingItem) {
        return currentCart.map((cartItem) => cartItem.id === product.id
          ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, product.stock) }
          : cartItem);
      }

      return [...currentCart, item];
    });

    if (!loggedInUser) {
      setCheckoutStep("transaction");
      setPage("login");
      return;
    }

    if (loggedInUser.role !== "buyer") {
      return;
    }

    setDeliveryDetails((details) => ({
      ...details,
      name: details.name || loggedInUser.name || "",
      phone: details.phone || loggedInUser.wallet_address || "",
    }));
    setTransactionVerification(null);
    setCheckoutStep("transaction");
    setPage("cart");
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const updateCartQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart(cart.filter((item) => item.id !== productId));
      return;
    }

    setCart(cart.map((item) => item.id === productId
      ? { ...item, quantity: Math.min(quantity, item.stock) }
      : item));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const submitReview = () => {
    if (!loggedInUser || loggedInUser.role !== "buyer" || !selectedProduct || !reviewText.trim()) {
      return;
    }

    const review = {
      id: Date.now(),
      rating: reviewRating,
      text: reviewText.trim(),
      name: loggedInUser.name || "Verified buyer",
      date: new Date().toLocaleDateString(),
    };

    setReviews((currentReviews) => ({
      ...currentReviews,
      [selectedProduct.id]: [review, ...(currentReviews[selectedProduct.id] || [])],
    }));
    setReviewText("");
    setReviewRating(5);
  };

  const beginCheckout = () => {
    if (!loggedInUser) {
      setCheckoutStep("transaction");
      setPage("login");
      return;
    }

    if (loggedInUser.role !== "buyer") {
      return;
    }

    setDeliveryDetails((details) => ({
      ...details,
      name: details.name || loggedInUser.name || "",
      phone: details.phone || loggedInUser.wallet_address || "",
    }));
    setTransactionVerification(null);
    setCheckoutStep("transaction");
  };

  const verifyTransaction = async () => {
    if (!loggedInUser || loggedInUser.role !== "buyer") {
      return;
    }

    setVerifyingTransaction(true);

    try {
      for (const item of cart) {
        const response = await fetch(`${API_BASE_URL}/fraud/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyer_id: loggedInUser.id,
            product_id: item.id,
            quantity: item.quantity,
          }),
        });
        const result = await response.json();

        if (!response.ok || result.fraud) {
          setTransactionVerification({ ...result, fraud: true });
          return;
        }
      }

      setTransactionVerification({
        fraud: false,
        risk_level: "LOW",
        risk_score: 0,
        reasons: [
          "Buyer verified",
          "Product and stock verified",
          "No suspicious activity detected",
        ],
      });
    } catch (error) {
      console.error("Transaction verification error:", error);
      setTransactionVerification({
        fraud: true,
        risk_level: "UNKNOWN",
        reasons: ["Could not connect to the fraud prevention service"],
      });
    } finally {
      setVerifyingTransaction(false);
    }
  };

  // WISHLIST
  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item.id === product.id);

    if (exists) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  // FASTAPI LOGIN
  const handleLogin = async () => {
    if (!loginMobile || !password) {
      setLoginMessage("Please enter your mobile number and password.");
      return;
    }

    setLoginMessage("");
    setLoginLoading(true);

    try {
      let loginEmail = `${loginMobile.trim()}@${role}.blockmart.com`;
      const looksLikeSellerId = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(loginMobile.trim());

      if (looksLikeSellerId) {
        const usersResponse = await fetch(`${API_BASE_URL}/users`);
        const usersData = await usersResponse.json();
        const matchingUser = (usersData.users || []).find(
          (user) => String(user.id).toLowerCase() === loginMobile.trim().toLowerCase()
        );

        if (matchingUser) {
          loginEmail = matchingUser.email;
        }
      }

      let response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: password,
          role: role,
        }),
      });

      // Keep older accounts using the original internal email format working.
      if (!response.ok && !looksLikeSellerId) {
        response = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: `${loginMobile.trim()}@blockmart.com`,
            password,
            role,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setLoginMessage(
          response.status === 401
            ? "Incorrect mobile number or password. Please try again."
            : getAlertMessage(data, "Login failed. Please check your details.")
        );
        return;
      }

      const user = data.user || data;
      setLoggedInUser(user);

      setPage(checkoutStep === "transaction" ? "cart" : "home");
      setPassword("");
    } catch (error) {
      console.error("Login error:", error);
      setLoginMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerPassword || !registerMobile) {
      setRegistrationResult({ type: "error", message: "Please complete all signup fields." });
      return;
    }

    setRegisterLoading(true);

    try {
      const registerEmail = `${registerMobile.trim()}@${registerRole}.blockmart.com`;
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: registerRole,
          wallet_address: registerMobile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegistrationResult({ type: "error", message: getAlertMessage(data, "Registration failed.") });
        return;
      }

      const createdUser = data.user || data;
      setRegistrationResult({
        type: "success",
        message: "Signup completed successfully.",
        accountId: createdUser.id,
        role: createdUser.role || registerRole,
      });
      setAuthMode("login");
      setLoginMobile(registerMobile);
      setPassword(registerPassword);
      setRole(registerRole);
      setRegisterName("");
      setRegisterMobile("");
      setRegisterPassword("");
      setRegisterRole("buyer");
    } catch (error) {
      console.error("Register error:", error);
      setRegistrationResult({ type: "error", message: "Could not connect to the backend." });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!loggedInUser || loggedInUser.role !== "seller") {
      return;
    }

    if (!productName || !productDescription || !productPrice || !productStock) {
      return;
    }

    setProductLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productName,
          description: productDescription,
          price: Number(productPrice),
          seller_id: loggedInUser.id,
          stock: Number(productStock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductStock("1");
      fetch(`${API_BASE_URL}/products`)
        .then((res) => res.json())
        .then((payload) => {
          setProducts(Array.isArray(payload) ? payload : payload.products || []);
        })
        .catch((error) => console.error("Error reloading products:", error));
    } catch (error) {
      console.error("Add product error:", error);
    } finally {
      setProductLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    setLoggedInUser(null);
    setLoginMobile("");
    setPassword("");
  };

  const fetchProducts = () => {
    fetch(`${API_BASE_URL}/products`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : data.products || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setLoading(false);
      });
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`);
      const data = await response.json();
      const allTransactions = Array.isArray(data) ? data : data.transactions || [];

      if (!loggedInUser) {
        setTransactions([]);
        return;
      }

      const filtered = allTransactions.filter((txn) => {
        if (loggedInUser.role === "buyer") {
          return String(txn.buyer_id) === String(loggedInUser.id);
        }
        if (loggedInUser.role === "seller") {
          return String(txn.seller_id) === String(loggedInUser.id);
        }
        return false;
      });

      setTransactions(filtered);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      fetchTransactions();
    }
  }, [loggedInUser]);

  const getProductCategory = (product) => {
    const name = normalizeProductName(product?.name || "");
    const description = normalizeProductName(product?.description || "");
    const text = `${name} ${description}`;

    if (/(phone|mobile|smartphone|tv|speaker|keyboard|mouse|headphone|camera|power bank|watch|laptop|tablet|electronics)/.test(text)) {
      return "Electronics";
    }

    if (/(shoe|sneaker|jacket|shirt|t shirt|handbag|sunglasses|fashion|denim|cloth|wear)/.test(text)) {
      return "Fashion";
    }

    if (/(lamp|pillow|cookware|purifier|coffee maker|home|desk|kitchen|room|air)/.test(text)) {
      return "Home";
    }

    if (/(book|planner|handbook|atlas|mystery|collection|story|guide)/.test(text)) {
      return "Books";
    }

    if (/(bag|backpack|pouch|sleeve|organizer|case|accessory|travel|wallet)/.test(text)) {
      return "Accessories";
    }

    return "Electronics";
  };

  const handleBuyProducts = async () => {
    if (!loggedInUser || loggedInUser.role !== "buyer") {
      return;
    }

    if (cart.length === 0) {
      return;
    }

    setBuying(true);

    try {
      for (const product of cart) {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            buyer_id: loggedInUser.id,
            product_id: product.id,
            quantity: product.quantity,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          return;
        }
      }

      setOrderPlaced({
        id: `BM-${Date.now().toString().slice(-8)}`,
        total: cartTotal,
        itemCount: cartItemCount,
      });
      setCart([]);
      setCheckoutStep("complete");
      fetchProducts();
      fetchTransactions();
    } catch (error) {
      console.error("Buy products error:", error);
    } finally {
      setBuying(false);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const categoryName = getProductCategory(product);
      const searchValue = search.trim().toLowerCase();
      const matchesCategory = selectedCategory === "All" || categoryName === selectedCategory;
      const matchesSearch = !searchValue || `${product.name} ${product.description} ${categoryName}`
        .toLowerCase()
        .includes(searchValue);
      const matchesPrice = maxPrice === "all" || product.price <= Number(maxPrice);
      const matchesStock = !inStockOnly || product.stock > 0;
      return matchesCategory && matchesSearch && matchesPrice && matchesStock;
    })
    .sort((firstProduct, secondProduct) => {
      if (sortBy === "price-low") return firstProduct.price - secondProduct.price;
      if (sortBy === "price-high") return secondProduct.price - firstProduct.price;
      if (sortBy === "newest") return new Date(secondProduct.created_at) - new Date(firstProduct.created_at);
      return 0;
    });

  const categoryOrder = ["Electronics", "Fashion", "Home", "Books", "Accessories"];
  const displayedProducts = filteredProducts;
  const categoryGroups = categoryOrder
    .map((category) => ({
      category,
      products: displayedProducts.filter((product) => getProductCategory(product) === category),
    }))
    .filter((group) => group.products.length > 0);

  const sellerEarnings = transactions.reduce(
    (total, transaction) => total + Number(transaction.total_amount || 0),
    0
  );
  const sellerUnitsSold = transactions.reduce(
    (total, transaction) => total + Number(transaction.quantity || 0),
    0
  );
  const sellerReviews = products
    .filter((product) => String(product.seller_id) === String(loggedInUser?.id))
    .flatMap((product) => (reviews[product.id] || []).map((review) => ({ ...review, productName: product.name })));

  // LOGIN PAGE
  if (page === "login") {
    return (
      <div className="app">
        <div
          style={{
            maxWidth: "450px",
            margin: "80px auto",
            padding: "30px",
            background: "white",
            borderRadius: "15px",
            boxShadow: "0 5px 25px rgba(0,0,0,0.1)",
          }}
        >
          <button
            onClick={() => setPage("home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h1 style={{ marginTop: "25px" }}>
            {authMode === "login" ? "Login to BlockMart" : "Create your account"}
          </h1>

          {registrationResult && (
            <div className={`registration-result ${registrationResult.type}`}>
              <strong>{registrationResult.message}</strong>
              {registrationResult.accountId && (
                <span>
                  {registrationResult.role === "seller" ? "Seller ID" : "Account ID"}: {registrationResult.accountId}
                </span>
              )}
              {registrationResult.accountId && (
                <small>Use your mobile number or this ID to login.</small>
              )}
            </div>
          )}

          {loginMessage && authMode === "login" && (
            <div className="login-result error" role="alert">
              {loginMessage}
            </div>
          )}

          <p style={{ color: "#666", marginTop: "8px" }}>
            {authMode === "login"
              ? "Login using your BlockMart account"
              : "Sign up as a buyer or seller"}
          </p>

          {authMode === "register" && (
            <>
              <input
                type="text"
                placeholder="Full name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />

              <input
                type="tel"
                placeholder="Mobile number"
                value={registerMobile}
                onChange={(e) => setRegisterMobile(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />

              <input
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />

              <select
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "white",
                  boxSizing: "border-box",
                }}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </>
          )}

          {authMode === "login" && (
            <>
              <input
                type="tel"
                placeholder="Mobile number"
                value={loginMobile}
                onChange={(e) => { setLoginMobile(e.target.value); setLoginMessage(""); }}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginMessage(""); }}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "white",
                  boxSizing: "border-box",
                }}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </>
          )}

          <button
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "20px",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: authMode === "login" ? (loginLoading ? "not-allowed" : "pointer") : registerLoading ? "not-allowed" : "pointer",
              opacity: authMode === "login" ? (loginLoading ? 0.7 : 1) : registerLoading ? 0.7 : 1,
            }}
            onClick={authMode === "login" ? handleLogin : handleRegister}
            disabled={authMode === "login" ? loginLoading : registerLoading}
          >
            {authMode === "login"
              ? loginLoading ? "Logging in..." : "Login"
              : registerLoading ? "Signing up..." : "Sign Up"}
          </button>

          <p
            style={{
              marginTop: "20px",
              fontSize: "13px",
              color: "#777",
              textAlign: "center",
            }}
          >
            {authMode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              style={{
                border: "none",
                background: "transparent",
                color: "#111827",
                cursor: "pointer",
                fontWeight: "600",
                padding: 0,
              }}
            >
              {authMode === "login" ? "Create account" : "Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // CART PAGE
  if (page === "account") {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">⛓️</div>
            <div>
              <h2>BlockMart</h2>
              <span>Blockchain Marketplace</span>
            </div>
          </div>
        </header>

        <main className="products-section account-page">
          <button className="continue-link" onClick={() => setPage("home")}>
            <ArrowLeft size={16} /> Back to Marketplace
          </button>

          <div className="account-heading">
            <div>
              <span className="account-eyebrow">Account Center</span>
              <h1>My Account &amp; Order Details</h1>
              <p>{loggedInUser?.role} account · {loggedInUser?.wallet_address || loggedInUser?.email}</p>
              <p className="account-id">Account ID: {loggedInUser?.id}</p>
            </div>
            <User size={42} />
          </div>

          {loggedInUser?.role === "seller" && (
            <>
              <section className="seller-dashboard">
                <div className="section-heading">
                  <div>
                    <h2>Seller Sales Dashboard</h2>
                    <p>Sales linked to seller ID: {loggedInUser.id}</p>
                  </div>
                </div>
                <div className="seller-metrics">
                  <div><span>Total earnings</span><strong>₹{sellerEarnings.toLocaleString("en-IN")}</strong></div>
                  <div><span>Units sold</span><strong>{sellerUnitsSold}</strong></div>
                  <div><span>Orders received</span><strong>{transactions.length}</strong></div>
                </div>
                <div className="seller-sales-list">
                  <h3>Sold product details</h3>
                  {transactions.length === 0 ? <p className="account-muted">No products sold yet.</p> : transactions.map((transaction) => {
                    const soldProduct = products.find((product) => product.id === transaction.product_id);
                    return <div className="seller-sale-row" key={transaction.id}><div><strong>{soldProduct?.name || transaction.product_id}</strong><span>Order ID: {transaction.id}</span></div><div><strong>{transaction.quantity} unit{transaction.quantity === 1 ? "" : "s"}</strong><span>{transaction.status}</span></div><strong>₹{Number(transaction.total_amount || 0).toLocaleString("en-IN")}</strong></div>;
                  })}
                </div>
              </section>

              <section className="account-panel">
                <div className="account-panel-title"><ShoppingCart size={20} /><h2>Upload Product</h2></div>
                <div className="account-form-grid seller-product-form">
                  <input placeholder="Product name" value={productName} onChange={(e) => setProductName(e.target.value)} />
                  <input type="number" min="0" placeholder="Price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                  <textarea placeholder="Product description" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
                  <input type="number" min="1" placeholder="Stock" value={productStock} onChange={(e) => setProductStock(e.target.value)} />
                </div>
                <button className="shop-btn account-action" onClick={handleAddProduct} disabled={productLoading}>{productLoading ? "Adding..." : "Upload Product"}</button>
              </section>

              <section className="account-panel">
                <div className="account-panel-title"><Heart size={20} /><h2>Customer Feedback &amp; Ratings</h2></div>
                {sellerReviews.length === 0 ? (
                  <p className="account-muted">No customer reviews yet.</p>
                ) : (
                  <div className="seller-review-list">
                    {sellerReviews.map((review) => (
                      <article className="seller-review" key={review.id}>
                        <div className="seller-review-top">
                          <div><strong>{review.productName}</strong><span>{review.name} · {review.date}</span></div>
                          <strong className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong>
                        </div>
                        <p>{review.text}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {loggedInUser?.role === "buyer" && <section className="account-panel">
            <div className="account-panel-title"><ShoppingCart size={20} /><h2>Cart Details</h2></div>
            {cart.length === 0 ? (
              <p className="account-muted">Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="account-row" key={item.id}>
                    <span>{item.name} × {item.quantity}</span>
                    <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                  </div>
                ))}
                <div className="account-total"><span>Cart total</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></div>
                <button className="shop-btn account-action" onClick={() => setPage("cart")}>Open Cart & Checkout</button>
              </>
            )}
          </section>}

          {loggedInUser?.role === "buyer" && <section className="account-panel">
            <div className="account-panel-title"><Heart size={20} /><h2>Wishlist Details</h2></div>
            {wishlist.length === 0 ? (
              <p className="account-muted">Your wishlist is empty.</p>
            ) : (
              wishlist.map((item) => (
                <div className="account-row" key={item.id}>
                  <span>{item.name}</span>
                  <strong>₹{item.price.toLocaleString("en-IN")}</strong>
                </div>
              ))
            )}
          </section>}

          {loggedInUser?.role === "buyer" && <section className="account-panel">
            <div className="account-panel-title"><MapPin size={20} /><h2>Delivery Details</h2></div>
            <div className="account-form-grid">
              <input placeholder="Full name" value={deliveryDetails.name} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })} />
              <input placeholder="Mobile number" value={deliveryDetails.phone} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })} />
              <textarea placeholder="Delivery address" value={deliveryDetails.address} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })} />
              <input placeholder="City" value={deliveryDetails.city} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })} />
              <input placeholder="Pincode" value={deliveryDetails.pincode} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, pincode: e.target.value })} />
            </div>
          </section>}

          {loggedInUser?.role === "buyer" && <section className="account-panel">
            <div className="account-panel-title"><CreditCard size={20} /><h2>Payment Details</h2></div>
            <label className="payment-option"><input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /> Cash on delivery</label>
            <label className="payment-option"><input type="radio" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /> UPI / online payment</label>
          </section>}

          {loggedInUser?.role === "buyer" && <section className="account-panel">
            <div className="account-panel-title"><MapPin size={20} /><h2>Ordered Delivery Details</h2></div>
            {transactions.length === 0 ? (
              <p className="account-muted">No orders yet. Your completed transactions will appear here.</p>
            ) : (
              transactions.map((txn) => {
                const product = products.find((item) => item.id === txn.product_id);
                return (
                  <div className="account-order" key={txn.id}>
                    <div><strong>{product?.name || txn.product_id}</strong><span>Order ID: {txn.id}</span></div>
                    <div className="delivery-tracking"><strong>{txn.delivery_status || "Processing"}</strong><span>Expected by {txn.estimated_delivery ? new Date(`${txn.estimated_delivery}T00:00:00`).toLocaleDateString() : "5 days"}</span></div>
                  </div>
                );
              })
            )}
          </section>}

          <section className="account-panel">
            <div className="account-panel-title"><CheckCircle size={20} /><h2>Ordered Transaction Details</h2></div>
            {transactions.length === 0 ? (
              <p className="account-muted">No transaction details available.</p>
            ) : (
              transactions.map((txn) => {
                const product = products.find((item) => item.id === txn.product_id);
                return (
                  <div className="account-order" key={`${txn.id}-transaction`}>
                    <div><strong>{product?.name || txn.product_id}</strong><span>Transaction ID: {txn.id}</span></div>
                    <div><strong>₹{txn.total_amount.toLocaleString("en-IN")}</strong><span>Qty: {txn.quantity} · {txn.status}</span></div>
                    {txn.transaction_hash && <small>Blockchain hash: {txn.transaction_hash}</small>}
                  </div>
                );
              })
            )}
          </section>

          <button className="account-logout" onClick={() => { handleLogout(); setPage("home"); }}>
            <User size={18} /> Logout
          </button>
        </main>
      </div>
    );
  }

  // CART PAGE
  if (page === "cart") {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">⛓️</div>
            <div>
              <h2>BlockMart</h2>
              <span>Blockchain Marketplace</span>
            </div>
          </div>
        </header>

        <main className="products-section">
          <button
            onClick={() => setPage("home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <ArrowLeft size={18} /> Continue Shopping
          </button>

          {checkoutStep === "complete" && orderPlaced ? (
            <div className="checkout-success">
              <CheckCircle size={58} />
              <h1>Order placed successfully</h1>
              <p>Order {orderPlaced.id} is confirmed and will be processed shortly.</p>
              <strong>₹{orderPlaced.total.toLocaleString("en-IN")}</strong>
              <button className="shop-btn" onClick={() => { setPage("home"); setCheckoutStep("cart"); }}>
                Continue Shopping
              </button>
            </div>
          ) : checkoutStep === "transaction" ? (
            <div className="checkout-layout">
              <section className="checkout-panel">
                <div className="checkout-title"><CreditCard size={22} /><h2>Transaction details</h2></div>
                <p className="checkout-intro">Review your order and verify it before entering the delivery address.</p>
                <div className="transaction-details">
                  <p><span>Buyer</span><strong>{loggedInUser?.name || "Not logged in"}</strong></p>
                  <p><span>Items</span><strong>{cartItemCount}</strong></p>
                  <p><span>Amount</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></p>
                  <p><span>Payment</span><strong>{paymentMethod === "cod" ? "Cash on delivery" : "UPI / online payment"}</strong></p>
                </div>
                {transactionVerification && (
                  <div className={transactionVerification.fraud ? "verification-result blocked" : "verification-result approved"}>
                    <strong>{transactionVerification.fraud ? "Transaction blocked" : "Transaction verified"}</strong>
                    <span>Risk level: {transactionVerification.risk_level} · Score: {transactionVerification.risk_score ?? 0}</span>
                    {transactionVerification.reasons?.map((reason) => <small key={reason}>• {reason}</small>)}
                  </div>
                )}
                <div className="checkout-actions">
                  <button className="secondary-btn" onClick={() => setCheckoutStep("cart")}>Back to Cart</button>
                  {transactionVerification?.fraud ? (
                    <button className="secondary-btn" onClick={() => setTransactionVerification(null)}>Review Again</button>
                  ) : transactionVerification?.fraud === false ? (
                    <button className="shop-btn" onClick={() => setCheckoutStep("delivery")}>Continue to Delivery</button>
                  ) : (
                    <button className="shop-btn" disabled={verifyingTransaction} onClick={verifyTransaction}>
                      {verifyingTransaction ? "Verifying transaction..." : "Verify Transaction"}
                    </button>
                  )}
                </div>
              </section>
              <aside className="order-summary"><h3>Order summary</h3>{cart.map((item) => <p key={item.id}><span>{item.name} × {item.quantity}</span><strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong></p>)}<hr /><p><span>Total</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></p></aside>
            </div>
          ) : checkoutStep === "delivery" ? (
            <div className="checkout-layout">
              <section className="checkout-panel">
                <div className="checkout-title"><MapPin size={22} /><h2>Delivery address</h2></div>
                <div className="checkout-form-grid">
                  <input placeholder="Full name" value={deliveryDetails.name} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })} />
                  <input placeholder="Mobile number" value={deliveryDetails.phone} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })} />
                  <textarea placeholder="Flat, house no., street and area" value={deliveryDetails.address} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })} />
                  <input placeholder="City" value={deliveryDetails.city} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })} />
                  <input placeholder="Pincode" value={deliveryDetails.pincode} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, pincode: e.target.value })} />
                </div>
                <div className="checkout-title payment-heading"><CreditCard size={22} /><h2>Payment method</h2></div>
                <label className="payment-option"><input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /> Cash on delivery</label>
                <label className="payment-option"><input type="radio" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /> UPI / online payment</label>
                <div className="checkout-actions">
                  <button className="secondary-btn" onClick={() => setCheckoutStep("cart")}>Back to Cart</button>
                  <button className="shop-btn" disabled={buying || !deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.address || !deliveryDetails.city || !deliveryDetails.pincode} onClick={handleBuyProducts}>
                    {buying ? "Placing order..." : `Place Order · ₹${cartTotal.toLocaleString("en-IN")}`}
                  </button>
                </div>
              </section>
              <aside className="order-summary"><h3>Order summary</h3>{cart.map((item) => <p key={item.id}><span>{item.name} × {item.quantity}</span><strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong></p>)}<hr /><p><span>Total</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></p></aside>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-cart"><ShoppingCart size={44} /><h3>Your cart is empty.</h3><p>Add products to begin shopping.</p><button className="shop-btn" onClick={() => setPage("home")}>Browse Products</button></div>
          ) : (
            <div className="checkout-layout">
              <section className="checkout-panel"><h2>🛒 Shopping cart <small>({cartItemCount} items)</small></h2>{cart.map((product) => <div className="cart-line" key={product.id}><img className="cart-product-image" src={getProductImage(product.name)} alt={product.name} /><div className="cart-product-details"><strong>{product.name}</strong><span>Blockchain verified seller</span><b>₹{product.price.toLocaleString("en-IN")}</b></div><div className="quantity-control"><button onClick={() => updateCartQuantity(product.id, product.quantity - 1)}><Minus size={15} /></button><span>{product.quantity}</span><button onClick={() => updateCartQuantity(product.id, product.quantity + 1)}><Plus size={15} /></button></div><button className="remove-btn" onClick={() => removeFromCart(product.id)} title="Remove item"><Trash2 size={18} /></button></div>)}<button className="continue-link" onClick={() => setPage("home")}><ArrowLeft size={16} /> Continue shopping</button></section>
              <aside className="order-summary"><h3>Price details</h3><p><span>Items ({cartItemCount})</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></p><p><span>Delivery</span><strong className="free-delivery">FREE</strong></p><hr /><p className="summary-total"><span>Total amount</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></p><button className="shop-btn checkout-btn" onClick={beginCheckout}>Proceed to Checkout</button><small>Safe and secure payments powered by BlockMart</small></aside>
            </div>
          )}
        </main>
      </div>
    );
  }

  // PRODUCT DETAILS PAGE
  if (selectedProduct) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">⛓️</div>
            <div>
              <h2>BlockMart</h2>
              <span>Blockchain Marketplace</span>
            </div>
          </div>
        </header>

        <main className="products-section">
          <button
            onClick={() => setSelectedProduct(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <ArrowLeft size={18} /> Back to Products
          </button>

          <div
            style={{
              background: "white",
              padding: "40px",
              marginTop: "30px",
              borderRadius: "15px",
            }}
          >
            <img className="detail-product-image" src={getProductImage(selectedProduct.name)} alt={selectedProduct.name} />

            <h1>{selectedProduct.name}</h1>

            <p style={{ marginTop: "15px" }}>
              Blockchain Verified Product
            </p>

            <h2 style={{ marginTop: "20px" }}>
              ₹{selectedProduct.price}
            </h2>

            <button
              className="add-cart"
              style={{ marginTop: "25px" }}
              onClick={() => addToCart(selectedProduct)}
            >
              Add to Cart
            </button>
            <button
              className="buy-now"
              onClick={() => buyNow(selectedProduct)}
            >
              Buy Now
            </button>

            <section className="reviews-section">
              <div className="reviews-heading">
                <div>
                  <h2>Customer Reviews</h2>
                  <p>{(reviews[selectedProduct.id] || []).length} review{(reviews[selectedProduct.id] || []).length === 1 ? "" : "s"}</p>
                </div>
                <strong className="review-score">★ {reviewRating}.0</strong>
              </div>

              {loggedInUser?.role === "buyer" && (
                <div className="review-form">
                  <label>Rate this product</label>
                  <p className="review-permission">Buyer accounts can rate and share feedback on products.</p>
                  <div className="star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" className={star <= reviewRating ? "star active" : "star"} onClick={() => setReviewRating(star)}>
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea placeholder="Share your experience with this product" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                  <button className="shop-btn review-submit" disabled={!reviewText.trim()} onClick={submitReview}>Submit Review</button>
                </div>
              )}

              {!loggedInUser && <p className="review-permission review-login-note">Login as a buyer to give a rating and feedback.</p>}
              {loggedInUser?.role === "seller" && <p className="review-permission review-login-note">Seller accounts can manage products but cannot rate products.</p>}

              <div className="review-list">
                {(reviews[selectedProduct.id] || []).map((review) => (
                  <article className="review-card" key={review.id}>
                    <div><strong>{review.name}</strong><span>{review.date}</span></div>
                    <div className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                    <p>{review.text}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">⛓️</div>

          <div>
            <h2>BlockMart</h2>
            <span>Blockchain Marketplace</span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search for products, brands and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
          >
            Search
          </button>
        </div>

        {/* HEADER BUTTONS */}
        <div className="header-actions">
          {/* LOGIN / USER */}
          {loggedInUser ? (
            <>
              <button
                className="login-btn"
                onClick={handleLogout}
                title="Click to logout"
              >
                <User size={20} />

                {loggedInUser.name || "Account"}

                <small style={{ marginLeft: "3px" }}>
                  ({loggedInUser.role})
                </small>
              </button>
              <button
                className="orders-btn"
                onClick={() => setPage("account")}
              >
                My Account
              </button>
            </>
          ) : (
            <button
              className="login-btn"
              onClick={() => setPage("login")}
            >
              <User size={20} />
              Login
            </button>
          )}

          {/* WISHLIST */}
          <button
            className="icon-btn"
            onClick={() => setPage(loggedInUser ? "account" : "login")}
            title="Open wishlist"
          >
            <Heart size={22} />

            {wishlist.length > 0 && (
              <span className="cart-count">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* CART */}
          <button
            className="cart-btn"
            onClick={() => setPage("cart")}
          >
            <ShoppingCart size={22} />
            Cart

            <span className="cart-count">
              {cartItemCount}
            </span>
          </button>
        </div>
      </header>

      {/* CATEGORY NAVIGATION */}
      <nav className="categories">
        <div
          onClick={() => {
            setSelectedCategory("All");
            setSearch("");
          }}
          className={selectedCategory === "All" ? "active-category" : ""}
        >
          All Categories
        </div>
        <div
          onClick={() => {
            setSelectedCategory("Electronics");
            setSearch("Electronics");
          }}
          className={selectedCategory === "Electronics" ? "active-category" : ""}
        >
          Electronics
        </div>
        <div
          onClick={() => {
            setSelectedCategory("Electronics");
            setSearch("Mobile");
          }}
        >
          Mobiles
        </div>
        <div
          onClick={() => {
            setSelectedCategory("Fashion");
            setSearch("Fashion");
          }}
          className={selectedCategory === "Fashion" ? "active-category" : ""}
        >
          Fashion
        </div>
        <div
          onClick={() => {
            setSelectedCategory("Home");
            setSearch("Home");
          }}
          className={selectedCategory === "Home" ? "active-category" : ""}
        >
          Home
        </div>
        <div
          onClick={() => {
            setSelectedCategory("Books");
            setSearch("Book");
          }}
          className={selectedCategory === "Books" ? "active-category" : ""}
        >
          Books
        </div>
        <div
          onClick={() => {
            setSelectedCategory("Accessories");
            setSearch("Accessories");
          }}
          className={selectedCategory === "Accessories" ? "active-category" : ""}
        >
          Accessories
        </div>
        <div
          onClick={() => {
            setSelectedCategory("All");
            setSearch("");
          }}
        >
          Deals
        </div>
      </nav>

      <section className="top-offers">
        <div className="offer-card blue">
          <span>Top Offers</span>
          <strong>Up to 70% Off</strong>
          <p>Mobiles, Electronics & more</p>
        </div>
        <div className="offer-card orange">
          <span>Best Sellers</span>
          <strong>Kitchen & Home</strong>
          <p>Fresh deals this week</p>
        </div>
        <div className="offer-card green">
          <span>Fashion Picks</span>
          <strong>New Arrivals</strong>
          <p>Curated for you</p>
        </div>
      </section>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            <Zap size={16} />
            Blockchain Powered
          </span>

          <h1>
            Shop smarter.
            <br />
            <span>Trade securely.</span>
          </h1>

          <p>
            Discover amazing products with secure,
            blockchain-verified transactions.
          </p>

          <button
            className="shop-btn"
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Shop Now →
          </button>
        </div>

        <div className="hero-visual">
          <div className="blockchain-card">
            <div className="chain-icon">⛓️</div>

            <h3>Secure Marketplace</h3>

            <p>Verified on Blockchain</p>

            <div className="verified">
              <ShieldCheck size={18} />
              Verified Transaction
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits">
        <div>
          <ShieldCheck />

          <div>
            <strong>Blockchain Verified</strong>
            <p>Secure transactions</p>
          </div>
        </div>

        <div>
          <Truck />

          <div>
            <strong>Fast Delivery</strong>
            <p>Reliable shipping</p>
          </div>
        </div>

        <div>
          <Zap />

          <div>
            <strong>Best Deals</strong>
            <p>Great prices every day</p>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <main className="products-section" id="products">
        <div className="section-heading">
          <div>
            <h2>🔥 Trending Products</h2>
            <p>{filteredProducts.length} products available</p>
          </div>

          <div className="product-controls">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort products">
              <option value="relevance">Sort: Relevance</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} aria-label="Filter by price">
              <option value="all">Any price</option>
              <option value="2000">Under ₹2,000</option>
              <option value="5000">Under ₹5,000</option>
              <option value="20000">Under ₹20,000</option>
            </select>
            <label className="stock-filter">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              In stock only
            </label>
            <button className="view-all" onClick={() => { setSearch(""); setSelectedCategory("All"); setSortBy("relevance"); setMaxPrice("all"); setInStockOnly(false); }}>
              Clear filters
            </button>
          </div>
        </div>

        {loading ? (
          <h3>Loading products...</h3>
        ) : filteredProducts.length === 0 ? (
          <h3>No products found.</h3>
        ) : (
          <>
            {categoryGroups.map((group) => (
              <section key={group.category} className="category-group" style={{ marginBottom: "28px" }}>
                <div className="section-heading" style={{ marginBottom: "16px" }}>
                  <div>
                    <h2>{group.category}</h2>
                    <p>{group.products.length} items</p>
                  </div>
                </div>

                <div className="product-grid">
                  {group.products.map((product) => (
                    <div
                      className="product-card"
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      style={{ cursor: "pointer" }}
                    >
                      <button
                        className="wishlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                      >
                        <Heart
                          size={19}
                          fill={
                            wishlist.some(
                              (item) => item.id === product.id
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      <div className="product-image">
                        <img src={getProductImage(product.name)} alt={product.name} />
                      </div>

                      <div className="product-info">
                        <small>{group.category}</small>

                        <h3>{product.name}</h3>

                        <div className="rating">
                          🔗 Verified Seller
                        </div>

                        <div className="price">
                          ₹{product.price.toLocaleString("en-IN")}
                        </div>

                        <p className="product-description">{product.description}</p>

                        <span className="discount">
                          Blockchain Verified
                        </span>

                        <div className="delivery">
                          <Truck size={15} />
                          {product.stock > 0 ? `${product.stock} available · Fast delivery` : "Currently out of stock"}
                        </div>

                        <button
                          className="add-cart"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          disabled={!product.stock}
                        >
                          {product.stock ? "Add to Cart" : "Out of Stock"}
                        </button>
                        <button
                          className="buy-now"
                          onClick={(e) => {
                            e.stopPropagation();
                            buyNow(product);
                          }}
                          disabled={!product.stock}
                        >
                          {product.stock ? "Buy Now" : "Unavailable"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="section-heading" style={{ marginTop: "8px" }}>
              <div>
                <h2>All Products</h2>
                <p>{filteredProducts.length} products available</p>
              </div>
            </div>

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div
                  className="product-card"
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: "pointer" }}
                >
                  <button
                    className="wishlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                  >
                    <Heart
                      size={19}
                      fill={
                        wishlist.some(
                          (item) => item.id === product.id
                        )
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  <div className="product-image">
                    <img src={getProductImage(product.name)} alt={product.name} />
                  </div>

                  <div className="product-info">
                    <small>{getProductCategory(product)}</small>

                    <h3>{product.name}</h3>

                    <div className="rating">
                      🔗 Verified Seller
                    </div>

                    <div className="price">
                      ₹{product.price.toLocaleString("en-IN")}
                    </div>

                    <p className="product-description">{product.description}</p>

                    <span className="discount">
                      Blockchain Verified
                    </span>

                    <div className="delivery">
                      <Truck size={15} />
                      {product.stock > 0 ? `${product.stock} available · Fast delivery` : "Currently out of stock"}
                    </div>

                    <button
                      className="add-cart"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      disabled={!product.stock}
                    >
                      {product.stock ? "Add to Cart" : "Out of Stock"}
                    </button>
                    <button
                      className="buy-now"
                      onClick={(e) => {
                        e.stopPropagation();
                        buyNow(product);
                      }}
                      disabled={!product.stock}
                    >
                      {product.stock ? "Buy Now" : "Unavailable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer>
        <div>
          <h2>⛓️ BlockMart</h2>

          <p>
            Your trusted blockchain-powered marketplace.
          </p>
        </div>

        <div>
          <h4>Marketplace</h4>

          <p onClick={() => setSearch("")}>Products</p>

          <p>Categories</p>

          <p>Deals</p>
        </div>

        <div>
          <h4>Blockchain</h4>

          <p>Verified Transactions</p>

          <p>Fraud Protection</p>

          <p>Secure Payments</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

