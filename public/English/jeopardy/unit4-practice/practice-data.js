/* Unit 4 book practice, pages 61 to 65 (4B, 4C, 4D, Test Yourself 3 and 4), in the same order as the book.
   Each section: book, title, task, optional passage with {n} gaps, fixed (keep the choices in this order), qs.
   Each question: q (use ___ for the gap), o (choices), a (the right choice), why (shown after answering),
   n (which {n} gap in the passage it fills), text (a short text to read with the question). */
window.PRACTICE = {
  title: "Unit 4 Practice",
  sub: "Book pages 61–65",
  sections: [
    {
      book: "4B", title: "Climate change", task: "Complete the text with one of the words.",
      passage: "The {1} is a common conversation for many people each day. The {2} can change day-to-day or even from hour-to-hour. On the other hand, the {3} in an area usually takes a long time to change. It is the average {4} and conditions in a specific place over a long period of time. The {5} does not change day-to-day or even month-to-month, but usually takes hundreds, thousands, or millions of years to change.",
      fixed: true,
      qs: [
        { n: 1, o: ["weather", "sun", "climate"], a: "weather", why: "People talk about the weather every day: rain, sun, wind today." },
        { n: 2, o: ["weather", "wind", "climate"], a: "weather", why: "The weather changes from day to day, even from hour to hour." },
        { n: 3, o: ["climate", "temperature", "weather"], a: "climate", why: "\"On the other hand\": now the text talks about the climate, which changes slowly." },
        { n: 4, o: ["weather", "temperature", "climate"], a: "weather", why: "Climate is the average weather in a place over a long time." },
        { n: 5, o: ["weather", "floods", "climate"], a: "climate", why: "The climate takes hundreds or thousands of years to change." }
      ]
    },
    {
      book: "4B", title: "have to / must / should (not)", task: "Fill in the gaps with have to / must / should (not).",
      qs: [
        { q: "When the weather is very hot, you ___ sunbathe because it is very harmful for your skin.", o: ["shouldn't", "should", "have to"], a: "shouldn't", why: "Advice not to do something: shouldn't." },
        { q: "The climate is constantly changing, however we ___ definitely do something about the extreme changes.", o: ["must", "mustn't", "shouldn't"], a: "must", why: "A strong necessity: must." },
        { q: "We ___ find alternative sources of energy.", o: ["have to", "mustn't", "shouldn't"], a: "have to", why: "It is necessary: have to (must is also right here)." },
        { q: "You ___ buy water in glass bottles, all that plastic waste is a huge problem.", o: ["should", "shouldn't", "mustn't"], a: "should", why: "Good advice: should." },
        { q: "Industrialised nations ___ reduce the amount of carbon dioxide in the atmosphere.", o: ["must", "mustn't", "shouldn't"], a: "must", why: "A strong necessity: must." }
      ]
    },
    {
      book: "4B", title: "Stoya and Julia", task: "Fill in the gaps in the dialogue.",
      passage: "Stoya: We {1} stop talking and start doing something about climate change.\nJulia: I don't think it will change anything. It's too late.\nStoya: You {2} give up, we {3} keep working for change. We {4} start using renewable energy for example!",
      qs: [
        { n: 1, o: ["have to", "shouldn't", "don't have to"], a: "have to", why: "It is necessary to act now: have to (must also works)." },
        { n: 2, o: ["shouldn't", "should", "have to"], a: "shouldn't", why: "Advice: don't give up = you shouldn't give up." },
        { n: 3, o: ["must", "mustn't", "shouldn't"], a: "must", why: "A strong necessity: we must keep working." },
        { n: 4, o: ["should", "shouldn't", "mustn't"], a: "should", why: "A good idea, an example: we should start using renewable energy." }
      ]
    },
    {
      book: "4C", title: "Green Energy words", task: "The words from the word search. Choose the word for each meaning.",
      qs: [
        { q: "to make something smaller or less in size or amount", o: ["reduce", "expand", "emission"], a: "reduce", why: "reduce: Try to reduce the amount of fat in your diet." },
        { q: "a situation in which things happen as they should and there are no harmful changes", o: ["stability", "drought", "disaster"], a: "stability", why: "stability: Many African countries need political stability." },
        { q: "to become larger in size and fill more space", o: ["expand", "reduce", "flood"], a: "expand", why: "expand: The water froze inside the pipe, causing it to expand and burst." },
        { q: "gas sent out into the air, for example from cars and factories", o: ["emission", "climate", "stability"], a: "emission", why: "emission: Cars are a big source of carbon dioxide emissions." },
        { q: "deserving to be blamed for something that has happened", o: ["responsible", "industrial", "renewable"], a: "responsible", why: "responsible: Parents feel responsible when things go wrong." },
        { q: "a long period of time when there is little or no rain and crops die", o: ["drought", "flood", "weather"], a: "drought", why: "drought: The drought in Africa has killed thousands of people." }
      ]
    },
    {
      book: "4C", title: "Use the words", task: "Choose the word that completes the sentence.",
      qs: [
        { q: "We need to ___ the amount of plastic we use.", o: ["reduce", "expand", "emission"], a: "reduce", why: "reduce = make smaller or less." },
        { q: "Factories are ___ for a lot of air pollution.", o: ["responsible", "stability", "reduce"], a: "responsible", why: "be responsible for something." },
        { q: "Cities ___ when more people move there.", o: ["expand", "reduce", "drought"], a: "expand", why: "expand = get bigger." },
        { q: "Carbon dioxide ___ from cars make the air dirty.", o: ["emissions", "stability", "droughts"], a: "emissions", why: "emissions = gases that go into the air." },
        { q: "After the war, the country finally had peace and ___.", o: ["stability", "emission", "responsible"], a: "stability", why: "stability = no harmful changes." }
      ]
    },
    {
      book: "4C", title: "Strange renewable energy sources", task: "Read the text quickly and match it with the picture.",
      fixed: true,
      qs: [
        { text: "There's solar power, and there are wind turbines, so what's ___? In practice, harnessing this energy is currently just a theory. However, if possible, we could potentially source one hundred billion times more power than humanity needs.", q: "Text A is about…", o: ["Jellyfish", "The power of dance", "Exploding lakes", "Solar wind"], a: "Solar wind", why: "Solar power + wind turbines → solar wind." },
        { text: "This technology uses crystals that create a spark when pressure is applied, so the vibrations of a packed dance floor are a mine of potential electronic energy which can be circulated back into the building's power supply.", q: "Text B is about…", o: ["Jellyfish", "The power of dance", "Exploding lakes", "Solar wind"], a: "The power of dance", why: "A packed dance floor makes vibrations." },
        { text: "A particular ___ protein can create a photovoltaic (solar) cell. This unusual science came to us from the researchers in Sweden, and it promises to be a low-cost step towards renewable energy. The official name for this renewable energy is 'bio-solar'.", q: "Text C is about…", o: ["Jellyfish", "The power of dance", "Exploding lakes", "Solar wind"], a: "Jellyfish", why: "A jellyfish protein makes a solar cell: bio-solar." },
        { text: "There are only three known in the world and they are known as ___ due to their deadly reservoirs of methane and carbon dioxide. These gases are trapped, but if the water temperature of the lakes changes, a limnic eruption will occur.", q: "Text D is about…", o: ["Jellyfish", "The power of dance", "Exploding lakes", "Solar wind"], a: "Exploding lakes", why: "Lakes with trapped gases that can erupt." }
      ]
    },
    {
      book: "4C", title: "Answer the questions", task: "Think about the four texts.",
      fixed: true,
      qs: [
        { q: "Which is the most effective power source?", o: ["Solar wind", "The power of dance", "Jellyfish (bio-solar)", "Exploding lakes"], a: "Solar wind", why: "It could give one hundred billion times more power than humanity needs." },
        { q: "Which is the most practical source of energy?", o: ["Solar wind", "The power of dance", "Jellyfish (bio-solar)", "Exploding lakes"], a: "The power of dance", why: "It already works in a building: the energy goes back into its power supply. Solar wind is still just a theory." },
        { q: "Which is the cheapest form of energy?", o: ["Solar wind", "The power of dance", "Jellyfish (bio-solar)", "Exploding lakes"], a: "Jellyfish (bio-solar)", why: "The text says it is \"a low-cost step\" towards renewable energy." }
      ]
    },
    {
      book: "4C", title: "True or False?", task: "Read the texts again. True or false?",
      fixed: true,
      qs: [
        { q: "Using Solar Wind as an energy source is common.", o: ["True", "False"], a: "False", why: "It is \"currently just a theory\"." },
        { q: "The known Exploding Lakes in the world include methane and carbon dioxide.", o: ["True", "False"], a: "True", why: "They have \"deadly reservoirs of methane and carbon dioxide\"." },
        { q: "Using Jellyfish as an energy source was suggested by Swiss scientists.", o: ["True", "False"], a: "False", why: "The researchers were in Sweden, so they were Swedish, not Swiss." },
        { q: "Vibes can be turned into energy.", o: ["True", "False"], a: "True", why: "The vibrations of a dance floor make electricity." },
        { q: "Bio-solar energy is not renewable.", o: ["True", "False"], a: "False", why: "It is \"a step towards renewable energy\"." },
        { q: "Temperature rise in the water of Exploding Lakes can be dangerous for people.", o: ["True", "False"], a: "True", why: "If the water temperature changes, the lake erupts and the gases are deadly." }
      ]
    },
    {
      book: "4D", title: "can for ability or permission", task: "Fill in the blank with can or can't. Is it ability or permission?",
      fixed: true,
      qs: [
        { q: "A: Where is my suitcase? I ___ find it anywhere.\nB: I think it is in your room.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can't (ability)", why: "I am not able to find it." },
        { q: "Oh! Look! It is under the bed, but I ___ reach it.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can't (ability)", why: "I am not able to reach it." },
        { q: "I want to go to Europe, but I ___ afford it. I am working hard these days to put some money aside.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can't (ability)", why: "I don't have enough money: I am not able to pay for it." },
        { q: "I've got two tickets for a China flight, but none of my friends ___ come with me.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can (ability)", why: "\"none of my friends\" is already negative, so the verb is positive: none of them are able to come." },
        { q: "My friend asked me to go with him to Italy on Sunday, but I ___ go.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can't (ability)", why: "I am not able to go (I am busy). Nobody says no to me." },
        { q: "I want to live in England, but I ___ speak English.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can't (ability)", why: "Speaking a language is an ability." },
        { q: "He wants to go on a trip, but I know he ___ go, because he's so busy.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can't (ability)", why: "He is too busy: he is not able to go." },
        { q: "Joe is so strong. I am sure he ___ lift this suitcase.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can (ability)", why: "He is strong: he is able to lift it." },
        { q: "His parents won't let him go on a holiday, so he ___ come with us.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can't (permission)", why: "\"won't let him\": his parents say no." },
        { q: "He ___ leave the city without seeing me.", o: ["can (ability)", "can't (ability)", "can (permission)", "can't (permission)"], a: "can't (permission)", why: "I don't allow it: he must see me first." }
      ]
    },
    {
      book: "4D", title: "can for offers and requests", task: "Choose the best offer or request with can.",
      qs: [
        { q: "An old lady can't carry her suitcase. What do you say?", o: ["Can I help you carry your suitcase?", "Can you carry my suitcase?", "You can't carry your suitcase."], a: "Can I help you carry your suitcase?", why: "An offer: Can I help you…?" },
        { q: "You've been looking for your sunglasses for an hour, and you learn that your sister took them. What would you say to get them back?", o: ["Can you give me my sunglasses back, please?", "Can I take your sunglasses, please?", "Can I help you find your sunglasses?"], a: "Can you give me my sunglasses back, please?", why: "A request: Can you give me… back, please?" },
        { q: "You're bored with working hard. You need to relax and have a holiday, but you don't want to go alone. Ask a friend to join you.", o: ["Can you come on holiday with me?", "Can I go to work with you?", "You can't come on holiday with me."], a: "Can you come on holiday with me?", why: "A request: Can you come…?" },
        { q: "Your mother wants you to go with her on holiday. What does she say?", o: ["Can you come on holiday with me this summer?", "Can I go on holiday with you this summer?", "Can you go on holiday alone this summer?"], a: "Can you come on holiday with me this summer?", why: "She asks you to come with her: Can you come…?" },
        { q: "You and your brother are on winter term break. You want to go trekking in the mountains. You ask your father:", o: ["Dad, can we go trekking in the mountains?", "Dad, can you go trekking in the mountains?", "Dad, we can't go trekking in the mountains."], a: "Dad, can we go trekking in the mountains?", why: "Asking for permission: Can we…?" }
      ]
    },
    {
      book: "4D", title: "may, might, must, can for possibility", task: "Fill in the blanks with can, must, may or might. Some may be negative.",
      qs: [
        { q: "A: Where are you going for holiday?\nB: I haven't decided yet. I ___ go to America.", o: ["might", "must", "can't"], a: "might", why: "Maybe, not sure yet: might (may also works)." },
        { q: "A: Do you think David will come with us to France?\nB: I don't know. He ___ come.", o: ["may", "must", "can't"], a: "may", why: "\"I don't know\": maybe, so may (might also works)." },
        { q: "A: Do you know where John is these days? I know that he is travelling around the world.\nB: He ___ be in China because he was talking about going to China after Japan.", o: ["must", "can't", "mustn't"], a: "must", why: "B is almost sure: must." },
        { q: "B: He must be in China.\nA: No, he ___ be in China. It is really hard to get a visa there.", o: ["can't", "must", "might"], a: "can't", why: "A is sure it is not possible: can't." },
        { q: "A: I am going to Ireland next week. I've always wanted to go there since I was a little girl.\nB: Oh! You ___ be very happy then.", o: ["must", "can't", "might not"], a: "must", why: "B is sure, because she always wanted to go: must." },
        { q: "A: Do you know how many hours the flight from Berlin to London takes?\nB: I am not sure. It ___ take more than an hour. It's not a long flight.", o: ["can't", "must", "mustn't"], a: "can't", why: "It's a short flight, so more than an hour is not possible: can't." },
        { q: "A: There is a rumour that Julie moved to Canada. Did you know that?\nB: No, that ___ be true. I saw her last week in the shopping mall.", o: ["can't", "must", "might"], a: "can't", why: "B saw her last week, so it is not possible: can't." }
      ]
    },
    {
      book: "Test Yourself 3", title: "Present Perfect", task: "Which sentence is the same, in the Present Perfect?",
      qs: [
        { q: "Yasemin didn't finish the project so we're late.", o: ["Yasemin hasn't finished the project, so we're late.", "Yasemin hasn't finish the project, so we're late.", "Yasemin haven't finished the project, so we're late."], a: "Yasemin hasn't finished the project, so we're late.", why: "she → hasn't + past participle (finished)." },
        { q: "Did they finish the presentation?", o: ["Have they finished the presentation?", "Has they finished the presentation?", "Have they finish the presentation?"], a: "Have they finished the presentation?", why: "Question: Have + they + past participle." },
        { q: "Cenk didn't read the instructions.", o: ["Cenk hasn't read the instructions.", "Cenk hasn't readed the instructions.", "Cenk haven't read the instructions."], a: "Cenk hasn't read the instructions.", why: "read – read – read: the past participle is read." },
        { q: "He was an IT specialist.", o: ["He has been an IT specialist.", "He has was an IT specialist.", "He have been an IT specialist."], a: "He has been an IT specialist.", why: "be – was – been: he has been." },
        { q: "Were you in Istanbul?", o: ["Have you been to Istanbul?", "Have you were in Istanbul?", "Has you been to Istanbul?"], a: "Have you been to Istanbul?", why: "Have you been to…? = at any time in your life." }
      ]
    },
    {
      book: "Test Yourself 3", title: "How long…? for and since", task: "Choose the correct answer. Then say your own answer!",
      qs: [
        { q: "How long have you studied English?", o: ["I have studied English for three years.", "I have studied English since three years.", "I study English for three years."], a: "I have studied English for three years.", why: "for + a period of time (three years)." },
        { q: "How long have you had a smart phone?", o: ["I have had a smart phone since 2018.", "I have had a smart phone for 2018.", "I had a smart phone since 2018."], a: "I have had a smart phone since 2018.", why: "since + a point in time (2018)." },
        { q: "How long have you had an e-mail address?", o: ["I have had an e-mail address for ten years.", "I have an e-mail address since ten years.", "I have had an e-mail address since ten years."], a: "I have had an e-mail address for ten years.", why: "for + a period of time." },
        { q: "How long have you been alive?", o: ["I have been alive since I was born.", "I have been alive for I was born.", "I am alive since I was born."], a: "I have been alive since I was born.", why: "since + the moment it started." },
        { q: "How long have you had a job?", o: ["I have had a job since last summer.", "I have had a job for last summer.", "I had a job since last summer."], a: "I have had a job since last summer.", why: "since + last summer (a point in time)." },
        { q: "How long have you lived in your house / apartment?", o: ["I have lived here for five years.", "I have lived here since five years.", "I live here for five years."], a: "I have lived here for five years.", why: "for + five years." },
        { q: "How long have you been awake today?", o: ["I have been awake since 7 o'clock.", "I have been awake for 7 o'clock.", "I am awake since 7 o'clock."], a: "I have been awake since 7 o'clock.", why: "since + a time on the clock." }
      ]
    },
    {
      book: "Test Yourself 3", title: "Glossary", task: "Choose the word for the meaning.",
      qs: [
        { q: "a formal request for permission to do or have something", o: ["application", "comment", "calendar"], a: "application", why: "They didn't accept his application for membership of the club." },
        { q: "a set of pages showing the days, weeks and months of a particular year", o: ["calendar", "newsfeed", "upload"], a: "calendar", why: "Desk calendars aren't as popular as they used to be." },
        { q: "a written or spoken remark giving an opinion", o: ["comment", "share", "follow"], a: "comment", why: "I've had enough of your sarcastic comments." },
        { q: "performances that people enjoy", o: ["entertainment", "application", "calendar"], a: "entertainment", why: "A jazz band provided the entertainment." },
        { q: "to walk, drive etc. behind someone when you are going in the same direction", o: ["follow", "share", "upload"], a: "follow", why: "Ralph set off down the hill, and I followed." },
        { q: "to use or to have something at the same time as someone else", o: ["share", "follow", "comment"], a: "share", why: "Do you mind sharing a table?" },
        { q: "a web page or screen that updates often to show the latest news or information", o: ["newsfeed", "calendar", "application"], a: "newsfeed", why: "Are you following the latest newsfeed about the earthquake in Tokyo?" },
        { q: "to send documents or programs from your computer or phone to a larger system using the Internet", o: ["upload", "share", "follow"], a: "upload", why: "upload = send from your device to the Internet." }
      ]
    },
    {
      book: "Test Yourself 4", title: "Type 0 and 1 conditionals", task: "Put the verbs in brackets into the correct tenses.",
      qs: [
        { q: "If I see him, I ___ (give) him a lift.", o: ["will give", "give", "gave"], a: "will give", why: "If + present, will + verb." },
        { q: "The table will break if you ___ (sit) on it.", o: ["sit", "will sit", "sat"], a: "sit", why: "After if: present simple, not will." },
        { q: "If he ___ (eat) all that, he will be ill.", o: ["eats", "will eat", "eat"], a: "eats", why: "After if: present simple. he → eats." },
        { q: "If I find your passport, I ___ (phone) you.", o: ["will phone", "phone", "phoned"], a: "will phone", why: "If + present, will + verb." },
        { q: "The police ___ (arrest) him, if they catch him.", o: ["will arrest", "arrest", "arrested"], a: "will arrest", why: "The result part takes will." },
        { q: "If you come late, they ___ (not let) you in.", o: ["won't let", "don't let", "not let"], a: "won't let", why: "Result: will not = won't." },
        { q: "If he ___ (go) on telling lies, the situation will be more complicated.", o: ["goes", "will go", "go"], a: "goes", why: "After if: present simple. he → goes." },
        { q: "If I lend you $10, when ___ me? (you / repay)", o: ["will you repay", "do you repay", "you will repay"], a: "will you repay", why: "A question in the result part: will + you + verb." }
      ]
    },
    {
      book: "Test Yourself 4", title: "Modals for obligation", task: "Complete with must, have to, don't have to or mustn't.",
      qs: [
        { q: "You ___ have a passport if you want to travel abroad.", o: ["have to", "don't have to", "mustn't"], a: "have to", why: "It is necessary (a rule): have to / must." },
        { q: "You ___ stand on the plane. There are seats for everyone.", o: ["don't have to", "must", "have to"], a: "don't have to", why: "It isn't necessary: don't have to." },
        { q: "You ___ have a ticket with your name on or you can't travel.", o: ["must", "mustn't", "don't have to"], a: "must", why: "It is necessary: must / have to." },
        { q: "There are lots of buses so you ___ drive to the airport.", o: ["don't have to", "must", "mustn't"], a: "don't have to", why: "There are buses, so it isn't necessary." },
        { q: "You ___ leave your bags with someone you don't know.", o: ["mustn't", "don't have to", "have to"], a: "mustn't", why: "It is not allowed / a bad idea: mustn't." },
        { q: "You ___ have an appointment for this doctor. You can go and see him whenever you want.", o: ["don't have to", "must", "mustn't"], a: "don't have to", why: "You can go any time, so it isn't necessary." },
        { q: "We are already late. We ___ waste any more time.", o: ["mustn't", "don't have to", "have to"], a: "mustn't", why: "Don't do it: mustn't." },
        { q: "I ___ go back again. The treatment is finished.", o: ["don't have to", "must", "mustn't"], a: "don't have to", why: "The treatment is finished, so it isn't necessary." }
      ]
    },
    {
      book: "Test Yourself 4", title: "Glossary", task: "Choose the word that completes the sentence.",
      qs: [
        { q: "The ___ in Antalya is hot in the summer and mild in the winter.", o: ["climate", "weather", "flood"], a: "climate", why: "climate: the type of weather for a country or region." },
        { q: "A series of ___ forced the company to close down.", o: ["disasters", "droughts", "climates"], a: "disasters", why: "disaster: something very bad that causes a lot of damage." },
        { q: "The ___ in Africa has killed thousands of people.", o: ["drought", "flood", "stability"], a: "drought", why: "drought: a long time with little or no rain." },
        { q: "The water froze inside the pipe, causing it to ___ and burst.", o: ["expand", "reduce", "flood"], a: "expand", why: "expand: become larger." },
        { q: "Water burst through the dam and ___ local villages.", o: ["flooded", "expanded", "reduced"], a: "flooded", why: "flood: water covers a place." },
        { q: "America's ___ production fell for the fourth successive month.", o: ["industrial", "responsible", "climate"], a: "industrial", why: "industrial: relating to industry." },
        { q: "Try to ___ the amount of fat in your diet.", o: ["reduce", "expand", "flood"], a: "reduce", why: "reduce: make smaller or less." },
        { q: "Parents feel ___ when things go wrong.", o: ["responsible", "industrial", "stable"], a: "responsible", why: "responsible: deserving to be blamed." },
        { q: "Many African countries need political ___.", o: ["stability", "disaster", "drought"], a: "stability", why: "stability: no harmful changes." },
        { q: "Unsettled ___ will continue through the weekend.", o: ["weather", "climate", "drought"], a: "weather", why: "weather: the conditions in the atmosphere now." }
      ]
    }
  ]
};
