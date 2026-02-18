import './globals.css';

export const metadata = {
  title: 'Sports Calendar MVP',
  description: 'Personalized sports calendar for Mets, Giants, F1, NASCAR, and UCI WorldTour.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
