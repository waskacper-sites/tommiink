/* ==========================================================================
   TOMMI INK - Tomasz Derza | Skrypt Główny
   Lokalizacja: ul. Jagiellońska 29, 33-300 Nowy Sącz | Tel: 607 554 060
   ========================================================================== */

const CONFIG = {
    STUDIO_NAME: "TOMMI INK - Tomasz Derza",
    STUDIO_ADDRESS: "ul. Jagiellońska 29, 33-300 Nowy Sącz",
    STUDIO_PHONE: "607 554 060",
    INSTAGRAM_URL: "https://www.instagram.com/tommi_ink/",
    DEMO_CONTACT_EMAIL: "kacperekwas1@gmail.com",
    DEMO_ADMIN_EMAIL: "admin@tommi-ink.pl",
    DEMO_ADMIN_PASS: "admin123",
    LOCAL_STORAGE_KEY: "tommi_ink_bookings",
    LOCAL_STORAGE_HISTORY_KEY: "tommi_ink_bookings_history"
};

/* ==================== STAN APLIKACJI I WIZARDA ==================== */
const todayDate = new Date();
let currentRealYear = todayDate.getFullYear();
let currentRealMonth = todayDate.getMonth(); // 0-11
let currentRealDay = todayDate.getDate();

let calendarYear = currentRealYear;
let calendarMonth = currentRealMonth;

let bookingState = {
    step: 1,
    serviceKey: 'surrealism',
    serviceName: 'Surrealizm & Mikrorealizm',
    placement: '',
    size: '',
    description: '',
    photo: null, // { name, dataUrl, size }
    date: null,
    time: null,
    client: {
        name: '',
        phone: '',
        email: '',
        instagram: '',
        notes: ''
    }
};

const servicesData = {
    'surrealism': {
        name: 'Surrealizm & Mikrorealizm',
        desc: 'Czaszki, rzeźby, geometria i głębokie mikro-detale.'
    },
    'blackgrey': {
        name: 'Black & Grey (Smoki & Realizm)',
        desc: 'Japońskie smoki, motywy orientalne i pełne cieniowanie.'
    },
    'fineline': {
        name: 'Fine-Line & Linework',
        desc: 'Cienkie, eleganckie linie, flora, subtelne kontury.'
    },
    'konsultacja': {
        name: 'Konsultacja & Projekt',
        desc: 'Spotkanie w studio przy Jagiellońskiej 29 i omówienie koncepcji.'
    }
};

/* ==================== DANE PORTFOLIO & LIGHTBOX ==================== */
const portfolioItems = [
    {
        src: 'portfolio-1.jpg',
        title: 'Klasyczna Rzeźba & Pęknięta Czaszka',
        category: 'Surrealizm & Geometria',
        desc: 'Złożona kompozycja popiersia Dawida z geometrycznie popękaną strukturą czaszki i mikro-detalem cieniowania.'
    },
    {
        src: 'portfolio-2.jpg',
        title: 'Japoński Smok na Dłoni',
        category: 'Black & Grey Hand',
        desc: 'Dynamiczny orientalny smok japoński wznoszący się od nadgarstka ku palcom – idealne dopasowanie do anatomii dłoni.'
    },
    {
        src: 'portfolio-3.png',
        title: 'Smok Ku Pełni Księżyca',
        category: 'Oriental Linework',
        desc: 'Harmonijna, pionowa kompozycja na plecach łącząca tradycyjną japońską linię smoka z motywem księżyca.'
    },
    {
        src: 'portfolio-4.png',
        title: 'Gałązka Roślinna na Stopie',
        category: 'Fine-Line Flora',
        desc: 'Ultracienka, kobieca kompozycja florystyczna wykonana z jubilerską precyzją konturu na wrażliwej części stopy.'
    }
];

let currentLightboxIndex = 0;

/* ==================== HARMONOGRAM I GODZINY STUDIA ==================== */
// Pon-Pt (1-5): 10:00 - 18:00
// Sobota (6): 10:00 - 14:00
// Niedziela (0): Zamknięte
function getTimeSlotsForDate(dateStr) {
    if (!dateStr) return [];
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = d.getDay();

    if (dayOfWeek === 0) {
        return []; // Niedziela zamknięte
    }
    if (dayOfWeek === 6) {
        // Sobota: 10:00 - 14:00
        return ['10:00', '11:30', '13:00'];
    }
    // Poniedziałek - Piątek: 10:00 - 18:00
    return ['10:00', '11:30', '13:00', '14:30', '16:00', '17:00'];
}

