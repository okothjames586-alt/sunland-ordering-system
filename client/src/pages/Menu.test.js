import { render, screen, within } from '@testing-library/react';
import Menu from './Menu';

test('shows flavor selectors for Delmonte and soda items', () => {
  render(<Menu />);

  const delmonteSelector = screen.getByLabelText(/delmonte variety/i);
  expect(delmonteSelector).toBeTruthy();
  expect(within(delmonteSelector).getByRole('option', { name: 'Mango' })).toBeTruthy();
  expect(within(delmonteSelector).getByRole('option', { name: 'Apple' })).toBeTruthy();

  const sodaSelector = screen.getByLabelText(/soda variety/i);
  expect(sodaSelector).toBeTruthy();
  expect(within(sodaSelector).getByRole('option', { name: 'Krest' })).toBeTruthy();
  expect(within(sodaSelector).getByRole('option', { name: 'Sprite' })).toBeTruthy();
});
