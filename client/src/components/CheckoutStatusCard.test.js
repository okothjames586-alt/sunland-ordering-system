import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CheckoutStatusCard from './CheckoutStatusCard';

test('does not render checkout status details', () => {
  const { container } = render(
    <CheckoutStatusCard
      paymentStatus="pending"
      paymentMethod="mpesa"
      transactionId=""
    />
  );

  expect(container).toBeEmptyDOMElement();
});
