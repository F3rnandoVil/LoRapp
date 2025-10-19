import React, { useState, useCallback, useEffect, useRef } from 'react';

// --- CONFIGURATION ---
// **CORREGIDO:** Los UUIDs de envío y recepción estaban invertidos en el código anterior.
// El UUID '...abe' (write: true) ahora es el canal de envío.
// El UUID '...abd' (notify: true) ahora es el canal de recepción.
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc'; // Your device's Primary Service UUID
const WRITE_CHAR_UUID = '12345678-1234-1234-1234-123456789abe'; // (write: true) Característica para enviar datos
const NOTIFY_CHAR_UUID = '12345678-1234-1234-1234-123456789abd'; // (notify: true) Característica para recibir datos

// Helper Component for UI (replacing local image imports)
const BackIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const SendIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

// --- SCREEN COMPONENTS ---

const LandingScreen = ({ onFindAntennas }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-900 text-white">
      <div className="w-24 h-24 mb-6 rounded-full bg-cyan-600 flex items-center justify-center p-4">
        {/* Antenna Icon (Replaced loraAntena image) */}
        <svg className="w-16 h-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold mb-2">Prototipo LoRa</h1>
      <p className="text-lg text-gray-400 mb-8 max-w-sm">Sistema de comunicación en emergencias, conéctate a una antena cercana mediante Bluetooth</p>
      <button
        onClick={onFindAntennas}
        className="w-full max-w-sm bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 ease-in-out"
      >
        Buscar antenas cercanas
      </button>
    </div>
  );
};


