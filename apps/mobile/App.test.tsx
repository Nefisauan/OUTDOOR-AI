import { render, screen } from '@testing-library/react-native';
import App from './App';

test('shows an accessible foundation screen with honest feature availability', () => {
  render(<App />);
  expect(screen.getByRole('header', { name: 'Outdoor AI' })).toBeTruthy();
  expect(screen.getByText('Look. Ask. Play.')).toBeTruthy();
  expect(screen.getByText('Golf features will arrive in later phases.')).toBeTruthy();
});
