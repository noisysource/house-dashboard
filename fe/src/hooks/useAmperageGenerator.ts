// src/hooks/useAmperageGenerator.ts
import { useState, useEffect } from "react";

export const useAmperageGenerator = (initialValue: number) => {
  const [currentAmperage, setCurrentAmperage] = useState(initialValue);

  const generateAmperageValue = (previousValue: number) => {
    // Generate a random change amount (-3 to +3)
    const change = (Math.random() * 6) - 3;

    // Apply change to previous value
    let newValue = previousValue + change;

    // Ensure the value stays between 0 and 30
    newValue = Math.max(0, Math.min(45, newValue));

    // Round to 1 decimal place for cleaner display
    return Math.round(newValue * 10) / 10;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentAmperage(prev => generateAmperageValue(prev));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return currentAmperage;
};