import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

const SimpleComponent = () => <div>Hello Vitest</div>;

describe('Simple Test', () => {
    it('renders correctly', () => {
        render(<SimpleComponent />);
        expect(screen.getByText('Hello Vitest')).toBeInTheDocument();
    });
});
