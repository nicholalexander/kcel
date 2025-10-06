# Secure Identity Passphrase Generator

## Project Overview
A simple, secure, single-page website for generating cryptographically strong passphrases that are:
- Mathematically unbreakable and unguessable
- Generated using proper cryptographic randomness
- Never reproducible (each generation is unique)
- Fully verifiable through open-source code

## Core Principles
1. **Security First**: Use Web Crypto API for true randomness
2. **Simplicity**: Single HTML page, no backend, no dependencies
3. **Privacy**: No tracking, no analytics, no user data collection
4. **Transparency**: All code visible and auditable
5. **Minimalism**: Only essential features (generate, display, copy)

## Technical Approach

### Cryptographic Requirements
- Use `crypto.getRandomValues()` for cryptographically secure random number generation
- Implement proper entropy calculations
- Use established word lists (EFF's long word list recommended)
- Ensure sufficient entropy (minimum 77 bits for strong security)

### Passphrase Generation Method
1. **Word List**: Use EFF's long word list (7,776 words = 12.925 bits per word)
2. **Default Length**: 6 words = ~77.5 bits of entropy
3. **Separator**: Use hyphens between words for readability
4. **No Patterns**: Each word selection completely independent

### Security Guarantees
- **Entropy Calculation**: Display actual entropy bits
- **Time to Crack**: Show estimated time at various attack speeds
- **Uniqueness**: Mathematical probability of regeneration effectively zero
- **No State**: No seeds, no reproducibility, no predictability

## File Structure
```
/
├── index.html       # Single page application
├── style.css        # Minimal, clean styling
├── passphrase.js    # Core generation logic
├── wordlist.js      # EFF word list (7,776 words)
└── CLAUDE.md        # This documentation
```

## Implementation Plan

### Phase 1: Core Functionality
1. Set up basic HTML structure
2. Implement cryptographic random number generation
3. Integrate EFF word list
4. Create passphrase generation algorithm
5. Add entropy calculation display

### Phase 2: User Interface
1. Clean, minimal design
2. Generate button
3. Passphrase display area
4. Copy to clipboard functionality
5. Entropy and security information display

### Phase 3: Validation & Testing
1. Verify cryptographic randomness
2. Test entropy calculations
3. Ensure no predictable patterns
4. Cross-browser compatibility testing
5. Security audit checklist

## Security Considerations

### What We're Protecting Against
- **Brute Force**: Sufficient entropy makes exhaustive search infeasible
- **Dictionary Attacks**: Large word list with random selection
- **Pattern Analysis**: No predictable patterns or sequences
- **Side-Channel**: No server communication, all client-side

### Cryptographic Legitimacy
- Uses browser's Web Crypto API (CSPRNG)
- No Math.random() or weak PRNGs
- Entropy calculations based on information theory
- Open source for community verification

## User Experience
- Single button press to generate
- Clear display of passphrase
- One-click copy to clipboard
- Visible entropy information
- No distractions or unnecessary features

## Ethical Considerations
- No data collection whatsoever
- No third-party resources (self-contained)
- Educational component about password security
- Clear about limitations and proper use

## Implementation Status

### ✅ Completed
- **index.html**: Full HTML structure with semantic markup
  - Header with title and subtitle
  - Passphrase display area with copy button
  - Word count selector (4-8 words)
  - Generate button
  - Security information display
  - Privacy-focused footer
- **style.css**: Clean, minimal CSS styling
  - Responsive design
  - Dark mode support
  - Professional color scheme
  - Smooth animations
- **wordlist.js**: EFF long word list integrated
  - 7,776 words for maximum entropy
  - Clean array format
- **passphrase.js**: Core cryptographic implementation
  - Uses crypto.getRandomValues() for CSPRNG
  - Proper entropy calculations
  - Time-to-crack estimates
  - Copy to clipboard functionality
  - No weak randomness sources

### 🔒 Security Features Implemented
- Cryptographically secure random number generation
- Real-time entropy calculations
- Combination count display
- Time-to-crack estimates at 1 billion attempts/second
- Client-side only operation (no server communication)
- No tracking or analytics
- No external dependencies

### 📊 Technical Details
- Default: 6 words = ~77.5 bits of entropy
- Options: 4-8 words (52-103 bits of entropy)
- Word separator: hyphens for readability
- Each generation completely independent
- No reproducibility or predictable patterns