/* ==================== DANE DEMO W LOCALSTORAGE ==================== */
function getRelativeDateStr(daysOffset, skipSunday = true) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    if (skipSunday && d.getDay() === 0) {
        d.setDate(d.getDate() + 1);
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

const DEMO_VERSION = 'v2_notes';

function ensureInitialDemoData() {
    const currentVer = localStorage.getItem('tommi_ink_version');
    let active = [];
    try {
        active = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
    } catch (e) {
        active = [];
    }

    if (currentVer !== DEMO_VERSION || !Array.isArray(active) || active.length === 0) {
        localStorage.setItem('tommi_ink_version', DEMO_VERSION);
        const datePartial1 = getRelativeDateStr(2);
        const dateFull = getRelativeDateStr(4);
        const datePartial2 = getRelativeDateStr(6);

        // Generujemy pełne zajęcie dla dateFull, aby zademonstrować dzień zablokowany
        const fullSlots = getTimeSlotsForDate(dateFull);
        const fullBookings = fullSlots.map((time, idx) => ({
            id: `TI-48${idx}10`,
            createdAt: new Date(Date.now() - 3600000 * (12 + idx)).toISOString(),
            serviceKey: idx % 2 === 0 ? 'surrealism' : 'blackgrey',
            serviceName: idx % 2 === 0 ? 'Surrealizm & Mikrorealizm' : 'Black & Grey (Smoki & Realizm)',
            placement: 'Przedramię / Ramię',
            approxSize: '15-20 cm',
            ideaDesc: 'Rezerwacja sesji całodziennej / projekt indywidualny.',
            date: dateFull,
            time: time,
            client: {
                name: ['Mateusz Zieliński', 'Karolina Nowak', 'Piotr Wójcik', 'Dawid Kozioł', 'Tomasz Lis', 'Kamil Bober'][idx] || 'Klient Studia',
                email: `klient${idx}@example.com`,
                phone: `+48 601 000 00${idx}`,
                instagram: `klient_${idx}`,
                notes: 'Brak przeciwwskazań zdrowotnych.'
            },
            photo: null,
            status: 'confirmed'
        }));

        const demoActive = [
            {
                id: 'TI-782194',
                createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
                serviceKey: 'surrealism',
                serviceName: 'Surrealizm & Mikrorealizm',
                placement: 'Prawe przedramię',
                approxSize: 'Średni (10 - 18 cm)',
                ideaDesc: 'Rzeźba antyczna z geometrycznymi pęknięciami i mikroszarym cieniowaniem.',
                date: datePartial1,
                time: '11:30',
                client: {
                    name: 'Michał Kowalczyk',
                    email: 'michal.kowalczyk@example.com',
                    phone: '601 234 567',
                    instagram: 'michal_k',
                    notes: 'Zależy mi na geometrycznym wykończeniu pęknięć czaszki.'
                },
                photo: { name: 'inspiracja-rzezba.jpg', dataUrl: 'portfolio-1.jpg', size: '180 KB' },
                status: 'pending'
            },
            {
                id: 'TI-782195',
                createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
                serviceKey: 'blackgrey',
                serviceName: 'Black & Grey (Smoki & Realizm)',
                placement: 'Grzbiet dłoni',
                approxSize: 'Średni (10 - 18 cm)',
                ideaDesc: 'Japoński smok wchodzący na palce, głęboka czerń i szarości.',
                date: datePartial1,
                time: '14:30',
                client: {
                    name: 'Kamil Skrobot',
                    email: 'kamil.skrobot@example.com',
                    phone: '603 555 777',
                    instagram: 'kskrobot',
                    notes: 'Kolejny tatuaż u Tomka, pełne zaufanie do ręki artysty.'
                },
                photo: { name: 'smok-dlon.jpg', dataUrl: 'portfolio-2.jpg', size: '210 KB' },
                status: 'confirmed'
            },
            ...fullBookings,
            {
                id: 'TI-941203',
                createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
                serviceKey: 'fineline',
                serviceName: 'Fine-Line & Linework',
                placement: 'Stopa i kostka',
                approxSize: 'Mały (do 8 cm)',
                ideaDesc: 'Subtelna gałązka z drobnymi listkami fine-line.',
                date: datePartial2,
                time: '13:00',
                client: {
                    name: 'Sabina Varley',
                    email: 'sabina.varley@example.com',
                    phone: '502 987 654',
                    instagram: 'sabinav',
                    notes: 'Subtelny wzór, zależy mi na cienkiej kresce.'
                },
                photo: { name: 'galazka.png', dataUrl: 'portfolio-4.png', size: '140 KB' },
                status: 'confirmed'
            }
        ];

        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(demoActive));
    }

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
    } catch (e) {
        history = [];
    }

    if (!Array.isArray(history) || history.length === 0) {
        const demoHistory = [
            {
                id: 'TI-310492',
                createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
                serviceKey: 'fineline',
                serviceName: 'Fine-Line & Linework',
                placement: 'Plecy wzdłuż kręgosłupa',
                approxSize: 'Duży (20+ cm)',
                ideaDesc: 'Orientalny smok ku księżycowi, delikatne cienie.',
                date: getRelativeDateStr(-4),
                time: '11:30',
                client: {
                    name: 'Ania Cygan',
                    email: 'ania.cygan@example.com',
                    phone: '693 111 222',
                    instagram: 'ania_cygan',
                    notes: 'Super wykonanie, dziękuję!'
                },
                photo: { name: 'smok-plecy.png', dataUrl: 'portfolio-3.png', size: '320 KB' },
                status: 'completed'
            }
        ];
        localStorage.setItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(demoHistory));
    }
}

/* ==================== KALENDARZ I SPRAWDZANIE ZAJĘTOŚCI ==================== */
function getAllBookings() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
    } catch (e) {
        return [];
    }
}

function getBookedSlotsForDate(dateStr) {
    const bookings = getAllBookings();
    return bookings
        .filter(b => b.date === dateStr && b.status !== 'cancelled')
        .map(b => b.time);
}

