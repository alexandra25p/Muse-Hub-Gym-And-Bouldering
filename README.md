Autori: Lydia Groza și Alexandra Paraschiv

# Documentație Tehnică de Proiect: MuseHub

## Portal Digital pentru Managementul Activităților de Fitness și Bouldering

---

### 1. Introducere

**MuseHub** este o aplicație web modernă de tip Single Page Application (SPA), creată cu scopul de a asigura digitalizarea și eficientizarea managementului activităților sportive desfășurate în cadrul unei săli de fitness și bouldering (cățărat indoor). Platforma oferă o soluție completă cu două perspective distincte: cea a membrilor sălii, axată pe urmărirea progresului fizic, planificare și interacțiunea cu comunitatea, și cea a personalului administrativ, axată pe organizare, gestiunea resurselor și monitorizarea conturilor.

Scopul central al aplicației este stimularea clienților prin tehnici de _gamification_ (clasamente live, deblocarea de realizări/insigne și statistici vizuale ale performanței în antrenamente), oferind totodată o interfață intuitivă și dinamică ce integrează rezervarea de clase și gestionarea profilului propriu.

---

### 2. Tehnologii și Librării Utilizate

Aplicația se bazează pe un ecosistem tehnologic robust și modern:

- **Framework principal**: **Angular v21 (v21.2.0)** – utilizat cu structură bazată exclusiv pe _Standalone Components_, noul sistem de control al fluxului (`@if`, `@for`) și gestiunea reactivă a stării prin _Signals_.
- **Bază de date și Autentificare (Backend)**: **Firebase Suite**
  - _Firebase Authentication_ – gestionează crearea de conturi securizate, conectarea, validările de cont și managementul sesiunilor de utilizator.
  - _Cloud Firestore_ – bază de date NoSQL în timp real utilizată pentru stocarea profilurilor de utilizatori, orarului claselor, înregistrărilor de antrenament și a istoricului de rezervări.
- **Librărie UI**: **Ng-Zorro-Antd (v21.2.2)** – implementează componente premium (tabele sortabile, ferestre de dialog reactive `NzModal`, popup-uri de confirmare `NzPopconfirm`, comutatoare interactive și elemente de navigare).
- **Vizualizări grafice**: **Chart.js (v4.5.1)** – integrată pentru a reprezenta evoluția caloriilor arse și distribuția antrenamentelor din dashboard.
- **Stilizare**: **SCSS / CSS** – pentru crearea unui design modern, fluid, cu teme dinamice (Dark/Light Mode) și elemente vizuale de tip Glassmorphism.

---

### 3. Structura Proiectului

