import React, { useState, useEffect, useRef } from 'react';


import loraAntena from './assets/loraantena2.png';
import atrasIcono from './assets/atrasicono.png';
import enviar from './assets/enviar.png';


const LandingScreen = ({ onFindAntennas }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-900 text-white">
            <img
                src={loraAntena}
                alt="LoRa Antenna"
                className="w-24 h-24 mb-6 rounded-full"
            />
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


const BluetoothScanScreen = ({ onSelectAntenna, onBack }) => {
    const [status, setStatus] = useState('Listo para escanear.');
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);


    const handleScan = async () => {
        if (!navigator.bluetooth) {
            setError("La API de Web Bluetooth no está disponible en este navegador. Por favor, usa Chrome en Android, macOS o Windows.");
            setStatus('Error');
            return;
        }

        setError(null);
        setStatus('Solicitando permiso...');
        setIsScanning(true);

        try {
            console.log("solicitando dispositivos bluetooth");
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                // Aqui se agrega la lógica del filtrado de dispositivos para que sólo veamos antenas al realizar el escaneo bluetooth
            });

            console.log(`Dispositivo seleccionado: ${device.name}`);
            setStatus(`Dispositivo encontrado: ${device.name}`);
            
            onSelectAntenna(device);

        } catch (e) {
            console.error('Error during Bluetooth device request:', e);
            if (e.name === 'NotFoundError') {
                setError("Escaneo cancelado. No se seleccionó ningún dispositivo.");
                setStatus('Cancelado por el usuario.');
            } else {
                setError("Ocurrió un error. Asegúrate que el Bluetooth esté encendido y que la app tenga permisos.");
                setStatus('Error');
            }
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <header className="flex items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700">
                    <img src={atrasIcono} alt="Back" className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold mx-auto">Buscar Antena Bluetooth</h2>
                <div className="w-8"></div>
            </header>

            <div className="flex flex-col items-center justify-center flex-grow p-8 text-center">
                {isScanning ? (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mb-6"></div>
                        <h3 className="text-lg font-semibold">Buscando dispositivos...</h3>
                        <p className="text-gray-400 mt-2">Por favor, selecciona tu antena LoRa desde la ventana emergente del sistema.</p>
                    </>
                ) : (
                    <>
                        <svg className="w-20 h-20 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                        </svg>

                        <h3 className="text-xl font-semibold mb-2">Listo para Conectar</h3>
                        <p className="text-gray-400 mb-8 max-w-sm">Presiona el botón para buscar antenas LoRa cercanas a través de Bluetooth.</p>

                        <button
                            onClick={handleScan}
                            className="w-full max-w-sm bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 ease-in-out"
                        >
                            Iniciar Escaneo
                        </button>
                        
                        {error && <p className="text-red-400 mt-6">{error}</p>}
                    </>
                )}
            </div>
        </div>
    );
};



const ChatScreen = ({ antenna, onBack }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: 'Conexión establecida. Ya puedes enviar mensajes.', sender: 'system' },
    ]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (isSOS = false) => {
        const textToSend = isSOS ? "Emergencia! SOS! Emergencia!" : inputText.trim();
        if (textToSend === '') return;

        const newMessage = {
            id: Date.now(),
            text: textToSend,
            sender: 'me',
            isSOS: isSOS,
        };

        setMessages(prev => [...prev, newMessage]);
        if (!isSOS) setInputText('');

        setTimeout(() => {
            const reply = {
                id: Date.now() + 1,
                text: isSOS ? 'SOS RECIBIDO. ENVIANDO AYUDA.' : 'Mensaje recibido.',
                sender: 'other'
            };
            setMessages(prev => [...prev, reply]);
        }, 1500);
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
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700">
                    <img src={atrasIcono} alt="Back" className="w-6 h-6" />
                </button>
                <div className="flex flex-col ml-3">
                    <h2 className="text-lg font-bold">{antenna.name || 'Dispositivo Desconocido'}</h2>
                    <p className="text-xs text-green-400">Conectado</p>
                </div>
            </header>

            <div className="flex-grow p-4 overflow-y-auto flex flex-col items-stretch space-y-2">
                {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-3 border-t border-gray-700 bg-gray-900">
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleSend(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded-full">
                        <span className="font-bold text-md">SOS</span>
                    </button>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Escribe tu mensaje"
                        className="flex-grow bg-gray-700 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                    />
                    <button
                        onClick={() => handleSend(false)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full disabled:bg-gray-600"
                        disabled={!inputText.trim()}
                    >
                        <img src={enviar} alt="Enviar" className="w-6 h-6" />
                    </button>
                </div>
            </footer>
        </div>
    );
};



export default function App() {
    const [screen, setScreen] = useState('landing'); // 'landing', 'scan', 'chat'
    const [selectedAntenna, setSelectedAntenna] = useState(null);

    const handleFindAntennas = () => {
        setScreen('scan');
    };

    const handleSelectAntenna = (antenna) => {
        setSelectedAntenna(antenna);
        setScreen('chat');
    };

    const handleBackToScan = () => {
        setScreen('scan');
        setSelectedAntenna(null);
    };

    const handleBackToLanding = () => {
        setScreen('landing');
    };

    const renderScreen = () => {
        switch (screen) {
            case 'landing':
                return <LandingScreen onFindAntennas={handleFindAntennas} />;
            case 'scan':
                return <BluetoothScanScreen onSelectAntenna={handleSelectAntenna} onBack={handleBackToLanding} />;
            case 'chat':
                return selectedAntenna ? <ChatScreen antenna={selectedAntenna} onBack={handleBackToScan} /> : <BluetoothScanScreen onSelectAntenna={handleSelectAntenna} onBack={handleBackToLanding} />;
            default:
                return <LandingScreen onFindAntennas={handleFindAntennas} />;
        }
    };

    return (
        <main className="w-full h-screen font-sans bg-black flex items-center justify-center p-0 sm:p-4">
            <div className="w-full h-full max-w-md mx-auto bg-gray-900 shadow-2xl rounded-none sm:rounded-2xl overflow-hidden relative">
                {renderScreen()}
            </div>
        </main>
    );
}

