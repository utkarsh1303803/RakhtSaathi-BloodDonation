# Contributing to RakhtSaathi 🩸

Thank you for considering contributing to RakhtSaathi! Your help is essential for making this life-saving platform better.

## 🌟 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (browser, OS, etc.)

### Suggesting Features 💡

Feature suggestions are welcome! Please:

- **Check existing suggestions** first
- **Describe the feature** in detail
- **Explain the use case** and benefits
- **Consider implementation** complexity

### Code Contributions 💻

#### Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/yourusername/RakhtSaathi-BloodDonation.git
   cd RakhtSaathi-BloodDonation
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

**Code Style**
- Follow existing code conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

**Component Structure**
- Create reusable components
- Keep state management simple
- Use Context API for global state
- Follow React best practices

**File Organization**
```
src/
├── components/     # Reusable UI components
├── pages/          # Route-based page components
├── services/       # API and external services
├── context/        # React Context providers
├── utils/          # Helper functions
└── i18n/           # Internationalization files
```

**Testing**
- Test your changes thoroughly
- Use mock mode for testing without Firebase
- Check both Hindi and English translations
- Verify mobile responsiveness

#### Making Changes

1. **Write clean code** following project conventions
2. **Test thoroughly** in both mock and Firebase modes
3. **Update documentation** if needed
4. **Commit with clear messages**:
   ```bash
   git commit -m "Add feature: description of what you did"
   ```

#### Submitting Pull Requests

1. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Open a Pull Request** with:
   - Clear title describing the change
   - Detailed description of what and why
   - Screenshots for UI changes
   - Reference to related issues

3. **Respond to feedback** and make requested changes

## 🌐 Adding Language Support

To add a new language:

1. Create translation file in `src/i18n/locales/`
2. Add language to `i18n.js` configuration
3. Update `LanguageSwitcher` component
4. Test all pages in the new language

## 📋 Areas Needing Help

### High Priority
- [ ] Mobile app development (React Native)
- [ ] SMS notification integration
- [ ] Advanced search and filters
- [ ] Performance optimization
- [ ] Automated testing

### Medium Priority
- [ ] Additional language support (Tamil, Telugu, Bengali, etc.)
- [ ] Dark mode theme
- [ ] Accessibility improvements
- [ ] Better error handling
- [ ] Documentation improvements

### Good First Issues
- [ ] UI/UX enhancements
- [ ] Translation corrections
- [ ] Code refactoring
- [ ] Adding comments and documentation
- [ ] Bug fixes

## 🔒 Security Issues

**DO NOT** open public issues for security vulnerabilities. Instead:
- Email security concerns privately
- Provide detailed description
- Allow time for fixes before disclosure

## 💬 Communication

- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions
- **Discussions**: General questions and ideas

## 📜 Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Be collaborative** and supportive
- **Accept constructive criticism** gracefully
- **Focus on what's best** for the community
- **Show empathy** towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing private information
- Any unprofessional conduct

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

All contributors will be recognized in our documentation. Thank you for helping save lives!

---

**Questions?** Feel free to ask in GitHub Discussions or open an issue.

**Ready to contribute?** Pick an issue or suggest a new feature and let's build something amazing together! 🚀
