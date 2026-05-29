# 🌞 Scaldacqua intelligente con Shelly + Fotovoltaico

Automazione completa per ottimizzare l'uso di uno scaldacqua ibrido Ariston Lydos Hybrid in base allo stato di carica delle batterie di un impianto fotovoltaico.

---

## 🎯 Obiettivo

Utilizzare la **resistenza elettrica** dello scaldacqua quando le batterie sono cariche (energia gratuita), e tornare alla **pompa di calore** quando non c'è produzione o le batterie sono scariche.

Come funzionalità bonus, il relè fisico integrato nello Shelly Plus 1PM permette di collegare un **ulteriore carico fisico** (es. scalda salviette) che si accende e spegne automaticamente insieme alla modalità resistenza.

---

## 🔧 Componenti

| Componente | Modello |
|---|---|
| Inverter fotovoltaico | Deye SUN-6K-SG04LP3-EU |
| Scaldacqua ibrido | Ariston Lydos Hybrid Wi-Fi |
| Dispositivo di automazione | Shelly Plus 1PM |
| Relè di interfaccia | Finder 40.52 230V AC |

---

## 📐 Schema di collegamento

```
Inverter Deye
Smart Load Port (230V)
        ↓
Bobina Relè Finder 230V AC
        ↓
Fase (L) ──► Contatto NO del Finder
             COM ──► Shelly input:0 (I)
        ↓
Shelly Plus 1PM
  input:0 ──► Script JavaScript
              ├── API Ariston NET → Ariston Lydos Hybrid
              └── Relè output ──► Carico fisico bonus (es. scalda salviette)
```

### Logica di funzionamento

| Stato batterie | Smart Load | Shelly input | Modalità Ariston | Relè output |
|---|---|---|---|---|
| Cariche | ON | ON | Boost 70°C (resistenza) | ON |
| Scariche | OFF | OFF | Green 53°C (pompa di calore) | OFF |

---

## 🔍 Come sono state scoperte le API

L'Ariston Lydos Hybrid non dispone di API ufficiali documentate. Per scoprire gli endpoint ho utilizzato **Fiddler Classic** come proxy HTTPS:

1. Installato Fiddler Classic sul PC
2. Configurato l'iPhone come proxy verso il PC (porta 8888)
3. Installato il certificato Fiddler sull'iPhone
4. Intercettato il traffico dell'app **Ariston NET**
5. Analizzato le chiamate durante il cambio modalità

### Endpoint scoperti

| Endpoint | Metodo | Descrizione |
|---|---|---|
| `/R2/Account/Login` | POST | Login — restituisce cookie `.AspNet.ApplicationCookie` |
| `/api/v2/velis/sePlantData/{GATEWAY_ID}` | GET | Lettura stato boiler |
| `/api/v2/velis/sePlantData/{GATEWAY_ID}/mode` | POST | Cambio modalità |
| `/api/v2/velis/sePlantData/{GATEWAY_ID}/temperature` | POST | Cambio temperatura |

### Mappa modalità

| Valore | Modalità |
|---|---|
| 1 | i-Memory |
| 2 | Green (pompa di calore) |
| 7 | Boost (resistenza elettrica) |

---

## 📜 Lo script

Vedi il file [`ariston-shelly.js`](ariston-shelly.js)

---

## 🚀 Installazione

Vedi il file [`INSTALL.md`](INSTALL.md)

---

## 📋 Requisiti

- Shelly Plus 1PM con firmware aggiornato
- Account Ariston NET attivo
- Inverter con porta Smart Load configurabile per SOC batteria
- Relè 230V AC (es. Finder 40.52)

---

## ⚠️ Note di sicurezza

- Lo script contiene credenziali in chiaro — non condividere il file con dati reali
- Sostituire sempre email, password e GATEWAY_ID con i propri dati
- Il collegamento elettrico deve essere eseguito da personale qualificato

---

## 📄 Licenza

MIT License — libero utilizzo, modifica e distribuzione con attribuzione.
