const { OpenAI } = require('openai');

// Initialize OpenAI conditionally
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

// Fallback parsing engine using robust regex and keyword matching
const parseFallback = (text) => {
    const lowerText = text.toLowerCase();
    
    // Default values
    let category = "Medical / First Aid";
    let urgency_level = "Essential";
    let emergency_type = "GENERAL";
    let location_type = "CITY";
    let quantity_needed = 1;
    let is_shelter_needed = false;
    let is_path_reachable = true;
    
    // 1. Category keyword checking
    if (lowerText.match(/(food|ration|rice|meals|biscuit|grocery|groceries|eat|சாப்பாடு|உணவு|பசி)/)) {
        category = "Food & Rations";
    } else if (lowerText.match(/(water|drink|drinking|தண்ணீர்|நீர்|குடிநீர்)/)) {
        category = "Drinking Water";
    } else if (lowerText.match(/(rescue|trap|trapped|boat|helicopter|vehicle|car|lorry|ambulance|drown|trapped|காப்பாற்றவும்|மீட்பு)/)) {
        category = "Rescue / Transport";
    } else if (lowerText.match(/(power|charge|charging|battery|light|generator|electric|electricity|torch|மின்சாரம்|கரண்ட்)/)) {
        category = "Power / Charging";
    } else if (lowerText.match(/(shelter|stay|house|building|accommodation|roof|terrace|room|தங்குமிடம்|வீடு)/)) {
        category = "Temporary Shelter";
    } else if (lowerText.match(/(medical|doctor|first aid|medicine|insulin|cpr|hospital|pain|bleed|bleeding|injury|wound|காயம்|மருந்து|மருத்துவ)/)) {
        category = "Medical / First Aid";
    }
    
    // 2. Urgency level
    if (lowerText.match(/(critical|die|dying|dead|drown|drowning|heart|unconscious|serious|severe|urgent|emergency|இறப்பு|அபாயம்|உயிர்பிழைக்க)/)) {
        urgency_level = "Critical";
    } else if (lowerText.match(/(support|low|general|info|information|inquiring|விவரம்)/)) {
        urgency_level = "Support";
    }
    
    // 3. Emergency Type
    if (lowerText.match(/(flood|rain|water level|river|lake|submerged|மழை|வெள்ளம்|தண்ணீர் புகுந்தது)/)) {
        emergency_type = "FLOOD";
    } else if (lowerText.match(/(earthquake|shake|quake|tremor|landslide|நிலநடுக்கம்)/)) {
        emergency_type = "EARTHQUAKE";
    } else if (lowerText.match(/(fire|smoke|burn|burning|explosion|நெருப்பு|தீ|புகை)/)) {
        emergency_type = "FIRE";
    }
    
    // 4. Location Terrain
    if (lowerText.match(/(hill|mountain|yercaud|valparai|thalavadi|ooty|kodaikanal|slope|landslide|மலை|ஏற்காடு|வால்பாறை)/)) {
        location_type = "HILL";
    } else if (lowerText.match(/(rural|village|field|farm|agriculture|கிராமம்|வயல்)/)) {
        location_type = "RURAL";
    }
    
    // 5. Shelter Needed
    if (lowerText.match(/(shelter|homeless|displaced|washed away|trapped on roof|trapped on terrace|no home|தங்குமிடம் தேவை|வீடு இழந்த)/)) {
        is_shelter_needed = true;
    }
    
    // 6. Reachable Path
    if (lowerText.match(/(blocked|cutoff|cut off|cannot reach|landslide|water logging|flooded road|bridge collapsed|road damaged|வழி அடைப்பு|போக்குவரத்து இல்லை)/)) {
        is_path_reachable = false;
    }
    
    // 7. Quantity Needed extraction
    const qtyMatch = lowerText.match(/(\d+)\s*(people|persons|members|peer|adults|kids|பேர்|நபர்கள்)/);
    if (qtyMatch && qtyMatch[1]) {
        quantity_needed = parseInt(qtyMatch[1], 10);
    }

    return {
        category,
        urgency_level,
        emergency_type,
        location_type,
        quantity_needed,
        is_shelter_needed,
        is_path_reachable,
        clean_description: text
    };
};

// POST /api/requests/parse-nlp
exports.parseRequestText = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text prompt is required for parsing' });
        }

        console.log(`[AI NLP Parser] Received text to parse: "${text}"`);

        // Check if OpenAI is initialized
        if (!openai) {
            console.log('[AI NLP Parser] OpenAI Key missing. Running fallback keyword parser...');
            const result = parseFallback(text);
            return res.json({ success: true, method: 'fallback_regex', data: result });
        }

        // Call OpenAI Completion
        try {
            const systemPrompt = `You are an AI assistant for a hyperlocal crisis response platform in Tamil Nadu called "Namma Thunai". 
Your task is to parse emergency request statements (which may be in English, Tamil, or mixed Tamil-English/Tanglish) into a structured JSON response.

The JSON object MUST follow this schema strictly:
{
  "category": string (Must be exactly one of: "Food & Rations", "Drinking Water", "Medical / First Aid", "Rescue / Transport", "Power / Charging", "Temporary Shelter"),
  "urgency_level": string (Must be exactly one of: "Critical", "Essential", "Support"),
  "emergency_type": string (Must be exactly one of: "GENERAL", "FLOOD", "EARTHQUAKE", "FIRE"),
  "location_type": string (Must be exactly one of: "CITY", "RURAL", "HILL"),
  "quantity_needed": number (The number of people requiring assistance. Default is 1 if not specified),
  "is_shelter_needed": boolean (true if they explicitly need shelter/lodging/roof or their house is damaged/flooded, else false),
  "is_path_reachable": boolean (false if they mention blocked roads, high floods, or landslides, else true),
  "clean_description": string (A clean, short English summary of the situation)
}

Parsing Rules:
1. Category mapping guidelines:
   - "Medical / First Aid" if they mention injuries, bleeding, diabetes, insulin, doctor, pregnancy, medications, cpr.
   - "Rescue / Transport" if they are trapped, need a boat, vehicle, helicopter, or help escaping.
   - "Food & Rations" if they need food, rice, meals, child formulas.
   - "Drinking Water" if they need water or drinks.
   - "Power / Charging" if they need charging, battery, generators, lighting, electricity.
   - "Temporary Shelter" if they need housing, accommodation, or are displaced.
2. Urgency level mapping guidelines:
   - "Critical" if there is an active medical emergency, severe bleeding, drowning risk, or immediate danger to life.
   - "Essential" if they need resources soon for survival (e.g. food/water), but aren't in immediate fatal danger.
   - "Support" if it's general inquiry, low-risk requests, or utility questions.
3. Location type mapping guidelines:
   - "HILL" if they mention hill stations (Yercaud, Valparai, Thalavadi, Ooty, Kodaikanal, Nilgiris).
   - "RURAL" if they mention village, fields, farm, or crops.
   - "CITY" otherwise.`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Please parse this crisis statement: "${text}"` }
                ],
                response_format: { type: "json_object" }
            });

            const parsedResult = JSON.parse(response.choices[0].message.content);
            console.log('[AI NLP Parser] OpenAI parsing successful:', parsedResult);

            return res.json({ success: true, method: 'openai_gpt', data: parsedResult });
        } catch (apiErr) {
            console.error('[AI NLP Parser] OpenAI API call failed. Falling back to keyword parser:', apiErr.message);
            const result = parseFallback(text);
            return res.json({ success: true, method: 'fallback_regex', data: result });
        }
    } catch (err) {
        next(err);
    }
};