Codul sursă al proiectului respectă principiile de curățenie și organizare a codului (_Separation of Concerns_), având următoarea structură de directoare:

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Garduri de securitate (auth.guard.ts: authGuard, adminGuard, memberGuard)
│   │   ├── helpers/         # Validatori custom pentru Reactive Forms (validators.ts)
│   │   ├── services/        # Logică globală partajată (UserService, ClassesService, JournalService, DarkModeService)
│   │   └── shared/          # Componente reutilizabile la nivel global (AppNavbar, LoginModal)
│   ├── features/
│   │   ├── home/            # Pagina publică de prezentare a hub-ului sportiv
│   │   ├── signup/          # Pagina complexă de înregistrare conturi
│   │   ├── dashboard/       # Pagina cu grafice Chart.js și panou de monitorizare
│   │   ├── classes/         # Managementul claselor sportive (Tabel interactiv CRUD)
│   │   ├── journal/         # Jurnalul de antrenament și deblocare Achievements
│   │   ├── wall/            # Vizualizarea panourilor de bouldering și traseelor active
│   │   ├── leaderboard/     # Clasamentul interactiv al membrilor comunității
│   │   └── admin/           # Panoul de activare/dezactivare conturi de utilizator
│   ├── app.config.ts        # Configurațiile globale ale platformei (inclusiv rutare, animații)
│   ├── app.routes.ts        # Rutare definită exclusiv prin asincronism (Lazy Loaded)
│   └── app.ts               # Componenta principală rădăcină (root component)
├── assets/                  # Imagini și fișiere media statice
└── firebase.ts              # Inițializarea conexiunii securizate cu serviciile Cloud Firebase
```

---

### 4. Arhitectura Aplicației

Platforma MuseHub utilizează o arhitectură curată bazată pe următoarele direcții:

- **Fully Lazy Loading**: Pentru a asigura performanțe superioare la încărcarea inițială în browser, toate rutele principale din `app.routes.ts` sunt definite folosind încărcarea asincronă (`loadComponent: () => import(...)`). Fișierele mari sunt livrate browserului doar când utilizatorul navighează efectiv pe pagina respectivă.
- **Componente Standalone**: Proiectul nu recurge la module clasice (`NgModule`). Fiecare componentă își declară direct dependențele necesare, facilitând modularizarea, reutilizarea și testabilitatea.
- **State Management prin Angular Signals**: Interfața se actualizează fluid, fără randări inutile, utilizând Signals. Sistemul guvernează stările de autentificare (`user`), tema curentă (`dark`), termenii de căutare din tabele (`searchQuery`) și modificările dinamice ale listei de clase.
- **Securitatea rutelor (Role-Based Access Control)**: Aplicația impune garduri de securitate (`Guards`) ce împiedică utilizatorii neînregistrați să acceseze secțiunile interne. De asemenea, separă membrii de administratori, restricționând accesul acestora din urmă la dashboard-uri specifice și invers.

---

### 5. Funcționalitățile Principale ale Paginilor

#### 5.1 Pagina de Prezentare (Home)

Este pagina de destinație publică a aplicației. Aceasta prezintă facilitățile sălii (fitness, climbing) printr-o grafică atractivă și include butoane de acces rapid spre formularele de creare cont sau autentificare.

#### 5.2 Autentificare (Login & Register)

- **Register (Înregistrare)**: Formular reactiv ce colectează datele de profil (nume, prenume, data nașterii, orașul, biografia și poza de profil). Formularul integrează validatori customizați: `passwordValidator()` (verifică lungimea minimă de 6 caractere, utilizarea literelor mari/mici, cifrelor și a caracterelor speciale) și `passwordsMatchValidator()` (verifică în timp real egalitatea parolelor).
- **Login (Conectare)**: Modal dinamic disponibil la nivel global. Dispune de opțiunea „Remember me” care alege modul de persistență: în `localStorage` (pentru salvare pe termen lung) sau în `sessionStorage` (sesiunea se distruge automat la închiderea ferestrei browserului).

#### 5.3 Dashboard-ul Personalizat

- **Perspectiva Membru**: Afișează progresul fizic curent al clientului, activitățile sale recente și grafice interactive generate cu Chart.js (evoluția caloriilor arse, antrenamentele pe categorii).
- **Perspectiva Admin**: Prezintă un sumar global al indicatorilor de activitate ai sălii: numărul total de utilizatori înregistrați, numărul claselor programate și rezervările active ale zilei.

#### 5.4 Gestiunea Claselor (Classes)

Orarul claselor (Yoga, HIIT, Pilates etc.) este structurat ca un tabel interactiv complex cu funcționalități de căutare, filtrare live, sortare directă din capul de tabel după oricare din cele 7 coloane de date și confirmări de siguranță (`nz-popconfirm`) la ștergere.

- **Pentru Membri**: Aceștia pot rezerva și anula rezervările lor la clase printr-un singur click, numărul de locuri disponibile (spots) actualizându-se dinamic.
- **Pentru Admin**: Oferă control CRUD complet. Permite adăugarea de clase noi sau modificarea celor existente direct prin intermediul unui modal securizat ce validează orarul și capacitățile selectate.

#### 5.5 Jurnalul de Antrenament (Journal) & Realizări (Achievements)

Membrii pot introduce activitățile lor sportive zilnice (tipul antrenamentului, durata, caloriile arse și o descriere). Datele sunt stocate în mod izolat per utilizator (utilizând prefixe securizate bazate pe adresa de e-mail), permițând utilizatorilor care folosesc același browser să își mențină jurnalele private. De asemenea, pe măsură ce antrenamentele se acumulează, utilizatorii deblochează dinamic medalii și realizări virtuale.

#### 5.6 Vizualizarea Panourilor (Wall) & Clasamentul (Leaderboard)

- **Wall**: Prezintă traseele de bouldering de pe panourile sălii, sortate după grade de dificultate.
- **Leaderboard**: O listă ierarhică ce afișează utilizatorii ordonați în funcție de nivelul lor de activitate fizică recentă, oferind comunității un spirit competitiv benefic.

#### 5.7 Panoul Administrativ (Admin)

Interfață dedicată exclusiv managerilor sălii pentru vizualizarea tabelară a profilurilor clienților din baza de date Firestore. Aceștia pot suspenda sau reactiva conturi în mod dinamic, acțiune care aplică restricții instantanee profilului vizat.

---

### 6. Ghid de Rulare Locală

Pentru a rula aplicația MuseHub local, asigurați-vă că aveți instalat Node.js, apoi urmați acești pași:

1. **Instalarea dependențelor**:
   În terminalul deschis în directorul rădăcină al proiectului, executați:
   `npm install`
2. **Pornirea serverului de dezvoltare**:
   Lansați aplicația local prin comanda:
   `npm start`
3. **Accesarea aplicației**:
   Deschideți browserul la adresa web:
   `http://localhost:4200`
4. **Construirea pachetului de producție** (opțional):
   `npm run build`

_Notă: Deoarece datele sunt conectate în cloud direct prin SDK-ul Firebase, nu este necesară configurarea sau rularea locală a unei alte baze de date (cum ar fi JSON Server)._

---

### 7. Concluzie

Proiectul **MuseHub** demonstrează succesul integrării conceptelor moderne din ecosistemul Angular 21, oferind o arhitectură curată, scalabilă și modulară. Combinația dintre Standalone Components, Signals și control flow-ul nativ oferă aplicației un nivel ridicat de performanță și o întreținere facilă pe termen lung.

Prin intermediul conexiunii directe cu Firebase (Auth și Cloud Firestore) și al designului responsive modern cu elemente premium de tip Glassmorphism, aplicația propune o experiență de utilizare fluidă și securizată, fiind un bun exemplu de portal digital modern dedicat comunităților active de fitness și bouldering.