const BluetoothScanScreen = ({ onBack, connectAndNavigate, status, error }) => {
  const handleScan = async () => {
    // The check for navigator.bluetooth support and error handling are now
    // centralized in the main App component's scanAndConnect function.
    connectAndNavigate(); 
  };

  const isScanning = status === 'Scanning' || status === 'Connecting';
  const displayStatus = {
    'Disconnected': 'Listo para escanear.',
    'Scanning': 'Buscando dispositivos...',
    'Connecting': 'Conectando al GATT Server...',
    'Connected': 'Conectado.',
    'Error': 'Error de conexión.'
  }[status] || 'Estado desconocido.';

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <header className="flex items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white">
          <BackIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mx-auto">Buscar Antena Bluetooth</h2>
        <div className="w-8"></div>
      </header>

      <div className="flex flex-col items-center justify-center flex-grow p-8 text-center">
        {isScanning ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mb-6"></div>
            <h3 className="text-lg font-semibold">{displayStatus}</h3>
            <p className="text-gray-400 mt-2">Por favor, selecciona tu antena LoRa desde la ventana emergente del sistema.</p>
          </>
        ) : (
          <>
            <svg className="w-20 h-20 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>

            <h3 className="text-xl font-semibold mb-2">Listo para Conectar</h3>
            <p className="text-gray-400 mb-8 max-w-sm">{displayStatus}</p>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full max-w-sm bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 ease-in-out disabled:bg-gray-600"
            >
              Iniciar Escaneo
            </button>
            
            {error && <p className="text-red-400 mt-6 max-w-sm">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};


const ChatScreen = ({ connectedDevice, messages, onSendMessage, onDisconnect }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (isSOS = false) => {
    const textToSend = isSOS ? "Emergencia! SOS! Emergencia!" : inputText.trim();
    if (textToSend === '') return;

    // Call the BLE send function passed from the App container
    onSendMessage(textToSend, isSOS);

    if (!isSOS) setInputText('');
  };

  const MessageBubble = ({ msg }) => {
    const isMe = msg.sender === 'me';
    const isSystem = msg.sender === 'system';
    if (isSystem) return <div className="text-center text-xs text-gray-500 my-2 px-4">{msg.text}</div>;
    const bubbleClasses = isMe ? 'bg-cyan-600 self-end' : 'bg-gray-700 self-start';
    const sosClasses = msg.isSOS ? 'bg-red-600 font-bold animate-pulse' : '';
    return (
      <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl mb-2 shadow-md ${bubbleClasses} ${sosClasses}`}>
        <p className="break-words">{msg.text}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <header className="flex items-center p-3 border-b border-gray-700 sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10">
        <button onClick={onDisconnect} className="p-2 rounded-full hover:bg-gray-700 text-white">
          <BackIcon className="w-6 h-6" />
        </button>
        <div className="flex flex-col ml-3">
          <h2 className="text-lg font-bold">{connectedDevice?.name || 'Antena LoRa'}</h2>
          <p className="text-xs text-green-400">Conectado</p>
        </div>
      </header>

      <div className="flex-grow p-4 overflow-y-auto flex flex-col items-stretch space-y-2">
        {messages.map((msg, index) => <MessageBubble key={index} msg={msg} />)}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-3 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center space-x-2">
          <button onClick={() => handleSend(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded-full transition duration-150 ease-in-out shadow-lg">
            <span className="font-bold text-md">SOS</span>
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(false)}
            placeholder="Escribe tu mensaje"
            className="flex-grow bg-gray-700 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          />
          <button
            onClick={() => handleSend(false)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full disabled:bg-gray-600 transition duration-150 ease-in-out shadow-lg"
            disabled={!inputText.trim()}
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
};


// --- MAIN APP COMPONENT (BLE LOGIC CONTAINER) ---

export default function App() {
  // Navigation State
  const [screen, setScreen] = useState('landing'); // 'landing', 'scan', 'chat'
  
  // BLE State & Refs
  const [status, setStatus] = useState('Disconnected'); // Disconnected, Scanning, Connecting, Connected, Error
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  const deviceRef = useRef(null);
  const writeCharacteristicRef = useRef(null);
  const notifyCharacteristicRef = useRef(null);

  // --- Utility Functions ---

  // Utility to append messages (for system status or received data)
  const logMessage = useCallback((sender, text, isSOS = false) => {
    const newMessage = {
      id: Date.now(),
      sender, // 'me', 'other', or 'system'
      text,
      isSOS,
    };
    setMessages(prev => [...prev, newMessage]);
    console.log(`[${sender.toUpperCase()}] ${text}`);
  }, []);

  // --- BLE Handlers ---

  // 1. RECEIVE DATA (NOTIFICATION HANDLER)
  const handleCharacteristicValueChanged = useCallback((event) => {
    const value = event.target.value;
    // Decode the binary data to a string for chat display
    const receivedString = new TextDecoder().decode(value);
    logMessage('other', receivedString);
  }, [logMessage]);

  // 2. DISCONNECT HANDLER
  const onDisconnected = useCallback((event) => {
    const deviceName = event.target.name || 'Dispositivo Desconocido';
    logMessage('system', `La conexión con ${deviceName} ha sido perdida.`);
    
    // Clean up references and state
    if (notifyCharacteristicRef.current) {
      notifyCharacteristicRef.current.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    }
    deviceRef.current = null;
    writeCharacteristicRef.current = null;
    notifyCharacteristicRef.current = null;
    setStatus('Disconnected');
    
    // Navigate back to scan screen
    setScreen('scan');
  }, [logMessage, handleCharacteristicValueChanged]);

  // 3. CORE CONNECTION LOGIC (GATT connection and setup)
  const connectToDevice = useCallback(async (device) => {
    setStatus('Connecting');
    logMessage('system', `Intentando conectar al GATT server de ${device.name}...`);
    
    // Disconnect any existing device first
    if (deviceRef.current && deviceRef.current.gatt.connected) {
        deviceRef.current.gatt.disconnect();
    }

    try {
      // Connect to the GATT Server
      const server = await device.gatt.connect();

      // Get the primary service - If this fails, the UUIDs above are wrong.
      const service = await server.getPrimaryService(SERVICE_UUID);
      logMessage('system', `Servicio (${SERVICE_UUID}) encontrado.`);

      // Get characteristics
      const writeChar = await service.getCharacteristic(WRITE_CHAR_UUID);
      const notifyChar = await service.getCharacteristic(NOTIFY_CHAR_UUID);

      // --- NEW DEBUG LOGIC: PRINT CHARACTERISTIC PROPERTIES ---
      console.log('--- CHARACTERISTIC PROPERTIES FOR DEBUGGING ---');
      console.log(`WRITE CHAR (${WRITE_CHAR_UUID}):`, writeChar.properties);
      console.log(`NOTIFY CHAR (${NOTIFY_CHAR_UUID}):`, notifyChar.properties);
      console.log('---------------------------------------------');
      // --------------------------------------------------------

      // Save references
      writeCharacteristicRef.current = writeChar;
      notifyCharacteristicRef.current = notifyChar;
      deviceRef.current = device;
      
      // Start Notifications (Receiving Data)
      // FIX: Check for both 'notify' and 'indicate' properties
      let notificationActive = false;
      if (notifyChar.properties.notify || notifyChar.properties.indicate) {
        notifyChar.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        await notifyChar.startNotifications();
        notificationActive = true;
        logMessage('system', 'Notificaciones de recepción de datos activadas.');
        if (notifyChar.properties.indicate) {
            logMessage('system', '(Usando Indicaciones, que requieren confirmación, para recibir datos.)');
        }
      } 
      
      if (!notificationActive) {
        logMessage('system', 'Advertencia: El canal de recepción no soporta notificaciones ni indicaciones. No se recibirán datos del dispositivo.');
      }


      // Add a listener for device disconnection
      device.addEventListener('gattserverdisconnected', onDisconnected);

      setStatus('Connected');
      logMessage('system', `Conexión establecida con ${device.name}. ¡Listo!`);
      
      // Move to chat screen upon successful connection
      setScreen('chat');
      // Add a message directing the user to the console for UUID debug
      logMessage('system', 'Si aún tienes problemas, revisa la consola del navegador (F12) para ver las propiedades de las UUIDs y confirmar que soporten las operaciones de envío/recepción.');


    } catch (e) {
      setError(`Fallo la conexión: ${e.message}. El error más común aquí es un UUID de Servicio incorrecto. Por favor, verifica SERVICE_UUID.`);
      setStatus('Error');
      logMessage('system', `Error de conexión: ${e.message}`);
      // Clean up references if connection failed mid-process
      if (device.gatt.connected) device.gatt.disconnect();
    }
  }, [logMessage, onDisconnected, handleCharacteristicValueChanged]);

  // 4. SCAN AND INITIATE CONNECTION
  const scanAndConnect = async () => {
    setStatus('Scanning');
    setError(null);
    logMessage('system', 'Esperando selección de dispositivo...');
    
    // Check for Bluetooth support before proceeding
    if (typeof navigator.bluetooth === 'undefined') {
        setError('La API de Web Bluetooth no está disponible en este navegador. Por favor, usa Chrome en Android, macOS o Windows.');
        setStatus('Error');
        return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        // Use acceptAllDevices: true to show all devices.
        acceptAllDevices: true,
        // The service UUID is still required here to get GATT permission.
        optionalServices: [SERVICE_UUID], 
      });

      // Once the user selects a device, proceed to GATT connection
      await connectToDevice(device);

    } catch (e) {
      if (e.name === 'NotFoundError') {
        setError("Escaneo cancelado o no se encontró ningún dispositivo.");
        logMessage('system', 'Escaneo cancelado por el usuario.');
      } else {
        setError(`Error de escaneo: ${e.message}`);
        logMessage('system', `Error de escaneo: ${e.message}`);
      }
      setStatus('Disconnected');
    }
  };

  // 5. SEND DATA (WRITE) LOGIC
  const sendData = async (textToSend, isSOS = false) => {
    if (status !== 'Connected' || !writeCharacteristicRef.current) {
      logMessage('system', 'Error: No hay conexión activa para enviar datos.');
      return;
    }

    try {
      // 5a. Convert string to binary DataView
      const encoder = new TextEncoder();
      const value = encoder.encode(textToSend);

      // 5b. Check characteristic properties and use the appropriate write function
      // La caracteristica real de WRITE tiene write: true, así que usamos writeValue.
      if (writeCharacteristicRef.current.properties.write) {
        await writeCharacteristicRef.current.writeValue(value);
        logMessage('system', 'Datos enviados usando writeValue (con confirmación).');
      } else if (writeCharacteristicRef.current.properties.writeWithoutResponse) {
        // Fallback (menos probable basado en el log, pero buena práctica)
        await writeCharacteristicRef.current.writeValueWithoutResponse(value);
        logMessage('system', 'Datos enviados usando writeWithoutResponse.');
      } else {
        throw new Error('Characteristic does not support write or writeWithoutResponse.');
      }
      
      // 5c. Update chat log
      logMessage('me', textToSend, isSOS);

    } catch (e) {
      setError(`Error al escribir: ${e.message}`);
      logMessage('system', `Error al escribir: ${e.message}`);
    }
  };

  // --- Navigation Handlers ---
  const handleBackToLanding = () => {
    if (status === 'Connected') {
        // Disconnect first if connected
        if (deviceRef.current && deviceRef.current.gatt.connected) {
            deviceRef.current.gatt.disconnect();
        }
    }
    setMessages([]); // Clear chat history
    setScreen('landing');
  };
  
  const handleDisconnect = () => {
      if (deviceRef.current && deviceRef.current.gatt.connected) {
          deviceRef.current.gatt.disconnect();
      }
      onDisconnected({ target: deviceRef.current || { name: 'Dispositivo' } });
      setMessages([]); // Clear chat history
  }

  // --- UI Rendering ---

  const renderScreen = () => {
    switch (screen) {
      case 'landing':
        return <LandingScreen onFindAntennas={() => setScreen('scan')} />;
      case 'scan':
        return (
          <BluetoothScanScreen 
            onBack={handleBackToLanding} 
            connectAndNavigate={scanAndConnect} 
            status={status}
            error={error}
          />
        );
      case 'chat':
        return (
          <ChatScreen 
            connectedDevice={deviceRef.current} 
            messages={messages} 
            onSendMessage={sendData} 
            onDisconnect={handleDisconnect}
          />
        );
      default:
        return <LandingScreen onFindAntennas={() => setScreen('scan')} />;
    }
  };

  return (
    <main className="w-full h-screen font-sans bg-black flex items-center justify-center p-0 sm:p-4">
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="w-full h-full max-w-md mx-auto bg-gray-900 shadow-2xl rounded-none sm:rounded-2xl overflow-hidden relative">
        {renderScreen()}
      </div>
    </main>
  );
}