function getDayAvailability(dateStr) {
    const parts = dateStr.split('-');
    const targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    
    // Niedziela
    if (targetDate.getDay() === 0) {
        return { status: 'closed', bookedCount: 0, totalSlots: 0 };
    }

    // Sprawdzenie czy to data z przeszłości
    const today = new Date(currentRealYear, currentRealMonth, currentRealDay);
    if (targetDate < today) {
        return { status: 'past', bookedCount: 0, totalSlots: 0 };
    }

    const availableSlots = getTimeSlotsForDate(dateStr);
    const bookedTimes = getBookedSlotsForDate(dateStr);
    const bookedCount = bookedTimes.length;
    const totalSlots = availableSlots.length;

    if (totalSlots === 0) {
        return { status: 'closed', bookedCount: 0, totalSlots: 0 };
    }
    if (bookedCount >= totalSlots) {
        return { status: 'full', bookedCount, totalSlots };
    }
    if (bookedCount > 0) {
        return { status: 'partial', bookedCount, totalSlots };
    }
    return { status: 'free', bookedCount, totalSlots };
}

const polishMonths = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

function changeMonth(delta) {
    calendarMonth += delta;
    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    } else if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }
    renderCalendar();
}

function renderCalendar() {
    const monthYearElem = document.getElementById('calendar-month-year');
    const gridElem = document.getElementById('calendar-days-grid');
    if (!monthYearElem || !gridElem) return;

    monthYearElem.innerText = `${polishMonths[calendarMonth]} ${calendarYear}`;
    gridElem.innerHTML = '';

    // Liczba dni w bieżącym miesiącu
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    // Dzień tygodnia pierwszego dnia miesiąca (0 = Niedziela, 1 = Poniedziałek, ..., 6 = Sobota)
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
    // Przeliczenie na tydzień zaczynający się w Poniedziałek (0 = Pn, 6 = Nd)
    const startingPadding = (firstDayIndex + 6) % 7;

    // Puste komórki przed 1 dniem miesiąca
    for (let i = 0; i < startingPadding; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'p-2';
        gridElem.appendChild(emptyDiv);
    }

    const todayDateObj = new Date(currentRealYear, currentRealMonth, currentRealDay);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayDateObj = new Date(calendarYear, calendarMonth, day);
        const dayOfWeek = dayDateObj.getDay();

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'calendar-day-btn h-11 w-full text-xs font-semibold flex flex-col items-center justify-center';
        btn.innerText = day;

        const isToday = (calendarYear === currentRealYear && calendarMonth === currentRealMonth && day === currentRealDay);
        if (isToday) {
            btn.classList.add('today');
        }

        const isSunday = (dayOfWeek === 0);
        const isPast = dayDateObj < todayDateObj;

        if (isSunday || isPast) {
            btn.disabled = true;
            btn.classList.add('opacity-25', 'cursor-not-allowed', 'text-zinc-600');
            if (isSunday) {
                btn.title = 'Niedziela - Studio zamknięte';
            }
        } else {
            const avail = getDayAvailability(dateStr);

            if (avail.status === 'full') {
                btn.classList.add('cal-day-full');
                btn.disabled = true;
                btn.title = 'Wszystkie godziny w tym dniu są już zajęte';
                
                const dot = document.createElement('span');
                dot.className = 'cal-dot cal-dot-full';
                btn.appendChild(dot);
            } else if (avail.status === 'partial') {
                btn.classList.add('cal-day-partial');
                btn.title = `Ostatnie wolne miejsca (${avail.totalSlots - avail.bookedCount} z ${avail.totalSlots})`;
                
                const dot = document.createElement('span');
                dot.className = 'cal-dot cal-dot-partial';
                btn.appendChild(dot);
            } else {
                btn.classList.add('cal-day-free');
                btn.title = `Dostępne terminy (${avail.totalSlots} wolnych slotów)`;

                const dot = document.createElement('span');
                dot.className = 'cal-dot cal-dot-free';
                btn.appendChild(dot);
            }

            // Zaznaczenie aktualnie wybranego dnia
            if (bookingState.date === dateStr) {
                btn.classList.add('selected');
            }

            btn.onclick = () => selectCalendarDate(dateStr, btn);
        }

        gridElem.appendChild(btn);
    }
}

function selectCalendarDate(dateStr, btnElement) {
    bookingState.date = dateStr;
    bookingState.time = null; // reset godziny po zmianie daty

    document.querySelectorAll('.calendar-day-btn').forEach(b => b.classList.remove('selected'));
    if (btnElement) {
        btnElement.classList.add('selected');
    }

    renderTimeSlots(dateStr);
}

