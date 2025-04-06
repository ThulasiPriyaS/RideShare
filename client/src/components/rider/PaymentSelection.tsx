import { useState } from "react";
import { CreditCard, Banknote, Smartphone, Check, Plus, Users, ChevronRight } from "lucide-react";
import { PaymentMethod } from "@shared/schema";

interface PaymentSelectionProps {
  onPaymentSelect: (payment: PaymentMethod) => void;
  onToggleSplitFare: () => void;
  isSplitFareEnabled: boolean;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({ 
  onPaymentSelect,
  onToggleSplitFare,
  isSplitFareEnabled
}) => {
  // Available payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "cash",
      type: "cash",
      name: "Cash",
      icon: "cash",
      isDefault: true
    },
    {
      id: "upi",
      type: "upi",
      name: "UPI",
      icon: "upi"
    },
    {
      id: "card",
      type: "card",
      name: "Credit Card",
      icon: "card"
    },
    {
      id: "wallet",
      type: "wallet",
      name: "Wallet",
      icon: "wallet"
    }
  ];

  const [selectedPayment, setSelectedPayment] = useState<string>(
    paymentMethods.find(p => p.isDefault)?.id || paymentMethods[0].id
  );

  const handlePaymentSelection = (payment: PaymentMethod) => {
    setSelectedPayment(payment.id);
    onPaymentSelect(payment);
  };

  const getPaymentIcon = (icon: string) => {
    switch (icon) {
      case "cash":
        return <Banknote className="h-5 w-5" />;
      case "upi":
        return <Smartphone className="h-5 w-5" />;
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "wallet":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        );
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-semibold mb-3">Payment Method</h3>

      <div className="space-y-2 mb-4">
        {paymentMethods.map((payment) => (
          <div 
            key={payment.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
              selectedPayment === payment.id 
                ? "bg-[#276EF1]/5 border border-[#276EF1]" 
                : "hover:bg-gray-50 border border-transparent"
            }`}
            onClick={() => handlePaymentSelection(payment)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              selectedPayment === payment.id ? "bg-[#276EF1] text-white" : "bg-gray-100 text-gray-600"
            }`}>
              {getPaymentIcon(payment.icon)}
            </div>
            <div className="flex-1">
              <div className="font-medium">{payment.name}</div>
              {payment.type === "upi" && (
                <div className="text-xs text-[#6E6E6E]">Pay directly from your bank account</div>
              )}
              {payment.type === "card" && (
                <div className="text-xs text-[#6E6E6E]">XXXX-XXXX-XXXX-4242</div>
              )}
            </div>
            {selectedPayment === payment.id && (
              <Check className="h-5 w-5 text-[#276EF1]" />
            )}
          </div>
        ))}

        <div className="mt-2">
          <button className="flex items-center text-[#276EF1] py-2">
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Add Payment Method</span>
          </button>
        </div>
      </div>

      {/* Split fare option */}
      <div 
        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer"
        onClick={onToggleSplitFare}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#27AE60]/10 flex items-center justify-center mr-3">
            <Users className="h-5 w-5 text-[#27AE60]" />
          </div>
          <div>
            <div className="font-medium">Split Fare</div>
            <div className="text-xs text-[#6E6E6E]">Share the cost with friends</div>
          </div>
        </div>
        <div className="flex items-center">
          <div className={`w-10 h-6 rounded-full flex items-center transition ${isSplitFareEnabled ? 'bg-[#27AE60]' : 'bg-gray-300'}`}>
            <div className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${isSplitFareEnabled ? 'translate-x-4' : 'translate-x-1'}`}></div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;