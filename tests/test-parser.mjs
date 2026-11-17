// Test suite for BolHisab command parsing and validation

// Extract LocalCommandParser logic from index.html or replicate directly to test
class LocalCommandParser {
  static normalizeDevanagariDigits(text) {
    const devDigits = '०१२३४५६७८९';
    return text.replace(/[०-९]/g, d => devDigits.indexOf(d).toString());
  }

  static normalizeText(str) {
    if (!str) return '';
    let clean = this.normalizeDevanagariDigits(str.toLowerCase());
    clean = clean.replace(/[,!?;:]/g, ' ');
    return clean.trim();
  }

  static parse(rawText) {
    const clean = this.normalizeText(rawText);
    if (!clean) return { intent: 'UNKNOWN', clarificationPrompt: 'Kripya apna aadesh likhein ya bolein.' };

    if (/^(madad|help|kya bolu|kaise chalega|guide)/i.test(clean) || clean === 'help') {
      return { intent: 'HELP' };
    }

    if (/(aaj ka hisaab|aaj ki bikri|today summary|todays hisab|aaj ka ledger|din bhar ka hisab)/i.test(clean)) {
      return { intent: 'DAILY_SUMMARY' };
    }

    if (/(sabse zyada udhaar|kiske paise baki|pending list|top dues|udhaar list|dues list)/i.test(clean)) {
      return { intent: 'TOP_DUES' };
    }

    const stockMatch = clean.match(/(doodh|milk|chai patti|tea|cheeni|sugar|biscuit|parle-g)/i);
    if (stockMatch) {
      const itemName = stockMatch[0];
      if (/(stock mein jodo|add stock|restock|mangwaya|jodo|jama karo)/i.test(clean)) {
        const qtyMatch = clean.match(/(\d+(?:\.\d+)?)\s*(packet|pkt|kg|kilo|litre|l|bori|dabba)?/i);
        const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : null;
        const unit = qtyMatch && qtyMatch[2] ? qtyMatch[2] : (itemName.includes('doodh') ? 'packet' : 'kg');

        if (!quantity || quantity <= 0) {
          return {
            intent: 'UNKNOWN',
            missingFields: ['quantity'],
            clarificationPrompt: `${itemName} ki kitni quantity stock mein jodna hai? (e.g. 20 packet)`
          };
        }

        return {
          intent: 'RESTOCK_ITEM',
          itemName: this.standardizeItemName(itemName),
          quantity,
          unit,
          source: 'local'
        };
      }

      if (/(stock|kitna bacha|kitni bachi|check stock)/i.test(clean)) {
        return {
          intent: 'CHECK_STOCK',
          itemName: this.standardizeItemName(itemName),
          source: 'local'
        };
      }
    }

    let amountRupees = null;
    const amountMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:rupaye|rupee|rupees|rs|rupya|₹)?/i);
    if (amountMatch) {
      const parsedVal = parseFloat(amountMatch[1]);
      if (!isNaN(parsedVal) && parsedVal > 0 && parsedVal < 1000000) {
        amountRupees = Math.round(parsedVal * 100) / 100;
      }
    }

    let customerName = null;
    const nameKeywords = clean
      .replace(/(ko|ne|ka|ke|se|bhai|ji|shree)\b/gi, ' ')
      .replace(/(\d+(?:\.\d+)?)\s*(?:rupaye|rupee|rupees|rs|rupya|₹)?/gi, '')
      .replace(/(udhaar|likho|de diye|diye|mile|jama|jama karein|balance|batao|kitna hai|reminder|bhejo)/gi, '')
      .trim();

    const words = nameKeywords.split(/\s+/).filter(w => w.length > 1);
    if (words.length > 0) {
      customerName = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }

    if (/(balance|hisaab kitna|kitne paise baki|hisab batao)/i.test(clean)) {
      if (!customerName) {
        return {
          intent: 'UNKNOWN',
          missingFields: ['customerName'],
          clarificationPrompt: 'Kiska balance dekhna chahte hain? Kripya naam batayein.'
        };
      }
      return {
        intent: 'GET_BALANCE',
        customerName,
        source: 'local'
      };
    }

    if (/(reminder|yaad dilao|message banao)/i.test(clean)) {
      if (!customerName) {
        return {
          intent: 'UNKNOWN',
          missingFields: ['customerName'],
          clarificationPrompt: 'Kisko payment reminder bhejna hai? Kripya naam batayein.'
        };
      }
      return {
        intent: 'DRAFT_REMINDER',
        customerName,
        source: 'local'
      };
    }

    if (/(de diye|jama kiye|diye|jama|mila|mile|payment diya|paid|received)/i.test(clean)) {
      if (!customerName || !amountRupees) {
        return {
          intent: 'UNKNOWN',
          missingFields: [!customerName ? 'customerName' : 'amountRupees'],
          clarificationPrompt: 'Payment likhne ke liye grahak ka naam aur amount dono batayein.'
        };
      }
      return {
        intent: 'RECORD_PAYMENT',
        customerName,
        amountRupees,
        source: 'local'
      };
    }

    if (/(udhaar|baki|credit|likho|likh lo)/i.test(clean)) {
      if (!customerName || !amountRupees) {
        return {
          intent: 'UNKNOWN',
          missingFields: [!customerName ? 'customerName' : 'amountRupees'],
          clarificationPrompt: 'Udhaar likhne ke liye grahak ka naam aur amount batayein.'
        };
      }
      return {
        intent: 'ADD_CREDIT',
        customerName,
        amountRupees,
        source: 'local'
      };
    }

    return {
      intent: 'UNKNOWN',
      clarificationPrompt: 'Aapka aadesh samajh nahi aaya. Udhaaran: "Ramesh ko 40 rupaye udhaar likho".'
    };
  }

  static standardizeItemName(name) {
    if (/doodh|milk/i.test(name)) return 'Doodh';
    if (/chai|tea/i.test(name)) return 'Chai Patti';
    if (/cheeni|sugar/i.test(name)) return 'Cheeni';
    if (/biscuit|parle/i.test(name)) return 'Parle-G';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}