function renderTimeSlots(dateStr) {
    const displayHeader = document.getElementById('selected-date-display');
    const scheduleNote = document.getElementById('day-schedule-note');
    const container = document.getElementById('time-slots-container');
    const summaryContainer = document.getElementById('selected-slot-summary');
    if (!container) return;

    if (summaryContainer) summaryContainer.classList.add('hidden');

    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const dayName = dayNames[d.getDay()];

    if (displayHeader) {
        displayHeader.innerText = `${dayName}, ${parts[2]} ${polishMonths[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    }

    if (scheduleNote) {
        if (d.getDay() === 6) {
            scheduleNote.innerHTML = '<span class="text-amber-300 font-semibold">Sobota:</span> Studio pracuje w godzinach 10:00 – 14:00.';
        } else {
            scheduleNote.innerHTML = '<span class="text-amber-300 font-semibold">Dzień powszedni:</span> Studio pracuje w godzinach 10:00 – 18:00.';
        }
    }

    const slots = getTimeSlotsForDate(dateStr);
    const bookedTimes = getBookedSlotsForDate(dateStr);

    container.innerHTML = '';

    if (slots.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-center text-xs text-rose-400 py-4">Brak dostępnych godzin w tym dniu.</div>';
        return;
    }

    slots.forEach(slotTime => {
        const isBooked = bookedTimes.includes(slotTime);
        const btn = document.createElement('button');
        btn.type = 'button';

        if (isBooked) {
            btn.className = 'time-slot-btn p-3 text-xs flex items-center justify-between opacity-35 bg-zinc-900/60 border border-zinc-800 line-through cursor-not-allowed text-zinc-500';
            btn.disabled = true;
            btn.innerHTML = `
                <span class="font-mono">${slotTime}</span>
                <span class="text-[10px] text-rose-400 no-underline font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Zajęty</span>
            `;
        } else {
            btn.className = 'time-slot-btn p-3 text-xs flex items-center justify-between border border-zinc-800 bg-zinc-900/60 hover:border-amber-400 transition cursor-pointer text-zinc-200';
            btn.innerHTML = `
                <span class="font-mono font-bold text-white">${slotTime}</span>
                <span class="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Wolny</span>
            `;

            if (bookingState.time === slotTime) {
                btn.classList.add('selected');
            }

            btn.onclick = () => selectTimeSlot(slotTime, btn);
        }

        container.appendChild(btn);
    });
}

function selectTimeSlot(slotTime, btnElement) {
    bookingState.time = slotTime;

    document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
    if (btnElement) {
        btnElement.classList.add('selected');
    }

    const summaryContainer = document.getElementById('selected-slot-summary');
    const summaryText = document.getElementById('summary-slot-text');
    if (summaryContainer && summaryText && bookingState.date) {
        summaryText.innerText = `${bookingState.date} o godz. ${slotTime}`;
        summaryContainer.classList.remove('hidden');
    }
}

/* ==================== NAWIGACJA WIZARDA REZERWACJI ==================== */
function selectStyleCard(serviceKey) {
    if (!servicesData[serviceKey]) return;
    bookingState.serviceKey = serviceKey;
    bookingState.serviceName = servicesData[serviceKey].name;

    const cards = document.querySelectorAll('.service-select-card');
    cards.forEach(card => card.classList.remove('active'));

    const radio = document.getElementById(`style-${serviceKey}`);
    if (radio) {
        radio.checked = true;
        const parentCard = radio.closest('.service-select-card');
        if (parentCard) parentCard.classList.add('active');
    }
}

function preselectStyle(serviceKey) {
    selectStyleCard(serviceKey);
    const wizardElem = document.getElementById('rezerwacja');
    if (wizardElem) {
        wizardElem.scrollIntoView({ behavior: 'smooth' });
    }
}

function updateStepperUI(step) {
    for (let i = 1; i <= 4; i++) {
        const ind = document.getElementById(`step-indicator-${i}`);
        if (!ind) continue;

        const badge = ind.querySelector('.step-badge');
        const label = ind.querySelector('.step-label');

        if (i < step) {
            badge.className = 'step-badge w-9 h-9 rounded-full bg-emerald-500 text-black font-bold text-xs flex items-center justify-center border-2 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
            badge.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
            label.className = 'step-label text-[11px] font-semibold text-emerald-300 mt-2 truncate w-full';
        } else if (i === step) {
            badge.className = 'step-badge w-9 h-9 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center border-2 border-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.4)]';
            badge.innerText = i;
            label.className = 'step-label text-[11px] font-semibold text-amber-300 mt-2 truncate w-full';
        } else {
            badge.className = 'step-badge w-9 h-9 rounded-full bg-zinc-800 text-zinc-400 font-bold text-xs flex items-center justify-center border border-zinc-700';
            badge.innerText = i;
            label.className = 'step-label text-[11px] font-medium text-zinc-500 mt-2 truncate w-full';
        }
    }

    const progressBar = document.getElementById('wizard-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${(step / 4) * 100}%`;
    }
}

