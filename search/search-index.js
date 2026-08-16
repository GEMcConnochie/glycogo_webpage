/* Glycogo site search index.
   One entry per page. `keywords` drive the alias/keyword retriever,
   `sections` let results deep-link to anchors and power snippets. */
window.GLYCOGO_INDEX = [
  {
    id: "home",
    title: "Glycogo — Periodised Nutrition Planner for Athletes",
    url: "/",
    type: "Home",
    description: "Periodised nutrition planning for athletes and active individuals. Carbohydrate and calorie targets that scale with training load. Syncs with Intervals.icu.",
    keywords: [
      "nutrition app", "periodised nutrition", "carbohydrate targets", "calorie targets",
      "training load", "fuel", "fuelling", "endurance", "athletes", "glycogen",
      "intervals.icu", "sync", "meal log", "food diary", "tracking", "REDs",
      "energy availability", "photo logging", "barcode scanner", "AI assistant", "pricing", "premium"
    ],
    aliases: [
      "how much does glycogo cost", "cost", "pricing", "price", "premium", "subscription",
      "what is glycogo", "app", "download", "login", "sign up", "free tier"
    ],
    text: "Glycogo is a periodised nutrition planning app for athletes and active individuals. It plans, tracks, and personalises nutrition with carbohydrate and calorie targets that automatically adapt to your training load, session RPE and duration. Features include periodised targets that scale with training, sync with Intervals.icu to import planned and completed sessions from major fitness platforms, saved meal templates and a daily log, smart quantity suggestions, within-day energy availability trend tracking, a custom food database, photo logging where the AI identifies foods and estimates macros, a barcode scanner, and the AI nutrition assistant. The app schedules pre-session snacks, during-session fuel, and recovery targets for every session, and tracks hour-by-hour energy balance. Premium is priced at about the cost of 1-2 gels per month, roughly EUR 4.40 or 5 USD, with a free tier available.",
    sections: [
      { label: "Features", url: "/#features", text: "Periodised targets that scale with session RPE and duration; sync your training via Intervals.icu; saved meal templates and daily log; smart quantity suggestions; trend tracking of within-day energy; custom food database; photo logging; barcode scanner; AI nutrition assistant." },
      { label: "AI Nutrition Assistant", url: "/#features", text: "Photograph your plate and the app estimates calories and macros from the image. Ask for meal ideas, recipes, or food swaps informed by your training sessions, remaining targets, and current log. Suggested meals can be added to your log directly from chat." },
      { label: "Science", url: "/#science", text: "Intensity-based carbohydrate and calorie scaling grounded in peer-reviewed sports science, including carbohydrate periodisation and energy availability research." },
      { label: "FAQ · How much does Glycogo cost?", url: "/#faq", text: "Premium is priced at about the cost of just 1-2 gels per month, roughly EUR 4.40 or 5 USD. There is a free tier; a subscription unlocks Intervals.icu sync, photo and barcode logging, a larger food database, and the AI nutrition assistant." },
      { label: "FAQ · How does Glycogo sync training sessions?", url: "/#faq", text: "Glycogo connects to Intervals.icu, which pulls planned and completed workouts from major fitness platforms. Imported sessions drive pre-session, during-session, and recovery fuel targets. Sessions can also be added manually." },
      { label: "FAQ · How should I rate my session RPE?", url: "/#faq", text: "Rate the overall difficulty of the whole workout on the Borg CR100 scale (1-100) — how hard the entire session felt, not the peak effort of the hardest interval." },
      { label: "FAQ · What should my carbs-per-hour range be?", url: "/#faq", text: "A common lower starting range is roughly 50-60 g/hr for easy aerobic work, with an upper bound around 90 g/hr for sustained hard exercise. Gut-trained athletes can tolerate and use more." },
      { label: "FAQ · What is the high-carb fuelling setting?", url: "/#faq", text: "When enabled on a workout, Glycogo always includes during-session carbohydrate targets at the upper end of your carbs-per-hour range, even for shorter or lower-intensity sessions. Useful for gut training or limited pre-session fuel." },
      { label: "FAQ · What should my minimum session duration be?", url: "/#faq", text: "This setting controls when during-session carbohydrate targets are added. Default is 60 minutes, with 60-90 minutes a good range. Shorter sessions often do not need intra-workout carbs." },
      { label: "FAQ · What is within-day energy availability?", url: "/#faq", text: "Within-day energy availability tracks your hour-by-hour balance between what you eat and what you burn. Prolonged low-energy periods are linked to hormonal disruption and poorer recovery, even if the daily total returns to balance." },
      { label: "FAQ · Why does the app show a deficit when I first wake up?", url: "/#faq", text: "Your body keeps burning energy overnight. Glycogo uses a circadian model that spreads resting metabolism unevenly across the day, so the morning negative balance reflects overnight energy use and is expected." },
      { label: "FAQ · Why does the app schedule a pre-session snack?", url: "/#faq", text: "Pre-session snacks top up carbohydrate stores, especially important for pre-breakfast training or hard work. By default the app places this about an hour before your session." },
      { label: "FAQ · What happens when I mark a meal complete?", url: "/#faq", text: "Marking a meal complete locks that meal's targets to actual intake, and remaining calories and macros are redistributed across still-open meals using your meal distribution settings." },
      { label: "FAQ · Why would I choose to hide calories?", url: "/#faq", text: "Hiding calories keeps the focus on carbohydrates, protein, and fat. When enabled, kcal numbers are hidden across the home day view, meal cards, food search, and charts." },
      { label: "FAQ · How does Glycogo handle multiple workouts in a day?", url: "/#faq", text: "Each session gets its own pre-session, during-session, and recovery nutrition timing. Net training energy and carbohydrate needs reflect the combined load of all sessions." },
      { label: "Support", url: "/#support", text: "Support the project and read the builder bio. Contact for help with the app." }
    ]
  },

  {
    id: "fuel-ratio",
    title: "Fuel Ratio Calculator — Glucose:Fructose Carb Calculator for Endurance Athletes",
    url: "/fuel-ratio-calculator/",
    type: "Calculator",
    description: "Plan race-day carb intake with a glucose:fructose ratio calculator built on gut-absorption science. Compare 38 verified sports nutrition products from 23 brands plus whole foods against the 2:1 and 1:0.8 ratios used in endurance research.",
    keywords: [
      "glucose fructose ratio", "carb ratio", "fuel ratio", "energy gel comparison",
      "2:1 ratio", "1:0.8 ratio", "gut absorption", "SGLT1", "GLUT5", "carbohydrate absorption",
      "sports nutrition products", "whole foods", "race day fuelling", "intake target",
      "maltodextrin", "fructose", "glucose", "gel", "drink mix", "chews", "energy bar",
      "banana", "dates", "honey", "maple syrup", "rice", "sweet potato"
    ],
    aliases: [
      "maurten", "sis", "science in sport", "tailwind", "precision fuel", "neversecond",
      "enervit", "skratch", "torq", "high5", "226ers", "gel", "gels", "energy gels",
      "2 to 1", "glucose to fructose", "carb calculator", "fuel calculator", "race fuel"
    ],
    text: "The Fuel Ratio Calculator plans your race-day carb intake with a glucose:fructose ratio built on gut-absorption science. Gut absorption of glucose alone tops out around 60 g/hour; pairing it with fructose, which uses a separate transporter (SGLT1 for glucose, GLUT5 for fructose), allows higher total intake, down to a floor of 1:0.8 at 120 g/h and above. Set a target carb intake and session duration, build a fuel mix from whole foods or 38 verified sports nutrition products spanning 23 brands including Science in Sport, Maurten, Tailwind Nutrition, Precision Fuel and Hydration, Neversecond, Enervit, and Skratch Labs, and check your mix against your target with the fuel gauge.",
    sections: [
      { label: "Set your intake target", url: "/fuel-ratio-calculator/#target", text: "Set target carbs per hour and session duration. Glucose alone saturates around 60 g/h; pairing with fructose via a separate transporter supports up to 120 g/h and above at a 1:0.8 floor." },
      { label: "Whole foods — glucose % / fructose %", url: "/fuel-ratio-calculator/#foods", text: "Banana 49/49, dates 50/50, raisins 52/48, honey 47/53, maple syrup 56/44, apple 25/75, orange juice 45/55, sweet potato 80/20, white rice 100/0, table sugar 50/50, dextrose 100/0, maltodextrin 100/0." },
      { label: "Verified sports nutrition products", url: "/fuel-ratio-calculator/#products", text: "38 verified products across 23 brands: Science in Sport Beta Fuel, Maurten Gel 100 and Drink Mix, Tailwind High Carb Fuel, Precision Fuel PF 30 and PF 90, Neversecond C30 and C90, Enervit C2:1PRO, Skratch Labs, TORQ, HIGH5, 226ERS and more. Manufacturer-confirmed ratios." },
      { label: "Current fuel plan & gauge", url: "/fuel-ratio-calculator/#mix", text: "Build your fuel plan, see total carbs, glucose, fructose, and the G:F ratio of your mix, and compare it against the target blend with the fuel gauge." }
    ]
  },

  {
    id: "supplement-timer",
    title: "Athlete Supplement Timer — Evidence-Based Timing Planner",
    url: "/athlete_supplement_timer.html",
    type: "Calculator",
    description: "Build a personalized, evidence-based daily supplement timing schedule tailored to your routine, meals, and training sessions. Grounded in the IOC Consensus Statement and recent clinical research.",
    keywords: [
      "supplement timing", "supplement schedule", "when to take supplements",
      "caffeine", "creatine", "beta-alanine", "whey protein", "casein", "collagen",
      "vitamin C", "vitamin D3", "vitamin K2", "omega-3", "iron", "calcium", "zinc",
      "magnesium", "potassium", "beetroot", "nitrate", "bicarbonate", "sulforaphane",
      "IOC consensus", "anti-doping", "informed sport", "calendar reminders"
    ],
    aliases: [
      "when should i take creatine", "caffeine timing", "pre workout supplement",
      "protein timing", "vitamin d", "omega 3", "beetroot juice", "supplement planner",
      "supplement reminder", "nutrient timing"
    ],
    text: "The Athlete Supplement Timer builds an evidence-based daily supplement timing schedule around your training sessions, meal times, absorption considerations, and sleep. Select the supplements you use — caffeine, creatine, beta-alanine, whey and casein protein, collagen with vitamin C, vitamin D3, omega-3, dietary nitrate or beetroot, bicarbonate, electrolytes, and micronutrients like iron, calcium, zinc, magnesium, and potassium — set your routine, and download calendar reminders. Grounded in the IOC Consensus Statement on dietary supplements and the high-performance athlete, with safety guidance on micronutrients and anti-doping (Informed-Sport / HASTA batch-tested products).",
    sections: [
      { label: "Build your schedule", url: "/athlete_supplement_timer.html#build", text: "Add training sessions, meal times, bed time, and select supplements to generate a suggested daily timing schedule with rationale for each supplement." },
      { label: "Suggested schedule", url: "/athlete_supplement_timer.html#schedule", text: "A personalized day plan showing when to take each supplement relative to training, meals, and sleep, with evidence notes." },
      { label: "Scientific references", url: "/athlete_supplement_timer.html#refs", text: "Maughan et al. 2018 IOC Consensus Statement, Morton et al. protein and resistance training, Kerksick ISSN nutrient timing, Spriet caffeine, ISSN creatine and beta-alanine position stands, Jones dietary nitrate, Close vitamin D3, Philpott omega-3." }
    ]
  },

  {
    id: "instructions",
    title: "Instructions — How to use Glycogo",
    url: "/instructions",
    type: "Docs",
    description: "How to use Glycogo: periodised nutrition planning for athletes. Quick start, settings, logging, sessions, AI assistant, and references.",
    keywords: [
      "how to use", "getting started", "quick start", "tutorial", "guide",
      "settings", "energy availability", "macro split", "critical power", "critical speed",
      "carbohydrates per hour", "minimum duration", "session RPE", "Borg CR100",
      "log food", "meal templates", "suggest quantities", "carb load", "save day", "trends",
      "AI coach", "Intervals.icu", "sync workouts", "device calories", "reset day"
    ],
    aliases: [
      "setup", "onboarding", "documentation", "help", "how do i", "how to log food",
      "rpe scale", "settings reference", "what is energy availability", "training zones"
    ],
    text: "How to use Glycogo: sign in on the app or at web.glycogo.fit, finish onboarding, add or sync today's training, log meals, mark meals complete, and save your day. Configure settings for body weight, energy availability, macro split, meal distribution, sports, carbohydrates per hour, minimum duration for carbohydrates, critical power and pace, and device sync via Intervals.icu. Log food from meal cards or the foods tab, use suggest quantities, meal templates, and carb load. Rate session RPE on the Borg CR100 scale, which sets carbs and calories per hour. Use the AI nutrition assistant for fast logging and fuelling advice. Save your day to build trends and history.",
    sections: [
      { label: "1-minute quick start", url: "/instructions#quick-start", text: "Sign in, add today's training or sync, log meals, mark meals complete, save your day." },
      { label: "Log In", url: "/instructions#login", text: "Your logs, foods, settings and history stay linked to your account. Syncing workouts requires a free Intervals.icu account." },
      { label: "Configure Settings", url: "/instructions#settings", text: "Body weight, body fat, energy availability, macro split, meal distribution, sports, carbs per hour lower and upper, minimum duration, critical power and pace, efficiency, and device session calories." },
      { label: "Build Your Food Library", url: "/instructions#database", text: "Add custom foods, quick add, barcode scan, or search the extensive database and add favourites." },
      { label: "Add or Sync Training Sessions", url: "/instructions#sessions", text: "Training drives fuel targets. Add sessions manually or sync from your device. RPE sets carbs and calories per hour; duration scales the during-session total. High-carb fuelling and merge sessions options." },
      { label: "Plan and Log Nutrition", url: "/instructions#logging", text: "Log food, suggest quantities fills remaining macros, meal templates reload saved combinations, carb load raises baseline carbs. Mark a meal complete to redistribute remaining targets." },
      { label: "AI Nutrition Assistant", url: "/instructions#ai", text: "Fast-log food, get meal ideas and recipes, or ask about fuelling around training. The coach sees your sessions, targets, and current log." },
      { label: "Save Your Day & Track Trends", url: "/instructions#save", text: "Save Day stores completed nutrition and training data in Trends. Charts appear after saving a few days." },
      { label: "Nutrition Settings Reference", url: "/instructions#settings-ref", text: "Energy availability zones (25-30 low REDs risk, 30-40 moderate, 40-45 optimal, 45-55 high), macro split, carb load, sport parameters, critical power and pace, efficiency, carbs per hour, minimum duration, device session calories." },
      { label: "RPE Reference Scale", url: "/instructions#rpe-ref", text: "Borg CR100: 0-10 very easy, 20-30 steady easy, 30-40 moderate, 40-50 moderately hard, 50-60 strong, 60-70 hard, 70-80 very hard, 80-90 extremely hard, 90-100 maximal. Maps to training zones." },
      { label: "Scientific references", url: "/instructions#refs", text: "Rothschild et al. 2025 carbohydrate and energy expenditure prediction, Impey et al. CHO periodization, Burke et al. carbohydrates for training, Morton et al. protein, Mountjoy et al. IOC REDs consensus, USDA FoodData Central." }
    ]
  },

  {
    id: "beta",
    title: "Early Access — Join the Glycogo Android Beta",
    url: "/beta",
    type: "Early access",
    description: "Join Glycogo early access on Android: join the group, join the closed test, install the app.",
    keywords: [
      "beta", "early access", "android", "google group", "closed test", "install",
      "play store", "test new features"
    ],
    aliases: ["join beta", "android app", "download app", "closed testing", "tester"],
    text: "Help shape Glycogo by testing new Android features before they launch. Use the same Google account for three steps: join the Google Group, join the closed test, and install the app from the Play Store.",
    sections: [
      { label: "Join early access", url: "/beta", text: "Join the Google Group, join the closed test on Google Play, then install the Glycogo Android app." }
    ]
  },

  {
    id: "privacy",
    title: "Privacy Policy — Glycogo",
    url: "/privacy",
    type: "Legal",
    description: "Privacy Policy for Glycogo — periodised nutrition planning for endurance athletes.",
    keywords: ["privacy policy", "data", "personal data", "gdpr", "cookie", "consent", "third party", "deletion", "rights"],
    aliases: ["privacy", "data protection", "what data do you collect"],
    text: "Privacy policy for Glycogo: what personal data is collected, how it is used and stored, third-party services, cookies, your rights, and how to contact us. Covers account data, nutrition logs, training data, and device information.",
    sections: [
      { label: "Privacy Policy", url: "/privacy", text: "What data Glycogo collects, how it is used, third-party services, cookies, retention, and your rights under applicable data protection law." }
    ]
  },

  {
    id: "terms",
    title: "Terms of Service — Glycogo",
    url: "/terms",
    type: "Legal",
    description: "Terms of Service for Glycogo — periodised nutrition planning for endurance athletes.",
    keywords: ["terms of service", "terms", "conditions", "license", "subscription", "refund", "liability", "acceptable use"],
    aliases: ["terms and conditions", "tos", "legal"],
    text: "Terms of service for Glycogo: your account, the free tier and premium subscription, acceptable use, intellectual property, disclaimers, limitation of liability, and changes to the service.",
    sections: [
      { label: "Terms of Service", url: "/terms", text: "Terms governing your use of Glycogo, including accounts, subscriptions, acceptable use, IP, liability, and termination." }
    ]
  },

  {
    id: "delete-account",
    title: "Delete Account — Glycogo",
    url: "/delete-account",
    type: "Legal",
    description: "How to delete your Glycogo account and associated data.",
    keywords: ["delete account", "delete data", "account deletion", "remove account", "cancel", "data erasure"],
    aliases: ["how do i delete my account", "delete my data", "cancel account", "delete app data"],
    text: "How to delete your Glycogo account: request deletion by email, what data is deleted when the account is removed, data that may be kept after deletion, and where to ask questions.",
    sections: [
      { label: "Request deletion by email", url: "/delete-account", text: "Request account deletion by email. Data is deleted when your account is removed; some data may be kept after deletion for legal or security reasons." }
    ]
  }
];