// Run test assertions
const tests = [
  {
    input: "Ramesh ko 40 rupaye udhaar likho.",
    expectedIntent: "ADD_CREDIT",
    expectedName: "Ramesh",
    expectedAmount: 40
  },
  {
    input: "Ramesh ne 50 rupaye de diye.",
    expectedIntent: "RECORD_PAYMENT",
    expectedName: "Ramesh",
    expectedAmount: 50
  },
  {
    input: "Ramesh ka balance batao.",
    expectedIntent: "GET_BALANCE",
    expectedName: "Ramesh"
  },
  {
    input: "Doodh ke 20 packet stock mein jodo.",
    expectedIntent: "RESTOCK_ITEM",
    expectedItem: "Doodh",
    expectedQty: 20
  },
  {
    input: "Aaj ka hisaab dikhao.",
    expectedIntent: "DAILY_SUMMARY"
  },
  {
    input: "Doodh ka stock batao.",
    expectedIntent: "CHECK_STOCK",
    expectedItem: "Doodh"
  },
  {
    input: "Ramesh ko ४० rupaye udhaar likho", // Devanagari digit ४०
    expectedIntent: "ADD_CREDIT",
    expectedName: "Ramesh",
    expectedAmount: 40
  },
  {
    input: "Gibberish blah blah",
    expectedIntent: "UNKNOWN"
  }
];

let failed = 0;
tests.forEach((t, i) => {
  const res = LocalCommandParser.parse(t.input);
  const passIntent = res.intent === t.expectedIntent;
  const passName = !t.expectedName || res.customerName === t.expectedName;
  const passAmount = !t.expectedAmount || res.amountRupees === t.expectedAmount;
  const passItem = !t.expectedItem || res.itemName === t.expectedItem;
  const passQty = !t.expectedQty || res.quantity === t.expectedQty;

  if (passIntent && passName && passAmount && passItem && passQty) {
    console.log(`✓ Test ${i + 1} passed: "${t.input}" -> ${res.intent}`);
  } else {
    console.error(`✗ Test ${i + 1} FAILED: "${t.input}"`, res, 'Expected:', t);
    failed++;
  }
});

if (failed === 0) {
  console.log('\nALL 8 TESTS PASSED SUCCESSFULLY! 🎯');
} else {
  process.exit(1);
}