function goToStep(targetStep) {
    // Walidacja przejścia z Kroku 1
    if (targetStep > 1 && bookingState.step === 1) {
        const placement = document.getElementById('booking-placement').value.trim();
        const size = document.getElementById('booking-size').value;
        const desc = document.getElementById('booking-description').value.trim();

        if (!bookingState.serviceKey) {
            alert('Proszę wybrać styl tatuażu lub konsultację.');
            return;
        }
        if (!placement) {
            alert('Proszę podać orientacyjne miejsce na ciele (np. przedramię, ramię, plecy).');
            document.getElementById('booking-placement').focus();
            return;
        }
        if (!size) {
            alert('Proszę wybrać orientacyjny rozmiar tatuażu.');
            document.getElementById('booking-size').focus();
            return;
        }
        if (!desc) {
            alert('Proszę krótko opisać swój pomysł na tatuaż.');
            document.getElementById('booking-description').focus();
            return;
        }

        bookingState.placement = placement;
        bookingState.size = size;
        bookingState.description = desc;
    }

    // Walidacja przejścia z Kroku 2
    if (targetStep > 2 && bookingState.step === 2) {
        if (!bookingState.date) {
            alert('Proszę wybrać dostępny dzień w kalendarzu.');
            return;
        }
        if (!bookingState.time) {
            alert('Proszę wybrać wolną godzinę dla wybranego dnia.');
            return;
        }
    }

    // Walidacja przejścia z Kroku 3
    if (targetStep > 3 && bookingState.step === 3) {
        const name = document.getElementById('contact-name').value.trim();
        const phone = document.getElementById('contact-phone').value.trim().replace(/\s+/g, '');
        const email = document.getElementById('contact-email').value.trim();
        const instagram = document.getElementById('contact-instagram').value.trim();
        const notes = document.getElementById('contact-notes').value.trim();
        const consent = document.getElementById('consent-checkbox').checked;

        if (!name || name.length < 3) {
            alert('Proszę podać imię i nazwisko (min. 3 znaki).');
            document.getElementById('contact-name').focus();
            return;
        }
        if (!phone || phone.length < 9) {
            alert('Proszę podać prawidłowy 9-cyfrowy numer telefonu.');
            document.getElementById('contact-phone').focus();
            return;
        }
        if (!email || !email.includes('@') || !email.includes('.')) {
            alert('Proszę podać prawidłowy adres e-mail.');
            document.getElementById('contact-email').focus();
            return;
        }
        if (!consent) {
            alert('Proszę zaakceptować zgodę na przetwarzanie danych osobowych w celu rezerwacji.');
            document.getElementById('consent-checkbox').focus();
            return;
        }

        bookingState.client = {
            name,
            phone: `+48 ${phone}`,
            email,
            instagram,
            notes
        };

        // Przygotowanie podsumowania w Kroku 4
        populateSummaryStep();
    }

    // Zmiana widoku kroków
    for (let i = 1; i <= 4; i++) {
        const stepElem = document.getElementById(`wizard-step-${i}`);
        if (stepElem) {
            if (i === targetStep) {
                stepElem.classList.remove('hidden');
            } else {
                stepElem.classList.add('hidden');
            }
        }
    }

    bookingState.step = targetStep;
    updateStepperUI(targetStep);

    // Przewinięcie do formularza
    const wizardContainer = document.getElementById('rezerwacja');
    if (wizardContainer) {
        wizardContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function populateSummaryStep() {
    document.getElementById('summary-review-style').innerText = bookingState.serviceName;
    document.getElementById('summary-review-datetime').innerText = `${bookingState.date} o godz. ${bookingState.time}`;
    document.getElementById('summary-review-placement').innerText = bookingState.placement;
    document.getElementById('summary-review-size').innerText = bookingState.size;
    
    const photoReview = document.getElementById('summary-review-photo');
    if (bookingState.photo) {
        photoReview.innerHTML = `<span class="text-emerald-400 font-semibold"><i class="fa-solid fa-paperclip mr-1"></i>${bookingState.photo.name} (${bookingState.photo.size})</span>`;
    } else {
        photoReview.innerText = 'Brak załączonego pliku';
    }

    document.getElementById('summary-review-client').innerText = bookingState.client.name;
    document.getElementById('summary-review-phone').innerText = bookingState.client.phone;
    document.getElementById('summary-review-email').innerText = bookingState.client.email;
    document.getElementById('summary-review-description').innerText = bookingState.description;
}

/* ==================== ZAPIS REZERWACJI I MODAL SUKCESU ==================== */
function submitFinalBooking() {
    const submitBtn = document.getElementById('submit-booking-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Rejestrowanie...';
    }

    setTimeout(() => {
        const uniqueId = `TI-${Math.floor(100000 + Math.random() * 900000)}`;
        const newBooking = {
            id: uniqueId,
            createdAt: new Date().toISOString(),
            serviceKey: bookingState.serviceKey,
            serviceName: bookingState.serviceName,
            placement: bookingState.placement,
            approxSize: bookingState.size,
            ideaDesc: bookingState.description,
            date: bookingState.date,
            time: bookingState.time,
            client: bookingState.client,
            photo: bookingState.photo,
            status: 'pending'
        };

        let existing = [];
        try {
            existing = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
        } catch (e) {
            existing = [];
        }

        existing.unshift(newBooking);
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(existing));

        // Wyświetlenie modalu sukcesu
        const codeElem = document.getElementById('success-booking-code');
        if (codeElem) codeElem.innerText = `#${uniqueId}`;

        const successModal = document.getElementById('booking-success-modal');
        if (successModal) successModal.classList.remove('hidden');

        // Odświeżenie kalendarza
        renderCalendar();
        if (bookingState.date) {
            renderTimeSlots(bookingState.date);
        }

        // Reset przycisku submit
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-check text-xs mr-2"></i> Potwierdzam Rezerwację';
        }
    }, 700);
}

function closeSuccessModal() {
    const modal = document.getElementById('booking-success-modal');
    if (modal) modal.classList.add('hidden');
    // Powrót do kroku 1
    resetBookingWizard();
}

function openSuccessModalAdminView() {
    closeSuccessModal();
    navigateToAdmin();
}

function resetBookingWizard() {
    bookingState = {
        step: 1,
        serviceKey: 'surrealism',
        serviceName: 'Surrealizm & Mikrorealizm',
        placement: '',
        size: '',
        description: '',
        photo: null,
        date: null,
        time: null,
        client: { name: '', phone: '', email: '', instagram: '', notes: '' }
    };

    document.getElementById('booking-placement').value = '';
    document.getElementById('booking-size').value = '';
    document.getElementById('booking-description').value = '';
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-phone').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-instagram').value = '';
    document.getElementById('contact-notes').value = '';
    document.getElementById('consent-checkbox').checked = false;

    removeUploadedPhoto();
    selectStyleCard('surrealism');
    goToStep(1);
    renderCalendar();
}

