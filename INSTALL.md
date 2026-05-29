# 🚀 Guida all’installazione

## Prerequisiti

- Shelly Plus 1PM collegato alla rete Wi-Fi
- Account Ariston NET attivo e boiler online
- Inverter con porta Smart Load configurata per soglia SOC batteria
- Relè Finder 40.52 230V AC (o equivalente)

-----

## 1. Trovare il GATEWAY_ID

1. Aprire il browser e andare su `https://www.ariston-net.remotethermo.com`
1. Effettuare il login con le credenziali dell’app Ariston NET
1. Cliccare sul proprio dispositivo
1. Guardare l’URL — sarà nella forma:
   
   ```
   https://www.ariston-net.remotethermo.com/R2/Plant/Index/XXXXXXXXXXXX
   ```
1. Il valore finale è il **GATEWAY_ID** — annotarlo

-----

## 2. Schema elettrico

```
Inverter Deye - Smart Load Port
    Fase (L) ──────────────────► Bobina Finder A1
    Neutro (N) ────────────────► Bobina Finder A2

Relè Finder - Contatto NO (Normally Open)
    Fase (L) ──────────────────► Contatto NO (pin 14)
    COM (pin 11) ──────────────► Shelly input:0 (I)

Shelly Plus 1PM - Output relè fisico (opzionale)
    Output ─────────────────────► Carico fisico bonus (es. scalda salviette)
    Alimentazione separata dalla rete 230V
```

> ⚠️ Il collegamento elettrico deve essere eseguito da personale qualificato

-----

## 3. Configurare lo Shelly in modalità Detached

1. Aprire l’interfaccia web dello Shelly su `http://[IP_SHELLY]`
1. Andare su **Settings → Input**
1. Impostare la modalità input su **Detached**

Questo permette allo script di gestire il relè fisico in modo indipendente dall’input.

-----

## 4. Configurare lo script

1. Aprire il file `ariston-shelly.js`
1. Modificare le variabili di configurazione:
   
   ```javascript
   var EMAIL    = "tua_email@example.com";
   var PASSWORD = "tua_password";
   var HEATER   = "XXXXXXXXXXXX"; // Il GATEWAY_ID trovato al punto 1
   ```

-----

## 5. Caricare lo script sullo Shelly

1. Aprire il browser e andare su `http://[IP_SHELLY]`
1. Andare su **Scripts**
1. Cliccare **Create Script**
1. Dare un nome (es. “Ariston”)
1. Incollare il contenuto del file `ariston-shelly.js` modificato
1. Cliccare **Save**
1. Cliccare **Start**

-----

## 6. Configurare l’inverter

Nell’interfaccia dell’inverter Deye:

1. Andare nelle impostazioni della Smart Load
1. Impostare la soglia SOC di accensione (es. 80%)
1. Impostare la soglia SOC di spegnimento (es. 30%)
1. Abilitare la funzione Smart Load

-----

## 7. Verificare il funzionamento

Aprire il log dello script Shelly — dovresti vedere:

```
Pronto | mod=pompa
```

Quando la Smart Load si attiva (batterie cariche):

```
→ Resistenza 70C + carico fisico ON
OK temp=70
```

Quando la Smart Load si disattiva (batterie scariche):

```
→ Pompa 53C + carico fisico OFF
OK temp=53
```

-----

## Carico fisico bonus (opzionale)

Il relè integrato nello Shelly Plus 1PM può comandare un qualsiasi carico elettrico (es. scalda salviette, ventilatore, pompa) che si attiverà automaticamente insieme alla modalità resistenza dello scaldacqua, sfruttando l’energia disponibile dalle batterie.

-----

## Risoluzione problemi

|Problema                         |Soluzione                                                          |
|---------------------------------|-------------------------------------------------------------------|
|“Login fallito”                  |Verificare email e password                                        |
|Nessun evento al cambio stato    |Verificare il collegamento fase/COM dal relè NO all’ingresso Shelly|
|L’app Ariston non cambia modalità|Verificare che il GATEWAY_ID sia corretto                          |
|Il relè fisico non si attiva     |Verificare che lo Shelly sia in modalità Detached                  |
