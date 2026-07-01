import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CheckoutStatusCard from './CheckoutStatusCard';

test('renders pending M-Pesa checkout summary', () => {
  render(
    <CheckoutStatusCard
      paymentStatus="pending"
      paymentMethod="mpesa"
      transactionId=""
      otpVerified={false}
    />
  );

  expect(screen.getByText(/payment status/i)).toBeInTheDocument();
  expect(screen.getByText(/pending/i)).toBeInTheDocument();
  expect(screen.getByText(/m-pesa/i)).toBeInTheDocument();
  expect(screen.getByText(/otp verified/i)).toBeInTheDocument();
  expect(screen.getByText(/not yet/i)).toBeInTheDocument();
});