/* ==================== OBSŁUGA ZDJĘĆ & KOMPRESJA CANVAS ==================== */
function handlePhotoUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Dozwolone są wyłącznie pliki graficzne (JPEG, PNG).');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Skalowanie w pamięci Canvas do max 900px
            const maxDimension = 900;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            const approxSizeKb = Math.round((compressedDataUrl.length * 0.75) / 1024);

            bookingState.photo = {
                name: file.name,
                dataUrl: compressedDataUrl,
                size: `${approxSizeKb} KB`
            };

            const previewContainer = document.getElementById('photo-preview-container');
            const previewThumb = document.getElementById('photo-preview-thumb');
            const fileNameElem = document.getElementById('photo-file-name');

            if (previewThumb) previewThumb.src = compressedDataUrl;
            if (fileNameElem) fileNameElem.innerText = `${file.name} (~${approxSizeKb} KB)`;
            if (previewContainer) previewContainer.classList.remove('hidden');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removeUploadedPhoto() {
    bookingState.photo = null;
    const input = document.getElementById('booking-photo-input');
    if (input) input.value = '';

    const previewContainer = document.getElementById('photo-preview-container');
    if (previewContainer) previewContainer.classList.add('hidden');
}

/* ==================== LIGHTBOX PORTFOLIO ==================== */
function openLightbox(index) {
    if (index < 0 || index >= portfolioItems.length) return;
    currentLightboxIndex = index;
    updateLightboxUI();

    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.remove('hidden');
}

function updateLightboxUI() {
    const item = portfolioItems[currentLightboxIndex];
    const imgElem = document.getElementById('lightbox-img');
    const titleElem = document.getElementById('lightbox-title');
    const descElem = document.getElementById('lightbox-desc');
    const counterElem = document.getElementById('lightbox-counter');

    if (imgElem) imgElem.src = item.src;
    if (titleElem) titleElem.innerText = item.title;
    if (descElem) descElem.innerText = `${item.category} • ${item.desc}`;
    if (counterElem) counterElem.innerText = `${currentLightboxIndex + 1} / ${portfolioItems.length}`;
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.add('hidden');
}

function prevLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + portfolioItems.length) % portfolioItems.length;
    updateLightboxUI();
}

function nextLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % portfolioItems.length;
    updateLightboxUI();
}

function handleLightboxBackdrop(event) {
    if (event.target.id === 'lightbox-modal') {
        closeLightbox();
    }
}

/* ==================== MODALE DEMO I POLITYKI ==================== */
function openDemoContactModal() {
    const modal = document.getElementById('demo-contact-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeDemoContactModal() {
    const modal = document.getElementById('demo-contact-modal');
    if (modal) modal.classList.add('hidden');
}

function openPrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (modal) modal.classList.remove('hidden');
}

function closePrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (modal) modal.classList.add('hidden');
}

/* ==================== PANEL ADMINISTRATORA (#admin) ==================== */
let isAdminLoggedIn = false;

function checkAdminRoute() {
    if (window.location.hash === '#admin') {
        showAdminView();
    } else {
        showClientView();
    }
}

function navigateToAdmin() {
    window.location.hash = '#admin';
    showAdminView();
}

function navigateToClient() {
    window.location.hash = '';
    showClientView();
}

function showAdminView() {
    document.getElementById('client-view-container').classList.add('hidden');
    document.getElementById('demo-bar').classList.add('hidden');
    document.getElementById('admin-view-container').classList.remove('hidden');

    if (isAdminLoggedIn) {
        document.getElementById('admin-login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-logout-btn').classList.remove('hidden');
        renderAdminDashboard();
    } else {
        document.getElementById('admin-login-screen').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('admin-logout-btn').classList.add('hidden');
    }

    window.scrollTo(0, 0);
}

function showClientView() {
    document.getElementById('client-view-container').classList.remove('hidden');
    document.getElementById('demo-bar').classList.remove('hidden');
    document.getElementById('admin-view-container').classList.add('hidden');
}

function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email-input').value.trim();
    const pass = document.getElementById('admin-pass-input').value.trim();
    const errElem = document.getElementById('admin-login-error');

    if (email === CONFIG.DEMO_ADMIN_EMAIL && pass === CONFIG.DEMO_ADMIN_PASS) {
        isAdminLoggedIn = true;
        if (errElem) errElem.classList.add('hidden');
        document.getElementById('admin-login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-logout-btn').classList.remove('hidden');
        renderAdminDashboard();
    } else {
        if (errElem) errElem.classList.remove('hidden');
    }
}

function adminLogout() {
    isAdminLoggedIn = false;
    showAdminView();
}

