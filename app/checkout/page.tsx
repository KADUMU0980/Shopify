'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const STEPS = ['Shipping', 'Payment', 'Review', 'Confirm'];

const INDIAN_STATES = ['Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Other'];

interface Address {
  fullName: string; phone: string; address: string; city: string; state: string; pincode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address>({ fullName: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [payment, setPayment] = useState<'cod' | 'upi' | 'card'>('cod');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (!items.length && step < 3) { router.push('/cart'); return null; }

  const subtotal = totalPrice();
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax      = Math.round(subtotal * 0.18);
  const total    = subtotal + shipping + tax;

  const validateAddress = () => {
    const { fullName, phone, address: addr, city, state, pincode } = address;
    if (!fullName || !phone || !addr || !city || !state || !pincode) { toast.error('Please fill all address fields'); return false; }
    if (!/^\d{10}$/.test(phone)) { toast.error('Enter a valid 10-digit phone number'); return false; }
    if (!/^\d{6}$/.test(pincode)) { toast.error('Enter a valid 6-digit pincode'); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateAddress()) return;
    setStep(s => s + 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, slug: i.slug, name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
          shippingAddress: { ...address, country: 'India' },
          paymentMethod: payment,
          totalAmount: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrderId(data._id);
      clearCart();
      setStep(3);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-8 max-w-4xl">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-bold transition-all duration-300 ${
              i < step ? 'bg-success border-success text-white' :
              i === step ? 'bg-brand border-brand text-white' :
              'border-gray-300 text-gray-400'
            }`}>
              {i < step ? <CheckCircleIcon className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block ${i <= step ? 'text-gray-800' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-3 transition-all duration-300 ${i < step ? 'bg-success' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              {(['fullName', 'phone', 'address', 'city', 'pincode'] as const).map(field => (
                <div key={field}>
                  <label className="label capitalize">{field === 'fullName' ? 'Full Name' : field}</label>
                  <input className="input" value={address[field]} onChange={e => setAddress(a => ({ ...a, [field]: e.target.value }))}
                    placeholder={field === 'phone' ? '10-digit mobile number' : field === 'pincode' ? '6-digit pincode' : ''} />
                </div>
              ))}
              <div>
                <label className="label">State</label>
                <select className="input" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              {[
                { value: 'cod',  label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                { value: 'upi',  label: 'UPI Payment',       icon: '📱', desc: 'Pay via UPI / Google Pay / PhonePe' },
                { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay accepted' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payment === opt.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={opt.value} checked={payment === opt.value}
                    onChange={e => setPayment(e.target.value as 'cod' | 'upi' | 'card')} className="accent-accent w-4 h-4" />
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 mb-3">📦 Delivery to</h3>
                <p className="text-sm text-gray-700 font-medium">{address.fullName} — {address.phone}</p>
                <p className="text-sm text-gray-500">{address.address}, {address.city}, {address.state} - {address.pincode}</p>
              </div>
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 mb-3">💳 Payment: <span className="text-accent uppercase">{payment}</span></h3>
              </div>
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 mb-3">🛒 Items ({items.length})</h3>
                <div className="space-y-3">
                  {items.map(i => (
                    <div key={i.productId} className="flex justify-between text-sm">
                      <span className="text-gray-700 line-clamp-1 flex-1 mr-4">{i.name} × {i.quantity}</span>
                      <span className="font-semibold text-gray-900 flex-shrink-0">{formatPrice(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="card p-8 text-center">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircleIcon className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-500 mb-2">Thank you for shopping with ShopVerse 🎉</p>
              <p className="text-sm text-gray-400 mb-6">Order ID: <span className="font-mono font-bold text-gray-700">{orderId}</span></p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href={`/orders/${orderId}`}><Button variant="accent">Track Order</Button></Link>
                <Link href="/products"><Button variant="outline">Continue Shopping</Button></Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex justify-between mt-6">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(s => s - 1)}>← Back</Button>
              ) : <div />}
              {step < 2 ? (
                <Button variant="accent" onClick={handleNext}>Continue →</Button>
              ) : (
                <Button variant="accent" onClick={handlePlaceOrder} loading={loading}>
                  Place Order →
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        {step < 3 && (
          <div className="card p-5 h-fit sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Order Total</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-success' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>{formatPrice(tax)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
