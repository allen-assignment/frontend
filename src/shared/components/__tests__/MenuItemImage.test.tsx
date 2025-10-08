import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MenuItemImage from '../MenuItemImage';

describe('MenuItemImage', () => {
  it('renders placeholder when no src is provided', () => {
    render(<MenuItemImage alt="Test item" />);
    expect(screen.getByText('No Image')).toBeInTheDocument();
    // Check for ImageOff icon (Lucide icon)
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders image when src is provided', async () => {
    render(<MenuItemImage src="https://example.com/image.jpg" alt="Test item" />);
    const img = screen.getByAltText('Test item');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders placeholder when image fails to load', async () => {
    render(<MenuItemImage src="https://invalid-url.com/image.jpg" alt="Test item" />);
    const img = screen.getByAltText('Test item');
    expect(img).toBeInTheDocument();
    
    // Simulate image load error
    img.dispatchEvent(new Event('error'));
    
    // Wait for the error state to update and show placeholder
    await waitFor(() => {
      expect(screen.getByText('No Image')).toBeInTheDocument();
    });
  });

  it('shows loading spinner while image is loading', () => {
    render(<MenuItemImage src="https://example.com/image.jpg" alt="Test item" />);
    // Should show loading spinner initially
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('does not render placeholder when showPlaceholder is false', () => {
    render(<MenuItemImage alt="Test item" showPlaceholder={false} />);
    expect(screen.queryByText('No Image')).not.toBeInTheDocument();
  });
});
