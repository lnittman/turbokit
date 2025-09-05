# AI Agent Instructions

This document provides comprehensive instructions for AI agents working on this project. Follow these guidelines to ensure consistent, high-quality contributions.

## Project Context

### Documentation Structure
This project uses a standardized documentation structure:
- **01-vision/** - Strategic direction and business goals
- **02-design/** - Design philosophy and user experience
- **03-architecture/** - Technical architecture and system design
- **04-features/** - Feature specifications and requirements
- **05-ai/** - AI/ML systems and implementation
- **06-integration/** - External APIs and third-party services
- **07-deployment/** - Infrastructure and deployment processes
- **08-testing/** - Testing strategies and quality assurance
- **09-maintenance/** - Operations and troubleshooting

### Key Resources
- **[index.md](./index.md)** - Complete table of contents with navigation links
- **[glossary.md](./glossary.md)** - Project-specific terms and definitions
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guidelines for human contributors

## Core Principles

### 1. Documentation-First Approach
- **Always read existing documentation** before making changes
- **Update documentation** alongside code changes
- **Create new documentation** for new features or significant changes
- **Reference related documents** to maintain coherent knowledge structure

### 2. Consistency Standards
- **Follow established patterns** - Don't introduce new architectures without discussion
- **Use project terminology** - Refer to [glossary.md](./glossary.md) for consistent language
- **Maintain code style** - Follow project linting and formatting standards
- **Preserve existing naming conventions** - Don't rename without clear benefit

### 3. Quality Requirements
- **Write comprehensive tests** for all new functionality
- **Handle error cases gracefully** with proper logging and user feedback
- **Consider performance implications** of all changes
- **Ensure accessibility compliance** for all user-facing features
- **Validate security considerations** especially for authentication and data handling

## Working Guidelines

### Before Starting Any Task

1. **Read the relevant documentation sections**
   - Start with [01-vision/](./01-vision/) to understand project goals
   - Review [03-architecture/](./03-architecture/) for technical context
   - Check [04-features/](./04-features/) for existing feature specifications

2. **Understand the current state**
   - Review recent changes in version control
   - Check existing issues and pull requests
   - Validate current functionality before making changes

3. **Plan your approach**
   - Identify all files that will be affected
   - Consider backward compatibility requirements
   - Plan testing strategy for your changes

### During Development

1. **Follow established patterns**
   - Use existing component structures and naming conventions
   - Follow established error handling patterns
   - Maintain consistent logging and debugging approaches

2. **Write clear, maintainable code**
   - Include comprehensive comments for complex logic
   - Use descriptive variable and function names
   - Keep functions focused and single-purpose
   - Extract reusable logic into utility functions

3. **Test thoroughly**
   - Write unit tests for all new functions
   - Include integration tests for feature changes
   - Test edge cases and error conditions
   - Validate accessibility and usability

### After Completing Work

1. **Update documentation**
   - Update relevant files in the appropriate numbered directories
   - Add new terms to [glossary.md](./glossary.md) if needed
   - Update [index.md](./index.md) if new sections were added

2. **Validate your changes**
   - Run all tests and ensure they pass
   - Check that the application builds and runs correctly
   - Validate that existing functionality still works
   - Review your changes for consistency with project standards

3. **Communicate your changes**
   - Write clear commit messages that explain the why, not just the what
   - Include relevant documentation links in pull request descriptions
   - Flag any breaking changes or migration requirements

## Specific Guidelines

### File and Directory Management
- **Never create files outside the established structure** without explicit approval
- **Use absolute paths** in all documentation references
- **Follow naming conventions** established in each directory
- **Archive obsolete files** rather than deleting them

### Code Quality Standards
- **TypeScript strictness** - No `any` types without explicit justification
- **Error boundaries** - Implement proper error handling at component boundaries
- **Loading states** - All async operations must have loading indicators
- **Accessibility** - Follow WCAG guidelines for all user interfaces
- **Mobile responsiveness** - Design mobile-first with desktop enhancements

### Documentation Standards
- **Clear titles and descriptions** for all new documents
- **Consistent markdown formatting** with proper heading hierarchy
- **Cross-references** to related documents and external resources
- **Code examples** that are current and functional
- **Visual aids** like diagrams and screenshots where helpful

### Testing Requirements
- **Minimum test coverage** as specified in project configuration
- **Integration tests** for all API endpoints and major user flows
- **Accessibility tests** for all user-facing components
- **Performance tests** for critical user journeys
- **Error case testing** to ensure graceful failure handling

## Common Patterns

### When Adding New Features
1. Create or update specification in [04-features/](./04-features/)
2. Update architecture documents if system design changes
3. Implement the feature following established patterns
4. Write comprehensive tests including edge cases
5. Update user-facing documentation and help content
6. Consider impact on existing features and backwards compatibility

### When Fixing Bugs
1. Document the issue and root cause analysis
2. Write a test that reproduces the bug
3. Implement the fix while maintaining existing functionality
4. Update documentation if the bug revealed incorrect information
5. Consider if similar issues exist elsewhere in the codebase

### When Refactoring
1. Document the reason for refactoring in architecture docs
2. Plan the refactoring to maintain backwards compatibility
3. Update all affected documentation
4. Ensure all tests continue to pass
5. Update any code examples or tutorials that reference changed APIs

## Quality Checklist

Before submitting any work, verify:
- [ ] All affected documentation has been updated
- [ ] New terms have been added to glossary if needed
- [ ] Code follows project standards and passes all linting
- [ ] All tests pass and new tests have been added
- [ ] Changes are backwards compatible or migration path is documented
- [ ] Error cases are handled gracefully
- [ ] Performance implications have been considered
- [ ] Accessibility requirements have been met
- [ ] Security implications have been reviewed

## Getting Help

When you need clarification or encounter issues:
1. **Check existing documentation** in the relevant numbered directories
2. **Review similar implementations** in the codebase for patterns
3. **Consult the glossary** for project-specific terminology
4. **Reference architecture documents** for system design decisions
5. **Ask specific questions** with relevant context and what you've already tried

---

*These instructions are designed to be project-agnostic and can be adapted to any project. Update the specific guidelines to match your project's unique requirements while maintaining the overall structure and principles.*