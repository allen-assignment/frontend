## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   - Customer Interface: http://localhost:3000
   - Merchant Interface: http://localhost:3000/merchant

## 📜 Available Scripts

### `npm run dev`
Runs the app in development mode using Vite.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`
Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm test`
Launches the test runner using Vitest.\
Runs tests in watch mode and provides interactive feedback.

### `npm run test:ui`
Launches the test runner with a web UI.\
Provides a visual interface for running and debugging tests.

### `npm run test:run`
Runs tests once and exits.\
Useful for CI/CD pipelines.

## 🏗️ Project Structure

```
src/
├── customer_side/          # Customer interface components
│   ├── components/         # Customer-specific components
│   ├── context/           # Customer context providers
│   └── CustomerApp.tsx    # Main customer app
├── merchant_side/         # Merchant interface components
│   ├── components/        # Merchant-specific components
│   └── MerchantApp.tsx    # Main merchant app
├── shared/                # Shared components and utilities
│   ├── components/        # Reusable components
│   └── context/           # Global context providers
├── pages/                 # Page components (login, profile, etc.)
├── services/              # API services
├── types/                 # TypeScript type definitions
├── data/                  # Static data files
├── edit/                  # Edit page components
└── test/                  # Test setup files
```

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Testing**: Vitest + Testing Library
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 🔧 Configuration

### Vite Configuration
The project uses Vite for fast development and building. Configuration is in `vite.config.ts`.

### TypeScript Configuration
TypeScript configuration is in `tsconfig.json` with strict type checking enabled.

## 🧪 Testing

### Running Tests
```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

### Test Structure
- Tests are located in `__tests__` directories
- Uses Vitest for fast test execution
- Includes component testing with Testing Library

## 📱 Features

### Customer Features
- Interactive menu browsing
- Shopping cart management
- Order tracking
- User authentication
- Order history

### Merchant Features
- Menu management
- Order processing
- OCR menu recognition
- Analytics dashboard

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist` directory and can be deployed to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Build the project: `npm run build`
6. Submit a pull request

## 📚 Learn More

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vitest Documentation](https://vitest.dev/)
