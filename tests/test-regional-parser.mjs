// Test suite for BolHisab Multi-Regional Language Parser

class MultiLingualCommandParser {
  static normalizeAllIndianDigits(text) {
    if (!text) return '';
    const map = {
      // Devanagari (Hindi, Marathi)
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
      // Bengali
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
      // Gujarati
      '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
      // Gurmukhi (Punjabi)
      '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4', '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
      // Tamil
      '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
      // Telugu
      '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
      // Kannada
      '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
      // Malayalam
      '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4', '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9'
    };
    return text.replace(/[०-९০-৯૦-૯੦-੯௦-௯౦-౯೦-೯൦-൯]/g, d => map[d] || d);
  }

  static cleanCustomerName(raw) {
    if (!raw) return null;
    let s = raw.trim();
    // Strip attached case suffixes
    s = s.replace(/(?:ಗೆ|ಿಗೆ|ನ|ಅನ್ನು)$/u, '');
    s = s.replace(/(?:ுக்கு|க்கு|கு|வுக்கு|இன்|ஐ)$/u, '');
    if (s.endsWith('ஷு') || s.endsWith('ஷ')) s = s.replace(/ஷு?$/, 'ஷ்');
    s = s.replace(/(?:కు|కి|ని|ను|గారి)$/u, '');
    s = s.replace(/(?:ിന്|ന്|ക്ക്|ന്റെ)$/u, '');
    s = s.replace(/(?:ला|चा|ची|चे)$/u, '');
    s = s.replace(/(?:কে|র|এর)$/u, '');
    s = s.replace(/(?:ને|નો|ની|નું)$/u, '');
    s = s.replace(/(?:ਨੂੰ|ਦਾ|ਦੇ|ਦੀ)$/u, '');
    s = s.replace(/(?:को|का|की|કે|ने|से)$/u, '');
    s = s.replace(/(?:ge|ige|ku|kku|ki|ko|ka|ke|ne|nu|la|da|de|di|garu|avaru|avare)$/i, '');
    return s.trim();
  }

  static matchCustomer(custRecord, queryName) {
    if (!custRecord || !queryName) return false;
    const c = custRecord.name.trim().toLowerCase();
    let q = queryName.trim().toLowerCase();
    q = this.cleanCustomerName(q).toLowerCase();
    if (c === q) return true;

    const crossScriptMap = {
      'ramesh': ['ramesh', 'रमेश', 'ರಮೇಶ್', 'ரமேஷ்', 'రమేష్', 'രമേഷ്', 'রমেশ', 'રમેશ', 'ਰਮੇਸ਼'],
      'suresh': ['suresh', 'सुरेश', 'ಸುರೇಶ್', 'சுரேஷ்', 'సురేష్', 'സുരേഷ്', 'সুরেশ', 'સુરેશ', 'ਸੁਰੇਸ਼'],
      'pooja': ['pooja', 'puja', 'पूजा', 'ಪೂಜಾ', 'பூஜா', 'పూజ', 'പൂജ', 'পূজা', 'પૂજા', 'ਪੂਜਾ'],
      'mahesh': ['mahesh', 'महेश', 'ಮಹೇಶ್', 'மகேஷ்', 'మహేష్', 'ಮಹേഷ്', 'মহেশ', 'મહેશ', 'ਮਹੇਸ਼'],
      'dinesh': ['dinesh', 'दिनेश', 'ದಿನೇಶ್', 'தினேஷ்', 'దినేష్', 'ദിനേശ്', 'দিনেশ', 'દિનેશ', 'ਦਿਨੇਸ਼']
    };

    for (const [canonical, aliases] of Object.entries(crossScriptMap)) {
      const cMatch = aliases.some(a => c === a.toLowerCase() || c.includes(a.toLowerCase()));
      const qMatch = aliases.some(a => q === a.toLowerCase() || q.includes(a.toLowerCase()));
      if (cMatch && qMatch) return true;
    }
    return false;
  }

  static normalizeText(str) {
    if (!str) return '';
    let clean = this.normalizeAllIndianDigits(str.toLowerCase());
    clean = clean.replace(/[,!?;:]/g, ' ');
    return clean.trim();
  }

