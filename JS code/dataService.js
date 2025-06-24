
const RANDOM_QUOTE_API_URL = 'https://api.quotable.io/random';
const FALLBACK_QUOTE = "The quick brown fox jumps over the lazy dog. API is broken now, down`t know why, so please test your typing speed with this one quote, becouse I was to lazy to add second API.";

export const QUOTE_SOURCES = {
    API: 'api',
    JSON: 'json'
};

export async function fetchRandomQuote() {
    try {
        const response = await fetch(RANDOM_QUOTE_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.content || FALLBACK_QUOTE;
    } catch (error) {
        console.warn('Failed to fetch random quote:', error);
        return FALLBACK_QUOTE;
    }
}

export function getNextJsonQuote(jsonQuotes, currentIndex) {
    if (!Array.isArray(jsonQuotes) || jsonQuotes.length === 0) {
        return { quote: FALLBACK_QUOTE, nextIndex: 0 };
    }
    
    const quote = jsonQuotes[currentIndex % jsonQuotes.length];
    const nextIndex = currentIndex + 1;
    
    return { quote, nextIndex };
}

export function validateJsonQuotes(data) {
    if (!Array.isArray(data)) {
        return {
            success: false,
            error: 'JSON must be an array of strings.'
        };
    }
    
    if (data.length === 0) {
        return {
            success: false,
            error: 'JSON array cannot be empty. Please provide at least one quote.'
        };
    }
    
    if (!data.every(q => typeof q === 'string' && q.trim().length > 0)) {
        return {
            success: false,
            error: 'All array elements must be non-empty strings.'
        };
    }
      return { success: true };
}

export function processJsonFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = function(evt) {
            try {
                const data = JSON.parse(evt.target.result);
                const validation = validateJsonQuotes(data);
                
                if (validation.success) {
                    resolve({
                        success: true,
                        quotes: data
                    });
                } else {
                    resolve({
                        success: false,
                        error: validation.error
                    });
                }
            } catch (err) {
                const errorMessage = err instanceof SyntaxError 
                    ? 'Invalid JSON file format. Please check your file syntax.'
                    : err.message;
                
                resolve({
                    success: false,
                    error: errorMessage
                });
            }
        };
        
        reader.onerror = function() {
            resolve({
                success: false,
                error: 'Failed to read the file. Please try again.'
            });
        };
        
        reader.readAsText(file);    });
}

export async function getQuote(source, jsonQuotes = [], currentJsonIndex = 0) {
    switch (source) {
        case QUOTE_SOURCES.API:
            const apiQuote = await fetchRandomQuote();
            return {
                quote: apiQuote,
                nextIndex: currentJsonIndex
            };
            
        case QUOTE_SOURCES.JSON:
            return getNextJsonQuote(jsonQuotes, currentJsonIndex);
            
        default:
            console.warn('Unknown quote source:', source);
            return {
                quote: FALLBACK_QUOTE,
                nextIndex: currentJsonIndex
            };
    }
}