function renderAdminDashboard() {
    const active = getAllBookings();
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
    } catch (e) {
        history = [];
    }

    // Aktualizacja statystyk
    const totalCount = active.length + history.length;
    const pendingCount = active.filter(b => b.status === 'pending').length;
    const confirmedCount = active.filter(b => b.status === 'confirmed').length;
    const completedCount = history.filter(b => b.status === 'completed').length;

    document.getElementById('admin-stat-total').innerText = totalCount;
    document.getElementById('admin-stat-pending').innerText = pendingCount;
    document.getElementById('admin-stat-confirmed').innerText = confirmedCount;
    document.getElementById('admin-stat-completed').innerText = completedCount;

    // Tabela aktywnych rezerwacji
    const activeTbody = document.getElementById('admin-active-table-body');
    if (activeTbody) {
        if (active.length === 0) {
            activeTbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-zinc-500">Brak aktywnych rezerwacji.</td></tr>';
        } else {
            activeTbody.innerHTML = active.map(b => {
                let statusBadge = '';
                if (b.status === 'confirmed') {
                    statusBadge = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold">Zatwierdzona</span>';
                } else if (b.status === 'pending') {
                    statusBadge = '<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold animate-pulse">Oczekuje</span>';
                } else {
                    statusBadge = `<span class="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px]">${b.status}</span>`;
                }

                let photoHtml = '<span class="text-zinc-600 text-[10px]">Brak</span>';
                if (b.photo && b.photo.dataUrl) {
                    const safeName = (b.photo.name || 'inspiracja').replace(/'/g, "\\'");
                    photoHtml = `
                        <div class="cursor-pointer group flex items-center gap-1.5" onclick="openAdminPhotoModal('${b.photo.dataUrl}', '${safeName}')">
                            <img src="${b.photo.dataUrl}" alt="Inspiracja" class="w-8 h-8 rounded-lg object-cover border border-amber-500/40 group-hover:scale-110 transition">
                            <i class="fa-solid fa-expand text-[10px] text-zinc-500 group-hover:text-amber-400"></i>
                        </div>
                    `;
                }

                return `
                    <tr class="hover:bg-zinc-900/50 transition">
                        <td class="p-3">
                            <div class="font-mono text-xs font-bold text-amber-300">#${b.id}</div>
                            <div class="text-[10px] text-zinc-500">${new Date(b.createdAt).toLocaleDateString('pl-PL')}</div>
                        </td>
                        <td class="p-3">
                            <div class="font-bold text-white text-xs">${b.date}</div>
                            <div class="font-mono text-amber-400 text-[11px] font-semibold">${b.time}</div>
                        </td>
                        <td class="p-3">
                            <div class="font-semibold text-white text-xs">${b.client.name}</div>
                            <div class="text-[11px] text-zinc-400"><a href="tel:${b.client.phone.replace(/\s+/g,'')}" class="hover:text-amber-300">${b.client.phone}</a></div>
                            <div class="text-[10px] text-zinc-500">${b.client.email}</div>
                        </td>
                        <td class="p-3">
                            <div class="text-xs font-semibold text-amber-200">${b.serviceName}</div>
                            <div class="text-[10px] text-zinc-400">${b.placement} • ${b.approxSize}</div>
                            <div class="text-[10px] text-zinc-300 mt-1 leading-snug"><span class="text-zinc-500 font-normal">Pomysł:</span> ${b.ideaDesc}</div>
                            ${b.client && b.client.notes ? `
                                <div class="mt-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-200 leading-snug">
                                    <div class="font-bold text-amber-400 flex items-center gap-1 mb-0.5">
                                        <i class="fa-solid fa-comment-dots text-[10px]"></i>
                                        <span>Uwagi klienta:</span>
                                    </div>
                                    ${b.client.notes}
                                </div>
                            ` : '<div class="text-[10px] text-zinc-600 mt-1 italic">Brak dodatkowych uwag</div>'}
                        </td>
                        <td class="p-3">${photoHtml}</td>
                        <td class="p-3">${statusBadge}</td>
                        <td class="p-3 text-right space-x-1">
                            ${b.status !== 'confirmed' ? `
                                <button onclick="changeBookingStatus('${b.id}', 'confirmed')" class="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-[10px]" title="Zatwierdź rezerwację">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                            ` : ''}
                            <button onclick="changeBookingStatus('${b.id}', 'completed')" class="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-500/40 text-[10px]" title="Oznacz jako zrealizowaną">
                                <i class="fa-solid fa-flag-checkered"></i>
                            </button>
                            <button onclick="changeBookingStatus('${b.id}', 'cancelled')" class="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 text-[10px]" title="Anuluj wizytę">
                                <i class="fa-solid fa-ban"></i>
                            </button>
                            <button onclick="deleteBooking('${b.id}')" class="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-[10px]" title="Usuń z bazy">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Tabela historii
    const historyTbody = document.getElementById('admin-history-table-body');
    if (historyTbody) {
        if (history.length === 0) {
            historyTbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-zinc-600">Brak archiwalnych wizyt.</td></tr>';
        } else {
            historyTbody.innerHTML = history.map(b => {
                const badge = b.status === 'completed' 
                    ? '<span class="text-emerald-400 font-semibold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">Zrealizowano</span>'
                    : '<span class="text-rose-400 font-semibold text-[10px] bg-rose-500/10 px-2 py-0.5 rounded">Odwołana</span>';

                return `
                    <tr class="hover:bg-zinc-900/40 transition text-zinc-400">
                        <td class="p-3 font-mono text-xs text-zinc-400">#${b.id}</td>
                        <td class="p-3 text-xs">${b.date} • ${b.time}</td>
                        <td class="p-3 text-xs text-white">${b.client ? b.client.name : 'Klient'}</td>
                        <td class="p-3 text-xs">
                            <div class="font-medium text-zinc-300">${b.serviceName}</div>
                            ${b.client && b.client.notes ? `<div class="text-[10px] text-amber-300/80 italic mt-0.5"><i class="fa-solid fa-comment-dots text-[9px] mr-1"></i>${b.client.notes}</div>` : ''}
                        </td>
                        <td class="p-3">${badge}</td>
                        <td class="p-3 text-right">
                            <button onclick="deleteHistoryBooking('${b.id}')" class="text-zinc-600 hover:text-rose-400 text-xs p-1" title="Usuń z historii">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
}

function changeBookingStatus(bookingId, newStatus) {
    let active = getAllBookings();
    const index = active.findIndex(b => b.id === bookingId);
    if (index === -1) return;

    if (newStatus === 'completed' || newStatus === 'cancelled') {
        const item = active.splice(index, 1)[0];
        item.status = newStatus;

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
        } catch (e) {
            history = [];
        }
        history.unshift(item);
        localStorage.setItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } else {
        active[index].status = newStatus;
    }

    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(active));
    renderAdminDashboard();
    renderCalendar();
}

function deleteBooking(bookingId) {
    if (!confirm(`Czy na pewno chcesz bezpowrotnie usunąć rezerwację #${bookingId}?`)) return;

    let active = getAllBookings().filter(b => b.id !== bookingId);
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(active));
    renderAdminDashboard();
    renderCalendar();
}

function deleteHistoryBooking(bookingId) {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
    } catch (e) {
        history = [];
    }

    history = history.filter(b => b.id !== bookingId);
    localStorage.setItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    renderAdminDashboard();
}

