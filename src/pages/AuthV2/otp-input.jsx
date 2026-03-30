import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({ value, onChange, length = 6, disabled = false }) {
  if (length < 0 || !Number.isInteger(length)) {
    throw new Error("Length must be a non-negative integer.");
  }

  const [otp, setOtp] = useState(
    Array(length).fill("")
  );
  const inputRefs = useRef([]);

  useEffect(() => {
    // Initialize refs array
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    // Reset OTP state when value prop changes
    if (value) {
      setOtp(Array(length).fill("")); // Reset to empty fields
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const newValue = e.target.value;

    // Only accept digits
    if (newValue && !/^\d+$/.test(newValue)) {
      return;
    }

    // Prevent email addresses from being entered
    if (newValue.includes('@')) {
      e.target.value = ''; // Clear the input if it contains '@'
      return;
    }

    // Take only the last character if multiple are pasted
    const digit = newValue.slice(-1);

    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Call the onChange callback with the new OTP string
    onChange(newOtp.join(""));

    // Move focus to the next input if a digit was entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus to the previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Move focus to the next input on right arrow
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Move focus to the previous input on left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Only accept digits
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    // Take only up to 'length' characters
    const digits = pastedData.slice(0, length).split("");

    // Fill the OTP array with the pasted digits
    const newOtp = [...Array(length).fill("")];
    digits.forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handleFocus = (e) => {
    e.target.value = ''; // Clear the input on focus
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          pattern="[0-9]*"
          value={otp[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={handleFocus} // Clear input on focus
          disabled={disabled}
          className={cn(
            "h-12 w-12 rounded-md border border-input bg-background text-center text-lg font-semibold shadow-sm transition-all",
            "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            disabled && "cursor-not-allowed opacity-50"
          )}
        />
      ))}
    </div>
  );
}
