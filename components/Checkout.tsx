import React, { useState } from 'react';
import { Check, CreditCard, Banknote, MapPin, ChevronLeft, Home, Briefcase } from 'lucide-react';

interface CheckoutProps {
  total: number;
  onPlaceOrder: (address: any, paymentMethod: string) => void;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ total, onPlaceOrder, onBack }) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [address, setAddress] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    secondaryPhone: '',
    houseNo: '',
    floorNo: '',
    street: '',
    city: '',
    state: '',
    country: 'India',
    zip: '',
    addressType: 'HOME' as 'HOME' | 'OFFICE'
  });

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    onPlaceOrder(address, paymentMethod);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ChevronLeft size={20} /> Back to Cart
        </button>
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 dark:bg-white/10 -z-10"></div>
          
          <div className={`flex flex-col items-center gap-2 bg-creamLight dark:bg-bgDarker px-4 ${step >= 1 ? 'text-primaryGreen' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'bg-primaryGreen text-white border-primaryGreen' : 'bg-white dark:bg-bgDark border-gray-300'}`}>1</div>
            <span className="text-sm font-medium">Address</span>
          </div>
          
          <div className={`flex flex-col items-center gap-2 bg-creamLight dark:bg-bgDarker px-4 ${step >= 2 ? 'text-primaryGreen' : 'text-gray-400'}`}>
             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'bg-primaryGreen text-white border-primaryGreen' : 'bg-white dark:bg-bgDark border-gray-300'}`}>2</div>
            <span className="text-sm font-medium">Payment</span>
          </div>

          <div className={`flex flex-col items-center gap-2 bg-creamLight dark:bg-bgDarker px-4 ${step >= 3 ? 'text-primaryGreen' : 'text-gray-400'}`}>
             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 3 ? 'bg-primaryGreen text-white border-primaryGreen' : 'bg-white dark:bg-bgDark border-gray-300'}`}>3</div>
            <span className="text-sm font-medium">Done</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-bgDark p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-white/5">
        
        {/* Step 1: Address */}
        {step === 1 && (
          <form onSubmit={handleAddressSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-cream mb-6 flex items-center gap-2">
              <MapPin className="text-primaryGreen" /> Delivery Address
            </h2>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" placeholder="John Doe" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input required type="email" value={address.email} onChange={e => setAddress({...address, email: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" placeholder="john@example.com" />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                <div className="flex gap-2">
                  <select 
                    value={address.countryCode} 
                    onChange={e => setAddress({...address, countryCode: e.target.value})}
                    className="w-28 bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-2 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+7">🇷🇺 +7</option>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+27">🇿🇦 +27</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input required type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="flex-1 bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" placeholder="9876543210" />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Mobile (Optional)</label>
                <input type="tel" value={address.secondaryPhone} onChange={e => setAddress({...address, secondaryPhone: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" placeholder="Alternate Number" />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-white/5" />

            {/* Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="col-span-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">House / Flat No.</label>
                <input required value={address.houseNo} onChange={e => setAddress({...address, houseNo: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" placeholder="B-402" />
              </div>
              <div className="col-span-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor No. (Optional)</label>
                <input value={address.floorNo} onChange={e => setAddress({...address, floorNo: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" placeholder="4th Floor" />
              </div>
              
              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address / Locality</label>
                <input required value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" placeholder="Near City Center" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <input required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <input required value={address.country} onChange={e => setAddress({...address, country: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP / Postal Code</label>
                <input required value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="w-full bg-gray-50 dark:bg-bgDarker text-gray-900 dark:text-cream px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primaryGreen" />
              </div>
            </div>

            {/* Address Type */}
            <div className="pt-2">
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Save Address As</label>
               <div className="flex gap-4">
                 <button 
                   type="button"
                   onClick={() => setAddress({...address, addressType: 'HOME'})}
                   className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${address.addressType === 'HOME' ? 'border-primaryGreen bg-primaryGreen/5 text-primaryGreen font-bold' : 'border-gray-200 dark:border-white/10 text-gray-500'}`}
                 >
                   <Home size={20} /> Home
                 </button>
                 <button 
                   type="button"
                   onClick={() => setAddress({...address, addressType: 'OFFICE'})}
                   className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${address.addressType === 'OFFICE' ? 'border-primaryGreen bg-primaryGreen/5 text-primaryGreen font-bold' : 'border-gray-200 dark:border-white/10 text-gray-500'}`}
                 >
                   <Briefcase size={20} /> Office
                 </button>
               </div>
            </div>

            <button type="submit" className="w-full bg-primaryGreen text-white font-bold py-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all mt-4">
              Save & Continue to Payment
            </button>
          </form>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-cream mb-6 flex items-center gap-2">
              <CreditCard className="text-primaryGreen" /> Payment Method
            </h2>

            <div className="space-y-3">
              {[
                { id: 'UPI', label: 'UPI / Net Banking', icon: <CreditCard size={20} /> },
                { id: 'CARD', label: 'Credit / Debit Card', icon: <CreditCard size={20} /> },
                { id: 'COD', label: 'Cash on Delivery', icon: <Banknote size={20} /> }
              ].map((method) => (
                <div 
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${paymentMethod === method.id ? 'border-primaryGreen bg-primaryGreen/5' : 'border-gray-200 dark:border-white/10 hover:border-primaryGreen/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === method.id ? 'bg-primaryGreen text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                      {method.icon}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-cream">{method.label}</span>
                  </div>
                  {paymentMethod === method.id && <div className="w-4 h-4 rounded-full bg-primaryGreen shadow-sm"></div>}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl mt-6">
              <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-cream">
                <span>Total to Pay</span>
                <span>₹{total}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                 Delivering to: <span className="font-medium text-gray-700 dark:text-gray-300">{address.name}, {address.houseNo} {address.street}, {address.city}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl border border-gray-300 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                Edit Address
              </button>
              <button onClick={handleFinalSubmit} className="flex-[2] bg-primaryGreen text-white font-bold py-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all">
                Place Order
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;