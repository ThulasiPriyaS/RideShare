import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CopyIcon, CheckIcon, QrCodeIcon, SmartphoneIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpiPaymentProps {
  amount: number;
  merchantUpi: string;
  merchantName: string;
  onPaymentComplete: () => void;
}

const UpiPayment: React.FC<UpiPaymentProps> = ({
  amount,
  merchantUpi,
  merchantName,
  onPaymentComplete
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'phone'>('qr');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopied(true);
    
    toast({
      title: 'UPI ID copied!',
      description: 'Paste it in your UPI app to complete payment',
    });
    
    setTimeout(() => setCopied(false), 3000);
  };

  const generateQRCode = () => {
    // In a real app, this would generate a proper UPI QR code
    // For now, we'll create a mock QR code display
    const upiUrl = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;
    
    return (
      <div className="bg-white p-6 rounded-lg flex flex-col items-center">
        <div className="border-4 border-primary p-4 rounded-lg mb-4 w-48 h-48 flex items-center justify-center">
          <QrCodeIcon className="w-32 h-32 text-primary" />
          <div className="absolute bg-white p-1 rounded">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png" 
                 alt="UPI" 
                 className="h-8 w-auto" />
          </div>
        </div>
        <p className="text-sm mb-2">Scan with any UPI app</p>
        <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md w-full">
          <p className="text-sm font-mono flex-1 truncate">{merchantUpi}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleCopyUpiId}
          >
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };

  const generatePhoneInput = () => {
    return (
      <div className="bg-white p-6 rounded-lg">
        <div className="mb-4">
          <Label htmlFor="upi-id">Enter UPI ID</Label>
          <div className="flex mt-1">
            <Input 
              id="upi-id" 
              type="text" 
              placeholder="yourname@upi"
              className="rounded-r-none"
            />
            <Button className="rounded-l-none">Pay ₹{amount.toFixed(2)}</Button>
          </div>
        </div>
        
        <div className="text-center my-4">
          <p className="text-sm text-gray-500">OR</p>
        </div>
        
        <div>
          <Label htmlFor="phone-number">Enter Phone Number</Label>
          <div className="flex mt-1">
            <Input 
              id="phone-number" 
              type="tel" 
              placeholder="1234567890"
              className="rounded-r-none" 
            />
            <Button className="rounded-l-none">Pay ₹{amount.toFixed(2)}</Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            We'll find the UPI ID associated with this phone number
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-1">UPI Payment</h3>
        <p className="text-gray-500">Amount: ₹{amount.toFixed(2)}</p>
      </div>
      
      <RadioGroup 
        defaultValue="qr" 
        className="grid grid-cols-2 gap-4"
        onValueChange={(value) => setPaymentMethod(value as 'qr' | 'phone')}
      >
        <div>
          <RadioGroupItem 
            value="qr" 
            id="qr" 
            className="peer sr-only" 
          />
          <Label
            htmlFor="qr"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <QrCodeIcon className="mb-3 h-6 w-6" />
            Scan QR Code
          </Label>
        </div>
        
        <div>
          <RadioGroupItem 
            value="phone" 
            id="phone" 
            className="peer sr-only" 
          />
          <Label
            htmlFor="phone"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <SmartphoneIcon className="mb-3 h-6 w-6" />
            Phone Number
          </Label>
        </div>
      </RadioGroup>
      
      <div className="mt-4">
        {paymentMethod === 'qr' ? generateQRCode() : generatePhoneInput()}
      </div>
      
      <Button 
        className="w-full mt-6" 
        onClick={onPaymentComplete}
      >
        I've Completed the Payment
      </Button>
    </div>
  );
};

export default UpiPayment;