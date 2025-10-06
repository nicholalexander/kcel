/**
 * Secure Passphrase Generator
 * Uses Web Crypto API for cryptographically secure random number generation
 * Based on EFF's diceware method with 7776 words (12.925 bits per word)
 */

// Constants
const BITS_PER_WORD = Math.log2(7776); // 12.925 bits
const WORD_LIST_SIZE = 7776;

// Verify Web Crypto API availability
if (!window.crypto || !window.crypto.getRandomValues) {
    alert('Error: Your browser does not support the Web Crypto API. Please use a modern browser for secure passphrase generation.');
}

/**
 * Generate cryptographically secure random number in range [0, max)
 * Uses rejection sampling to avoid modulo bias
 */
function getSecureRandomNumber(max) {
    if (max > 4294967296) {
        throw new Error('Max value too large for Uint32Array');
    }

    const randomArray = new Uint32Array(1);
    const maxValid = Math.floor(4294967296 / max) * max;

    let randomValue;
    do {
        crypto.getRandomValues(randomArray);
        randomValue = randomArray[0];
    } while (randomValue >= maxValid);

    return randomValue % max;
}

/**
 * Generate a secure passphrase with specified number of words
 */
function generatePassphrase(wordCount) {
    if (!EFF_WORDLIST || EFF_WORDLIST.length !== WORD_LIST_SIZE) {
        throw new Error('Word list not loaded or corrupted');
    }

    const words = [];
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = getSecureRandomNumber(WORD_LIST_SIZE);
        words.push(EFF_WORDLIST[randomIndex]);
    }

    return words.join('-');
}

/**
 * Calculate entropy for given number of words
 */
function calculateEntropy(wordCount) {
    return wordCount * BITS_PER_WORD;
}

/**
 * Calculate number of possible combinations
 */
function calculateCombinations(wordCount) {
    return Math.pow(WORD_LIST_SIZE, wordCount);
}

/**
 * Format large numbers with scientific notation
 */
function formatLargeNumber(num) {
    if (num < 1e6) {
        return num.toLocaleString();
    }
    return num.toExponential(2);
}

/**
 * Calculate time to crack at given attempts per second
 */
function calculateCrackTime(combinations) {
    const attemptsPerSecond = 1e9; // 1 billion attempts per second
    const seconds = combinations / (2 * attemptsPerSecond); // Average case is half the combinations

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const year = day * 365.25;
    const millennium = year * 1000;
    const billion_years = year * 1e9;
    const universe_age = year * 13.8e9;

    if (seconds < minute) {
        return `${seconds.toFixed(1)} seconds`;
    } else if (seconds < hour) {
        return `${(seconds / minute).toFixed(1)} minutes`;
    } else if (seconds < day) {
        return `${(seconds / hour).toFixed(1)} hours`;
    } else if (seconds < year) {
        return `${(seconds / day).toFixed(1)} days`;
    } else if (seconds < millennium) {
        return `${(seconds / year).toFixed(1)} years`;
    } else if (seconds < billion_years) {
        return `${(seconds / millennium).toFixed(1)} millennia`;
    } else if (seconds < universe_age) {
        return `${(seconds / billion_years).toFixed(1)} billion years`;
    } else {
        const universes = seconds / universe_age;
        return `${universes.toFixed(1)} × age of universe`;
    }
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}

// Initialize UI event handlers
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const passphraseDisplay = document.getElementById('passphrase-display');
    const passphraseElement = document.getElementById('passphrase');

    // Generate button handler
    generateBtn.addEventListener('click', function() {
        const wordCount = 20; // Fixed at 20 words

        try {
            // Generate passphrase
            const passphrase = generatePassphrase(wordCount);

            // Display passphrase
            passphraseElement.textContent = passphrase;
            passphraseDisplay.style.display = 'block';

            // Reset copy button feedback
            document.getElementById('copy-feedback').textContent = '';

        } catch (error) {
            console.error('Error generating passphrase:', error);
            alert('An error occurred while generating the passphrase. Please refresh the page and try again.');
        }
    });

    // Copy button handler
    copyBtn.addEventListener('click', async function() {
        const passphrase = passphraseElement.textContent;
        const success = await copyToClipboard(passphrase);
        const feedbackElement = document.getElementById('copy-feedback');

        if (success) {
            feedbackElement.textContent = ' ✓ Copied!';
            setTimeout(() => {
                feedbackElement.textContent = '';
            }, 2000);
        } else {
            alert('Failed to copy to clipboard. Please select and copy manually.');
        }
    });

    // Generate initial passphrase on load
    generateBtn.click();
});