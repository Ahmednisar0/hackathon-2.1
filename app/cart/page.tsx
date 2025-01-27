'use client'
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  title: string;
  price: number;
  imgSrc: string;
  rating: number;
  oldPrice?: number;
  discount?: number;
  quantity: number;
}

const Index = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0); //this isn Discount state
  const [isPromoApplied, setIsPromoApplied] = useState(false); // State for promo application

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const validatedCart = parsedCart.map((item: Product) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
        }));
        setCart(validatedCart);
      } catch (error) {
        console.error("Error parsing cart:", error);
        setCart([]);
      }
    }
    setIsLoading(false);
  }, []);

  const updateQuantity = (productTitle: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map((product) =>
      product.title === productTitle
        ? { ...product, quantity: Number(newQuantity) }
        : product
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (productToRemove: Product) => {
    const updatedCart = cart.filter(
      (product) => product.title !== productToRemove.title
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success(`${productToRemove.title} removed from cart`);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, product) => {
      const price = Number(product.price) || 0;
      const quantity = Number(product.quantity) || 0;
      return total + price * quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingFee = subtotal > 200 ? 0 : 15; // Updated shipping fee 
    const total = subtotal + shippingFee - discount; // Appling  discount
    return total < 0 ? 0 : total; // Ensure total is not negative
  };

  const applyPromoCode = () => {
    const subtotal = calculateSubtotal();
    if (promoCode === "shop.co") { // promo code "MUSKAN"
      const discountAmount = subtotal * 0.1; // Calculate 10% discount
      setDiscount(discountAmount);
      setIsPromoApplied(true); // Mark promo as applied
      toast.success("Promo code applied! 10% discount granted.");
    } else {
      setDiscount(0); // Reset discount if code is invalid
      setIsPromoApplied(false); // Reset promo applied state
      toast.error("Invalid promo code.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-800 mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence>
              {cart.map((product) => (
                <motion.div
                  key={product.title}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl p-6 mb-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out border border-neutral-100"
                >
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100">
                      <img
                        src={product.imgSrc}
                        alt={product.title}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-neutral-800 mb-2">
                        {product.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center border border-neutral-200 rounded-full">
                            <button
                              onClick={() => updateQuantity(product.title, product.quantity - 1)}
                              className="p-2 hover:bg-neutral-100 rounded-l-full transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center">{product.quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.title, product.quantity + 1)}
                              className="p-2 hover:bg-neutral-100 rounded-r-full transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(product)}
                            className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-red-700" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-medium text-neutral-800">
                            ${(Number(product.price) * Number(product.quantity)).toFixed(2)}
                          </p>
                          {product.oldPrice && (
                            <p className="text-sm text-neutral-400 line-through">
                              ${(Number(product.oldPrice) * Number(product.quantity)).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 sticky top-4"
            >
              <h2 className="text-xl  font-bold text-neutral-800 mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>{calculateSubtotal() > 200 ? 'Free' : '$15.00'}</span>
                </div>

                <div className="flex justify-between text-red-600">
                  <span>Promo Code Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>

                <div className="h-px bg-neutral-100 my-4"></div>

                <div className="flex justify-between text-lg font-medium text-neutral-800">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code shop.co"
                    className="border border-neutral-300 rounded-md p-2 w-full"
                  />
                  <button
                    onClick={applyPromoCode}
                    className={`w-full py-2 rounded-md mt-2 transition-colors duration-300 ${isPromoApplied ? 'bg-green-600' : 'bg-gray-600'} text-white`}
                  >
                    {isPromoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>

                <button className="w-full bg-black text-white py-4 rounded-full hover:bg-neutral-800 transition-colors duration-300 mt-6">
                  Proceed to Checkout
                </button>

                <p className="text-xs text-center text-red-600 mt-4">
                  Free shipping on orders over $200
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