function filterAdminBookings() {
    const query = (document.getElementById('admin-search-input').value || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#admin-active-table-body tr');
    rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        if (text.includes(query)) {
            r.style.display = '';
        } else {
            r.style.display = 'none';
        }
    });
}

function openAdminPhotoModal(photoUrl, caption) {
    const modal = document.getElementById('admin-photo-modal');
    const img = document.getElementById('admin-photo-modal-img');
    const cap = document.getElementById('admin-photo-modal-caption');

    if (img) img.src = photoUrl;
    if (cap) cap.innerText = caption || 'Podgląd inspiracji';
    if (modal) modal.classList.remove('hidden');
}

function closeAdminPhotoModal() {
    const modal = document.getElementById('admin-photo-modal');
    if (modal) modal.classList.add('hidden');
}

/* ==================== EFEKT SUBTELNEJ SZAREJ MGŁY (CANVAS) ==================== */
function initAmbientSmoke() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;

    const smokeParticles = [];
    const particleCount = 26;

    for (let i = 0; i < particleCount; i++) {
        smokeParticles.push({
            x: Math.random(),
            y: Math.random(),
            radius: 140 + Math.random() * 220,
            vx: (Math.random() - 0.5) * 0.00035,
            vy: (Math.random() - 0.5) * 0.00028,
            alpha: 0.025 + Math.random() * 0.04,
            pulseSpeed: 0.002 + Math.random() * 0.003,
            pulsePhase: Math.random() * Math.PI * 2
        });
    }

    let lastScrollY = window.scrollY;
    let scrollDelta = 0;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        scrollDelta = (currentScrollY - lastScrollY) * 0.00007;
        lastScrollY = currentScrollY;
    }, { passive: true });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function animate() {
        ctx.clearRect(0, 0, width, height);
        scrollDelta *= 0.94;

        smokeParticles.forEach(p => {
            p.x += p.vx + scrollDelta * 0.4;
            p.y += p.vy - scrollDelta;
            p.pulsePhase += p.pulseSpeed;

            if (p.x < -0.2) p.x = 1.2;
            if (p.x > 1.2) p.x = -0.2;
            if (p.y < -0.2) p.y = 1.2;
            if (p.y > 1.2) p.y = -0.2;

            const px = p.x * width;
            const py = p.y * height;
            const currentAlpha = p.alpha * (0.8 + 0.2 * Math.sin(p.pulsePhase));

            const grad = ctx.createRadialGradient(px, py, 0, px, py, p.radius);
            // Szary, mglisty odcień z delikatnym złotawym echem
            grad.addColorStop(0, `rgba(200, 205, 215, ${currentAlpha})`);
            grad.addColorStop(0.5, `rgba(160, 165, 175, ${currentAlpha * 0.5})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* ==================== AKORDEON FAQ ==================== */
function initFaqAccordion() {
    const allDetails = document.querySelectorAll('details.faq-item');
    allDetails.forEach((targetDetail) => {
        targetDetail.addEventListener('click', (e) => {
            if (e.target.closest('summary')) {
                allDetails.forEach((otherDetail) => {
                    if (otherDetail !== targetDetail && otherDetail.open) {
                        otherDetail.open = false;
                    }
                });
            }
        });
    });
}

/* ==================== MENU MOBILNE ==================== */
function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    const icon = document.getElementById('mobile-menu-icon');
    if (!drawer) return;

    drawer.classList.toggle('hidden');
    if (icon) {
        if (drawer.classList.contains('hidden')) {
            icon.className = 'fa-solid fa-bars text-lg';
        } else {
            icon.className = 'fa-solid fa-xmark text-lg';
        }
    }
}

/* ==================== INICJALIZACJA STARTOWA ==================== */
document.addEventListener('DOMContentLoaded', () => {
    ensureInitialDemoData();
    initAmbientSmoke();
    initFaqAccordion();
    selectStyleCard('surrealism');
    renderCalendar();
    checkAdminRoute();

    window.addEventListener('hashchange', checkAdminRoute);

    // Klawisze klawiatury dla modali i lightboxa
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closePrivacyModal();
            closeDemoContactModal();
            closeSuccessModal();
            closeAdminPhotoModal();
        }
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'ArrowLeft') prevLightboxImage();
    });
});
