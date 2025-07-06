# 🤝 Contributing to MCP AI-Enhanced Code Generator

Thank you for your interest in contributing to the MCP AI-Enhanced Code Generator! We welcome contributions from developers of all skill levels.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Use the [bug report template](https://github.com/lionel1021/mcp-code-generator/issues/new?template=bug_report.md)
- Include detailed steps to reproduce
- Provide environment information
- Include screenshots if applicable

### 💡 Feature Requests
- Use the [feature request template](https://github.com/lionel1021/mcp-code-generator/issues/new?template=feature_request.md)
- Explain the use case and benefits
- Provide examples or mockups if possible

### 🔧 Code Contributions
- Check existing [issues](https://github.com/lionel1021/mcp-code-generator/issues) for inspiration
- Look for [`good first issue`](https://github.com/lionel1021/mcp-code-generator/labels/good%20first%20issue) labels
- Fork, implement, and submit a pull request

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/mcp-code-generator.git
   cd mcp-code-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Code Guidelines

### Code Style
- Use **TypeScript** for all new code
- Follow existing code formatting (Prettier)
- Use **ESLint** rules consistently
- Write **JSDoc** comments for public APIs

### Naming Conventions
- Use **camelCase** for variables and functions
- Use **PascalCase** for components and classes
- Use **kebab-case** for file names
- Use **UPPER_CASE** for constants

### File Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── features/       # Feature-specific components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

### Component Guidelines
```typescript
// ✅ Good: Proper component structure
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  children, 
  onClick 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- Button.test.tsx
```

### Writing Tests
- Write unit tests for all new functions
- Write integration tests for complex features
- Use React Testing Library for component tests
- Aim for >80% code coverage

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 📝 Commit Guidelines

### Commit Message Format
Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(components): add AI code generation button
fix(api): resolve authentication timeout issue
docs(readme): update installation instructions
test(utils): add unit tests for helper functions
```

## 🔍 Pull Request Process

### Before Submitting
1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Run linting** and fix any issues
4. **Write meaningful commit messages**
5. **Rebase** your branch on latest main

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of the code completed
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated if needed
- [ ] No merge conflicts with main branch
- [ ] All CI checks pass

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here
```

## 🏷️ Issue Labels

| Label | Description |
|-------|-------------|
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Documentation needs |
| `priority: high` | High priority issue |

## 🤝 Code of Conduct

### Our Standards
- **Be respectful** and inclusive
- **Be collaborative** and helpful
- **Be patient** with newcomers
- **Give constructive feedback**
- **Focus on what's best** for the community

### Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers.

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions in project updates

## ❓ Need Help?

- 📖 Check the [documentation](README.md)
- 🐛 Search [existing issues](https://github.com/lionel1021/mcp-code-generator/issues)
- 💬 Start a [discussion](https://github.com/lionel1021/mcp-code-generator/discussions)
- 📧 Contact maintainers directly

---

**Thank you for contributing to MCP AI-Enhanced Code Generator! 🚀**