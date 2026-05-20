import { Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface IProps {
  otpCount?: number;
  staticTimer: {
    minute: number;
    second: number;
  };
  onRetry?: () => void;
  onFinish: (otp: string) => void;
}

const OtpVerificationForm: React.FC<IProps> = ({ otpCount = 6, staticTimer, onRetry, onFinish }) => {
  const otpInputRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(Array.from({ length: otpCount }).map(() => ''));
  const [timer, setTimer] = useState(staticTimer);

  const handlePasteFn = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clip = e.clipboardData.getData('text').trim();
    const trimmedClip = clip.substring(0, otpCount);

    if (!new RegExp(`\\d{${otpCount}}`).test(trimmedClip)) return e.preventDefault();

    const newValues = [...trimmedClip.split('')];
    setOtpValues(newValues);
    otpInputRefs.current[otpCount - 1].focus();
  };

  const handleInputFn = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const newValues = [...otpValues];
    newValues[idx] = e.target.value.slice(-1);
    setOtpValues(newValues);

    if (e.target.value && idx < otpCount - 1) otpInputRefs.current[idx + 1].focus();
  };

  const handleKeyDownFn = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    const target = e.target as HTMLInputElement;
    const newValues = [...otpValues];

    if (!target.value && e.key === 'Backspace' && idx) {
      newValues[idx - 1] = '';
      setOtpValues(newValues);
      otpInputRefs.current[idx - 1].focus();
    }
  };

  useEffect(() => {
    const ctrlTimer = setInterval(() => {
      if (timer.second > 0) setTimer({ ...timer, second: timer.second - 1 });
      else if (timer.minute > 0) setTimer({ minute: timer.minute - 1, second: 59 });
      else clearInterval(ctrlTimer);
    }, 1000);

    return () => clearInterval(ctrlTimer);
  }, [timer]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold">Confirm Your Email</h3>
        <p className="text-gray-500">Enter the {otpCount} digit code which sent to your email</p>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-2">
        {Array.from({ length: otpCount }).map((_, idx) => (
          <input
            key={idx}
            type="number"
            maxLength={1}
            value={otpValues[idx]}
            onPaste={handlePasteFn}
            onKeyDown={(e) => handleKeyDownFn(e, idx)}
            onInput={(e: React.FormEvent<HTMLInputElement>) => handleInputFn(e as React.ChangeEvent<HTMLInputElement>, idx)}
            ref={(input: any) => (otpInputRefs.current[idx] = input)}
            className="w-8 h-8 text-center border border-gray-300 focus-visible:outline-[var(--color-primary-500)] rounded-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none bg-white dark:bg-black/50"
          />
        ))}
      </div>
      <span>
        {timer.minute}:{timer.second < 10 ? `0${timer.second}` : timer.second}
      </span>
      {onRetry && (
        <div className="flex items-center gap-2">
          <p className="text-orange-500">Didn't get OTP?</p>
          <button
            className={
              timer.minute === 0 && timer.second === 0
                ? 'text-black dark:text-white cursor-pointer'
                : 'text-gray-300 cursor-not-allowed'
            }
            onClick={() => {
              onRetry();
              setTimer(staticTimer);
            }}
            disabled={timer.minute !== 0 && timer.second !== 0}
          >
            Retry
          </button>
        </div>
      )}
      <Button
        type="primary"
        onClick={() => onFinish(otpValues.join(''))}
        disabled={otpValues.join('').length !== otpCount}
      >
        Verify
      </Button>
    </div>
  );
};

export default OtpVerificationForm;
