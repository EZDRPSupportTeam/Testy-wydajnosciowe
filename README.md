# Testy wydajnościowe dla systemu EZD RP

Repozytorium zawiera kod źródłowy testów wydajnościowych przeznaczonych dla systemu [EZD RP](https://ezdrp.gov.pl).
Testy zostały wytworzone z wykorzystaniem narzędzia [k6](https://k6.io).

# Przygotowanie narzędzia do testów

Należy zainstalować narzędzie [k6.io](https://k6.io) zgodnie z [instrukcją producenta](https://k6.io/docs/get-started/installation/).

# Przed uruchomieniem testów

Testy uruchamia się komendami opisanymi w sekcji Komendy.

Działanie testów w dostarczonej postaci polega na wykonaniu określonych operacji przez wielu użytkowników jednocześnie. Testy zakładają że istnieje struktura użytkowników w ramach podmiotów. Lista użytkowników i ich role w systemie (które decydują jakie operacje podczas testów będzie wykonywać użytkownik) są prekonfigurowane w dostarczonym repozytorium. Aby wykonać test na własnym środowisku EZD RP należy założyć przynajmniej jeden podmiot (można założyć więcej) według dostarczonego schematu/wzorca oraz uruchomić testy dla tego podmiotu. Repozytorium dostarczone jest z szablonem podmiotu (wzorcem) według którego zakładane są nowe podmioty (testowe) w systemie EZD RP. Wzorzec ten zakłada strukturę organizacyjną podmiotu składająca się z 50 użytkowników o różnych rolach (m.in. Administrator, Dyrektor, Sekretarka, Kierownik, Pracownik, Kancelaria). Dodatkowo, podmiot ma prekonfigurowane szablony, JRWA, kontakty i inne elementy umożliwiające uruchomienie dostarczonych testów.

W przypadku potrzeby uruchomienia operacji zakładania nowego podmiotu (lub kilku podmiotów), przed uruchomieniem komendy należy skonfigurować login i hasło głównego administratora aplikacji KUIP systemu EZD RP. Konfiguracja tych parametrów jest zapisana w pliku: `params/input/users-kuip.json`. W miejscach oznaczonych jako `tu_wpisz_login_admina` oraz `tu_wpisz_haslo_admina` należy wpisać odpowiednio login oraz hasło głównego administratora.

# Komendy

### Zakładanie podmiotu wzorcowego
Repozytorium zawiera kod skryptu (opartym na narzędziu k6) pozwalający założyć nowy podmiot (dowolną liczbę podmiotów) który można wykorzystać do przeprowadzenia testów wydajnościowych. Podmiot zakładany jest wedłu wzorca (szablonu) opisanego w pliku w formacie JSON: `params/input/kuip.json`.

##### Założenie jednego podmiotu
Komenda Powershell
```powershell
$env:PRAND="5";$env:URL_EZDRP="https://ezdrp-web.adres.systemu.ezdrp";$env:KUIP_URL_EZDRP="https://kuip-web.adres.systemu.ezdrp";k6 run --no-usage-report .\zakladanie.podmiotu.js
```

Komenda bash:
```bash
PRAND="5" URL_EZDRP="https://ezdrp-web.adres.systemu.ezdrp" KUIP_URL_EZDRP="https://kuip-web.adres.systemu.ezdrp" k6 run --no-usage-report ./zakladanie.podmiotu.js
```

Wykonanie powyższej komendy (oraz poprawne zakończenie działania skryptu) spowoduje założenie podmiotu którego loginy (zakładając że nie został zmodyfikowany wzorzec) użytkowników będą miały postać: `u1abe5@ezdrp.gov.pl`,`u2abe5@ezdrp.gov.pl`, ...
Wzorcowy podmiot zawiera 50 użytkownik, tak więc loginy będą rozpoczynać sie od fragmentu: `u1` (`u1abe5@ezdrp.gov.pl`) i kończyć na `u50` (`u50abe5@ezdrp.gov.pl`).
Login zawiera także fragment oznaczenia podmiotu (tzw. numer podmiotu) tj. `abe5`, który wynika z zastosowanego w komendzie parametru `PRAND="5"`. Przykładowo zmiana parametry na `PRAND="123"` spowoduje utworzenie podmiotu (o numerze 123) którego loginy użytkowników będą miały postać: `u1abe123@ezdrp.gov.pl` (w przypadku pierwszego użytkownika).
Domyślne hasło w dostarczonym wzorcu: `Test123$`

##### Założenie wielu podmiotów
Komenda Powershell

```powershell
$env:PRAND_FROM="5";$env:PRAND_TO="10";$env:URL_EZDRP="https://ezdrp-web.adres.systemu.ezdrp";$env:KUIP_URL_EZDRP="https://kuip-web.adres.systemu.ezdrp";k6 run --no-usage-report .\zakladanie.podmiotu.js
```

Komenda bash:
```bash
PRAND_FROM="5" PRAND_TO="10" URL_EZDRP="https://ezdrp-web.adres.systemu.ezdrp" KUIP_URL_EZDRP="https://kuip-web.adres.systemu.ezdrp" k6 run --no-usage-report ./zakladanie.podmiotu.js
```
Wykonanie powyższej komendy, (co do zasady) tak samo jak poprzednio, założy podmioty których loginy użytkowników będą zawierać fragment `abe5`, `abe6`, ... do `abe10`. Przykładowo zostaną założone loginy (wybrane loginy):  `u1abe5@ezdrp.gov.pl`, `u20abe7@ezdrp.gov.pl`, `u21abe9@ezdrp.gov.pl`.
Dla powyższej komendy zostanie założonych w sumie: 6 podmiotów (5, 6, 7, 8, 9, 10) po 50 użytkowników w każdym, tj. w sumie 300 użytkowników.

> [!NOTE]
> Zalecane jest czyszczenie parametrów które mogły być użyte dotychczas. Przykładowo komenda zakładania wielu podmiotów która korzysta z parametrów `PRAND_FROM` oraz `PRAND_TO` powinna ustawiać parametr `PRAND=""` (czyścić jej wartość) o ile została wcześniej użyta z racji iż system operacyjny może "pamiętać" jej wartość z poprzedniego wykonania komendy.
----

### Test wydajnościowy

Komenda Powershell
```powershell
$env:USERS_COUNT="50";$env:DURATION_TIME="25";$env:URL_EZDRP="https://ezdrp-web.adres.systemu.ezdrp";k6 run --no-usage-report .\test.wydajnosciowy.1.js
```

Komenda bash:
```bash
USERS_COUNT="50" DURATION_TIME="25" URL_EZDRP="https://ezdrp-web.adres.systemu.ezdrp" KUIP_URL_EZDRP="" PRAND_FROM="" PRAND_TO="" PRAND="" k6 run --no-usage-report ./test.wydajnosciowy.1.js
```

Wykonanie powyższej komendy spowoduje uruchomienie testu wydajnościowego z wykorzystaniem 50 użytkowników (parametr `USERS_COUNT="50"`) przez 25 minut (parametr `DURATION_TIME="25"`). Test wykonuje różne operacje w zależności od roli użytkownika. Test dostosowany jest do wzorcowej struktury podmiotu.
Działanie testu polega na wczytaniu parametrów a następnie wykonywaniu przez wskazany czas "zakodowanych" operacji. Parametry wczytywane są z pliku `params/input/users.json`. Jest to plik opisujący wzorcową strukturę podmiotu i domyślnie dostarczany jest z listą podmiotów o numerach z zakresu 6000 - 6199 (w sumie 200 podmiotów po 50 użytkowników w każdym). Aby móc skorzystać z domyślnego pliku należy założyć na testowanym środowisku co najmniej jeden podmiot o numerze 6000 oraz wykonać test dla 50 użytkowników.

Chcąc skorzystać z innej liczby użytkowników należy:
- założyć określoną liczbę podmiotów dostosowaną do docelowej liczby użytkowników biorących udział w teście. Przykładowo chcąc wykonać test dla 500 użytkowników należy założyć 10 podmiotów (10 podmiotów x 50 użytkowników = 500 użytkowników). Rekomendowane jest założenie podmiotów z numerami od 6000 do 6049 (czyli z parametrami `PRAND_FROM="6000"` i `PRAND_TO="6049"`) gdyż nie będzie potrzeby dostosowania pliku konfiguracyjnego `params/input/users.json`.
- sprawdzić ręcznie (dla pewności) wybrane loginy w systemie EZD RP. Należy wykonać logowanie na wybrane, losowe loginy które powinny zostać założone po operacji generowania podmiotów. Przykładowo zakładając podmioty o numerach od 6000 do 6049, można zweryfikować logowania na loginy: u1abe6000@ezdrp.gov.pl, u16abe6020@ezdrp.gov.pl, u21abe6040@ezdrp.gov.pl.
- wykonać test wydajnościowy podając parametry: `USERS_COUNT="500"` `DURATION_TIME="25"`

Test dla powyższych kroków zostanie wykonany na 500 użytkownikach rozpoczynając od podmiotu 6000 (50 użytkowników), następnie podmiotu o nr 6001 (kolejne 50 użytkowników) i tak do podmiotu 6049 (ostatnie 50 użytkowników).

Zasady wykonania testu:
- przy teście trwającym dłużej niż 2 min (parametr `DURATION_TIME`) test zostanie wydłużony na początku o 5 minut przez które zostanie rozłożony ruch użytkowników (etap rozgrzewania systemu/testu). Kolejni użytkownicy będą rozpoczynać operację logowania w równych odstępach czasu. Wszyscy użytkownicy zostaną równo "rozłożeni" na okres pierwszych 5 minut. Każdy użytkownik po poprawnym zalogowaniu zaczyna wykonywać swoje operacje testowe.
- po okresie rozgrzewania testu (logowania kolejnych użytkowników) użytkownicy będą cały czas wykonywać "zakodowane" operacje przez czas wskazany w parametrze `DURATION_TIME`. Przykładowo podanie parametru `DURATION_TIME="25"` spowoduje że test będzie trwać w sumie 30 minut z tym że przez pierwsze 5 minut będą logować się kolejni użytkownicy. Dopiero przez kolejne 25 minut wszyscy użytkownicy (których liczba została wskazana w parametrze `USERS_COUNT`) będą wykonywać operacje.
- po wykonaniu testu generuje się raport z podsumowaniem (więcej w sekcji Wyniki).

# Parametry

Dodatkowe parametry (zmienne środowiskowe), które mogą kontrolować zachowanie testu:

- `WARM` - parametry zmienający domyślny czas (5 min) rozgrzewania testu. Należy podać liczbę minut np. WARM="10" oznacza że docelowa liczba użytkowników zaloguje się dopiero na koniec 10 minuty (zostaną "równo rozłożeni").

- `SLEEP_FACTORY` - parametr określający liczbę sekund pomiędzy kolejnymi operacjami użytkownika. Pozwala "symulować" rozkład operacji w systemie odzwierciedlając realną pracę użytkownika który zanim wykona operację np. wypełnia formularz, przesuwa myszką, weryfikuje dane na stronie, itp. Domyślnie parametr przyjmuje wartość 5. Sterując tym parametrem, można uzyskać większe lub mniejsze liczby operacji w stałym okresie czasu. Przykładowo test trwający 30 minut dla 50 użytkowników spowoduje założenie 10 spraw (to jest tylko przykładowa wartość na cele wyjaśnienia zasady działania parametru i nie musi być faktyczną liczbą założonych spraw dla tych parametrów). Zmieniając SLEEP_FACTORY na mniejszą wartość niż 5 spowodujemy że użytkownicy będą "szybciej" (częściej) wykonywać operacje (dlatego że okres np. 2 sekund przerwy pomiędzy operacjami zostanie przemnożony przez mniejszą wartość czyli zamiast domyślnej przerwy 2x5s=10s uzyskamy 2x3s=6s czyli 4 sekundy mniejszą przerwę między operacjami) więc przez okres 30 minut założą więcej spraw. Parametr ten można wykorzystać do dostosowania liczby wykonywanch operacji do profilu konkretnego podmiotu. Pomocne jest tutaj skorzystanie z metryk widocznych w raporcie gdyż przedstawione są w nim ilości operacji takich jak "założenie sprawy", "rejestracja przesyłki wpływającej", "odczytanie dokumentu". Jeżeli po wykonaniu testu, metryki okażą się "za małe" tj. chcemy żeby test wykonał w tym samym czasie więcej operacji, należy zmniejszyć parametr SLEEP_FACTORY (można początkowo zmniejszyć o 1 lub jeżeli okaże się za dużo to o 0.5). Parametr przyjmuje też wartości z kropką tj. np. 4.5, 5.5.

- `PODMIOT_START` - parametr określający numer podmiotu od którego będą wykorzystywani użytkownicy do wykonania testów wydajnościowych. Przykładowo w dostarczonym repozytorium, plik `params/input/users.json` zawiera prekonfigurowaną listą podmiotów o numerach z zakresu 6000 - 6199. Chcąc jednak wykorzystać podczas testu 100 użytkowników z podmiotów 6050 oraz 6051 (dwa podmioty po 50 użytkowników w każdym) można podać parametr `PODMIOT_START="6050"` co spowoduje że rozpoczną się testy od użytkowników z podmiotu o numerze 6050 (pierwsze 50 użytkowników) a później od użytkowników z podmiotu o numerze 6051.


# Wyniki

Wyniki testu są zapisywane w pliku summary_YYYY-MM-DD_HHmm.html gdzie po słowie "summary" jest znacznik czasu zakończenia testu. Przykładowo plik raportu może posiadać nazwę: summary_15-09-2021_1506.html

Wyniki są generowane w formacie HTML, na bazie dodatku [k6-reporter](https://github.com/benc-uk/k6-reporter).

# Konfiguracja testów pod wiele domen

Istnieje możliwość konfiguracji plików `params/input/users.json` oraz `params/input/users-kuip.json` pod wiele domen tj. posiadając jedno repozytorium testów można uruchamiać testy na różnych domenach systemu EZD RP bez potrzeby zmiany parametrów w podanych plikach konfiguracyjnych. Testy, co do zasady działania, w pierwszej kolejności odczytują powyższe pliki konfiguracyjne z plików skonfigurowanych pod domenę (jak opisano poniżej), a jak takie pliki nie istnieją, odczytują domyślne pliki (o nazwach podanych powyżej).

Chcąc skonfigurować indywidualne parametry pod konkretną domenę, przykładowo: 
- https://ezdrp-web.moja.domena.pl - w przypadku adresu dla aplikacji EZD RP
- https://kuip-web.moja.domena.pl - w przypadku adresu dla aplikacji KUIP

 należy zrobić kopię plików domyślnych (czyli `users.json` oraz `users-kuip.json`) oraz zmienić nazwę plików na:
 - users-ezdrp-web.moja.domena.pl.json - w przypadku kopii pliku users.json
 - users-kuip-web.moja.domena.pl.json - w przypadku kopii pliku users-kuip.json