  static parse(rawText) {
    const clean = this.normalizeText(rawText);
    if (!clean) return { intent: 'UNKNOWN', clarificationPrompt: 'Please speak or enter a command.' };

    // 1. HELP
    if (/^(madad|help|kya bolu|kaise chalega|guide|உதவி|సహాయం|ಸಹಾಯ|സഹായം|मदत|সাহায্য|મદદ|ਮਦਦ)/i.test(clean) || clean === 'help') {
      return { intent: 'HELP' };
    }

    // 2. DAILY_SUMMARY
    if (/(aaj ka hisaab|aaj ki bikri|today summary|todays hisab|aaj ka ledger|din bhar ka hisab|இன்றைய கணக்கு|inikku kanakku|ఈ రోజు లెక్క|ee roju lekka|ಇಂದಿನ ಲೆಕ್ಕ|indina lekka|ഇന്നത്തെ കണക്ക്|innathe kanakku|आजचा हिशोब|aajcha hishob|আজকের হিসাব|ajker hisab|આજનો હિસાબ|aajno hisab|ਅੱਜ ਦਾ ਹਿਸਾਬ|ajj da hisaab)/i.test(clean)) {
      return { intent: 'DAILY_SUMMARY' };
    }

    // 3. TOP_DUES
    if (/(sabse zyada udhaar|kiske paise baki|pending list|top dues|udhaar list|dues list|அதிக கடன்|ఎక్కువ అప్పు|ಹೆಚ್ಚು ಸಾಲ|ഏറ്റവും കൂടുതൽ കടം|सर्वात जास्त उधारी|সবচেয়ে বেশি বাকি|સૌથી વધુ ઉધાર|ਸਭ ਤੋਂ ਵੱਧ ਉਧਾਰ)/i.test(clean)) {
      return { intent: 'TOP_DUES' };
    }

    // 4. CHECK_STOCK / RESTOCK_ITEM
    const stockMatch = clean.match(/(doodh|milk|chai patti|tea|cheeni|sugar|biscuit|parle-g|பால்|paal|పాలు|paalu|ಹಾಲು|haalu|പാൽ|दूध|দুধ|dudh|દૂધ|ਦੁੱਧ|தேநீர்|టీ|ಟೀ|ചായ|চা|ચા|ਚਾਹ|சர்க்கரை|చక్కెర|ಸಕ್ಕರೆ|പഞ്ചസാര|साखर|চিনি|ખાંડ|ਖੰਡ|பிஸ்கட்|బిస్కెట్|ಬಿಸ್ಕತ್ತು|বিস্কুট|બિસ્કિટ|ਬਿਸਕੁਟ)/i);
    if (stockMatch) {
      const rawItemName = stockMatch[0];
      const stdItem = this.standardizeItemName(rawItemName);

      if (/(stock mein jodo|add stock|restock|mangwaya|jodo|jama karo|சேர்|போடு|కలుపు|ಸೇರಿಸಿ|ചേർക്കുക|जोडा|যোগ|ઉમેરો|ਜੋੜੋ)/i.test(clean)) {
        const qtyMatch = clean.match(/(\d+(?:\.\d+)?)\s*(packet|pkt|kg|kilo|litre|l|bori|dabba|பாக்கெட்|ప్యాకెట్|ಪ್ಯಾಕೆಟ್|প্যাকেট|પેકેટ|ਪੈਕੇਟ)?/i);
        const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : null;
        const unit = qtyMatch && qtyMatch[2] ? qtyMatch[2] : (stdItem === 'Doodh' ? 'packet' : 'kg');

        if (!quantity || quantity <= 0) {
          return {
            intent: 'UNKNOWN',
            missingFields: ['quantity'],
            clarificationPrompt: `Quantity needed for ${stdItem}.`
          };
        }

        return {
          intent: 'RESTOCK_ITEM',
          itemName: stdItem,
          quantity,
          unit,
          source: 'local'
        };
      }

      if (/(stock|kitna bacha|kitni bachi|check stock|எவ்வளவு|எவ்ளோ|ఎంత ఉంది|ఎంత|ಎಷ್ಟಿದೆ|ಎಷ್ಟು|എത്രയുണ്ട്|എത്ര|किती आहे|किती|কত আছে|কত|કેટલો છે|કેટલો|ਕਿੰਨਾ ਹੈ|ਕਿੰਨਾ)/i.test(clean)) {
        return {
          intent: 'CHECK_STOCK',
          itemName: stdItem,
          source: 'local'
        };
      }
    }

    // 5. EXTRACT AMOUNT
    let amountRupees = null;
    const amountMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:rupaye|rupee|rupees|rs|rupya|₹|ரூபாய்|ரூ|రూపాయలు|రూ|ರೂಪಾಯಿ|രൂപ|रुपये|টাকা|રૂપિયા|ਰੁਪਏ|taka|rooba|roopayi)?/i);
    if (amountMatch) {
      const parsedVal = parseFloat(amountMatch[1]);
      if (!isNaN(parsedVal) && parsedVal > 0 && parsedVal < 10000000) {
        amountRupees = Math.round(parsedVal * 100) / 100;
      }
    }

    // 6. EXTRACT CUSTOMER NAME
    let nameClean = clean
      .replace(/(ko|ne|ka|ke|se|bhai|ji|shree|la|nu|ku|kku|ki|ge|nu|inu|kadan|baaki|udhaar|likho|de diye|diye|mile|jama|jama karein|balance|batao|kitna hai|reminder|bhejo|paid|received|credit|add|estu|eshtu|yeshtu|evvalavu|evalavu|enta|ethra|kiti|koto|ketlo|kinna|how|much)\b/gi, ' ')
      .replace(/(\d+(?:\.\d+)?)\s*(?:rupaye|rupee|rupees|rs|rupya|₹|ரூபாய்|ரூ|రూపాయలు|రూ|ರೂಪಾಯಿ|രൂപ|रुपये|টাকা|રૂપિયા|ਰੁਪਏ|taka|rooba|roopayi)?/gi, '')
      .replace(/(கடன்|எழுது|கொடுத்தார்|கொடுத்துட்டார்|செலுத்தினார்|பாக்கி|அప్పు|రాయి|ఇచ్చాడు|చెల్లించాడు|సాల|ಬರೆ|ಕೊಟ್ಟಿದ್ದಾನೆ|കടം|എഴുതുക|തന്നു|उधार|उधारी|लिहा|दिले|ধার|বাকি|লিখুন|দিলো|ઉધાર|લખો|આપ્યા|ਉਧਾਰ|ਲਿਖੋ|ਦੇ ਦਿੱਤੇ|ಎಷ್ಟು|ఎంత|எவ்வளவு|എത്ര|किती|কত|કેટલો|ਕਿੰਨਾ)/gi, '')
      .trim();

    const words = nameClean.split(/\s+/).filter(w => w.length > 1);
    let customerName = null;
    if (words.length > 0) {
      const cleaned = this.cleanCustomerName(words[0]);
      if (cleaned) {
        customerName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
    }

    // 7. GET_BALANCE
    if (/(balance|hisaab kitna|kitne paise baki|hisab batao|பாக்கி|கணக்கு|இருப்பு|எவ்வளவு|evvalavu|evalavu|baaki|iruppu|బాకీ|లెక్క|ఎంత|enta|బ్యాలెన్స్|ಬಾಕಿ|ಲೆಕ್ಕ|ಎಷ್ಟು|estu|eshtu|yeshtu|ಬ್ಯಾಲೆನ್ಸ್|ബാലൻസ്|ബാക്കി|കണക്ക്|എത്ര|ethra|बाकी|हिशोब|किती|kiti|बैलन्स|বাকি|হিসাব|কত|koto|ব্যালেন্স|હિસાબ|કેટલો|ketlo|બਾਕੀ|ਹਿਸਾਬ|ਕਿੰਨਾ|kinna|how much)/i.test(clean)) {
      if (!customerName) {
        return {
          intent: 'UNKNOWN',
          missingFields: ['customerName'],
          clarificationPrompt: 'Please specify customer name to check balance.'
        };
      }
      return {
        intent: 'GET_BALANCE',
        customerName,
        source: 'local'
      };
    }

    // 8. RECORD_PAYMENT
    if (/(de diye|jama kiye|diye|jama|mila|mile|payment diya|paid|received|payment|கொடுத்தார்|கொடுத்துட்டார்|செலுத்தினார்|koduthaar|kudutha|varavu|ఇచ్చాడు|చెల్లించాడు|icchaadu|dabbulu|ಕೊಟ್ಟಿದ್ದಾನೆ|ಪಾವತಿಸಿದ|kottiddane|duddu|തന്നു|അടച്ചു|thannu|दिले|जमा केले|দিলো|জমা দিলো|dilo|આપ્યા|જમા કર્યા|aapya|ਦੇ ਦਿੱਤੇ|ਜਮ੍ਹਾ ਕੀਤੇ|de ditte)/i.test(clean)) {
      if (!customerName || !amountRupees) {
        return {
          intent: 'UNKNOWN',
          missingFields: [!customerName ? 'customerName' : 'amountRupees'],
          clarificationPrompt: 'Customer name and payment amount required.'
        };
      }
      return {
        intent: 'RECORD_PAYMENT',
        customerName,
        amountRupees,
        source: 'local'
      };
    }

    // 9. ADD_CREDIT
    if (/(udhaar|baki|credit|likho|likh lo|கடன்|எழுது|kadan|baaki|அప్పు|రాయి|appu|సాల|ಬರೆ|saala|കടം|എഴുതുക|kadam|उधार|उधारी|लिहा|ধার|বাকি|লিখুন|dhar|ઉધાર|લખો|ਉਧਾਰ|ਲਿਖੋ)/i.test(clean)) {
      if (!customerName || !amountRupees) {
        return {
          intent: 'UNKNOWN',
          missingFields: [!customerName ? 'customerName' : 'amountRupees'],
          clarificationPrompt: 'Customer name and credit amount required.'
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
      clarificationPrompt: 'Command not recognized. Please try again.'
    };
  }

  static standardizeItemName(name) {
    if (/doodh|milk|பால்|paal|పాలు|paalu|ಹಾಲು|haalu|പാൽ|दूध|দুধ|dudh|દૂધ|ਦੁੱਧ/i.test(name)) return 'Doodh';
    if (/chai|tea|தேநீர்|తేనీరు|ಚಹಾ|ചായ|চা|ચા|ਚਾਹ|patti/i.test(name)) return 'Chai Patti';
    if (/cheeni|sugar|சர்க்கரை|చక్కెర|ಸಕ್ಕರೆ|പഞ്ചസാര|साखर|চিনি|ખાંડ|ਖੰਡ/i.test(name)) return 'Cheeni';
    if (/biscuit|parle|பிஸ்கட்|బిస్కెట్|ಬಿಸ್ಕತ್ತು|বিস্কুট|બિસ્કિટ|ਬਿਸਕੁਟ/i.test(name)) return 'Parle-G';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}

// Multi-regional test assertions
const multiTests = [
  // 1. Hindi
  { input: "Ramesh ko 40 rupaye udhaar likho.", expectedIntent: "ADD_CREDIT", expectedName: "Ramesh", expectedAmount: 40 },
  // 2. English
  { input: "Add 40 credit for Ramesh", expectedIntent: "ADD_CREDIT", expectedName: "Ramesh", expectedAmount: 40 },
  // 3. Tamil
  { input: "ரமேஷுக்கு 40 ரூபாய் கடன் எழுது", expectedIntent: "ADD_CREDIT", expectedName: "ரமேஷுக்கு", expectedAmount: 40 },
  { input: "ரமேஷ் 50 ரூபாய் கொடுத்தார்", expectedIntent: "RECORD_PAYMENT", expectedAmount: 50 },
  // 4. Telugu
  { input: "రమేష్ కు 40 అప్పు రాయి", expectedIntent: "ADD_CREDIT", expectedAmount: 40 },
  { input: "ఈ రోజు లెక్క చూపించు", expectedIntent: "DAILY_SUMMARY" },
  // 5. Bengali (with Bengali numerals ৪০)
  { input: "রমেশকে ৪০ টাকা ধার লিখুন", expectedIntent: "ADD_CREDIT", expectedAmount: 40 },
  // 6. Marathi
  { input: "रमेशने 50 रुपये दिले", expectedIntent: "RECORD_PAYMENT", expectedAmount: 50 },
  // 7. Gujarati
  { input: "રમેશને 40 રૂપિયા ઉધાર લખો", expectedIntent: "ADD_CREDIT", expectedAmount: 40 },
  // 8. Punjabi
  { input: "ਰਮੇਸ਼ ਨੇ 50 ਰੁਪਏ ਦੇ ਦਿੱਤੇ", expectedIntent: "RECORD_PAYMENT", expectedAmount: 50 },
  // 9. Kannada user queries
  { input: "ramesh ge estu", expectedIntent: "GET_BALANCE", expectedName: "Ramesh" },
  { input: "ರಮೇಶ್ಗೆ ಎಷ್ಟು", expectedIntent: "GET_BALANCE", expectedName: "ರಮೇಶ್" },
  { input: "ರಮೇಶ್ ಗೆ ಎಷ್ಟು", expectedIntent: "GET_BALANCE", expectedName: "ರಮೇಶ್" }
];

// Test cross-script matching
if (!MultiLingualCommandParser.matchCustomer({ name: 'Ramesh' }, 'ರಮೇಶ್')) {
  console.error('Failed matchCustomer: Ramesh vs ರಮೇಶ್');
  failed++;
}
if (!MultiLingualCommandParser.matchCustomer({ name: 'Ramesh' }, 'ರಮೇಶ್ಗೆ')) {
  console.error('Failed matchCustomer: Ramesh vs ರಮೇಶ್ಗೆ');
  failed++;
}

let failed = 0;
multiTests.forEach((t, i) => {
  const res = MultiLingualCommandParser.parse(t.input);
  const passIntent = res.intent === t.expectedIntent;
  const passAmount = !t.expectedAmount || res.amountRupees === t.expectedAmount;
  if (passIntent && passAmount) {
    console.log(`✓ Test ${i + 1} passed [${t.expectedIntent}]: "${t.input}"`);
  } else {
    console.error(`✗ Test ${i + 1} FAILED: "${t.input}"`, res, 'Expected:', t);
    failed++;
  }
});

if (failed === 0) {
  console.log('\nALL 8 REGIONAL LANGUAGE TESTS PASSED! 🇮🇳✨');
} else {
  process.exit(1);
}
