import { useContext, useState, useEffect, useRef } from 'react';
import robot from '../assets/airobot.gif';
import { shopDataContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import sound from '../assets/swift-sound.mp3';

  const placeholders =[
    "search",
    "collection",
    "about",
    "home",
    "cart",
    "contact",
    "order"
  ];

function Ai() {
  const { showSearch, setShowSearch } = useContext(shopDataContext);
  const navigate = useNavigate();
  const [activeAi, setActiveAi] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const [index, setIndex] = useState(0);//for placeholder index
  const [userChat , setUserchat] = useState("");

  useEffect(()=>{ // placeholder changing on every 2sec
    const interval = setInterval(()=>{
      setIndex((prev) => (prev+1)% placeholders.length)
    },2000);

    return () => clearInterval(interval);
  },[]);

  const openingSound = new Audio(sound);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);

    // Add AI message to chat
    setChatMessages((prev) => [
      ...prev,
      { text: message, sender: 'ai', timestamp: new Date() },
    ]);
  };

  const speechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = speechRecognition ? new speechRecognition() : null;

  if (!recognition) {
    console.log('❌ Speech recognition not supported in this browser.');
  } else {
    recognition.continuous = false;
    recognition.interimResults = false;
  }

  const handleVoiceCommand = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    setIsListening(true);
    openingSound.play();
    setActiveAi(true);

    recognition.start();

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim().toLowerCase();

      // Add user message to chat
      setChatMessages((prev) => [
        ...prev,
        { text: transcript, sender: 'user', timestamp: new Date() },
      ]);

      processTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      setActiveAi(false);
      if (event.error === 'not-allowed') {
        toast.error('Please allow microphone access to use voice commands');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveAi(false);
    };
  };
  const processTranscript = (transcript) => {
    if (
      transcript.includes('search') &&
      transcript.includes('open') &&
      !showSearch
    ) {
      speak('Opening search for you');
      setShowSearch(true);
      navigate('/collection');
    } else if (
      transcript.includes('search') &&
      transcript.includes('close') &&
      showSearch
    ) {
      speak('Closing search');
      setShowSearch(false);
    } else if (
      transcript.includes('collection') ||
      transcript.includes('products')
    ) {
      speak('Taking you to our collection page');
      navigate('/collection');
    } else if (transcript.includes('about')) {
      speak("Here's our about page");
      navigate('/about');
      setShowSearch(false);
    } else if (transcript.includes('home') || transcript.includes('main')) {
      speak('Going to the home page');
      navigate('/');
      setShowSearch(false);
    } else if (transcript.includes('cart') || transcript.includes('basket')) {
      speak('Opening your shopping cart');
      navigate('/cart');
      setShowSearch(false);
    } else if (
      transcript.includes('contact') ||
      transcript.includes('help')
    ) {
      speak('Taking you to our contact page');
      navigate('/contact');
      setShowSearch(false);
    } else if (
      transcript.includes('order') ||
      transcript.includes('my orders')
    ) {
      speak('Showing your orders');
      navigate('/order');
      setShowSearch(false);
    } else {
      speak(
        "I'm not sure how to help with that. Try asking about navigation, products, or your orders."
      );
      toast.info(
        "Try saying: 'go to collection', 'open cart', or 'view orders'"
      );
    }
  };

//handle text chat or command from input box
  const handleTextcommand = () => { 
    const transcript = (userChat || '').trim().toLowerCase();
    if (!transcript) return;

    setChatMessages(prev => [...prev, { text: userChat, sender: 'user', timestamp: new Date() }]);
    processTranscript(transcript);
  }

  const handleRobotClick = () => {
    setShowChat((prev) => !prev);

    if (!hasWelcomed && !showChat) {
      speak('Welcome to RIVETO! How can I assist you today?');
      setHasWelcomed(true);
    }
  };

  const closeChat = () => {
    setShowChat(false);
  };



  return (
    <div className="fixed bottom-28 md:bottom-6 right-5 z-40">
      {/* AI Assistant Robot */}
      <div className="relative cursor-pointer group" onClick={handleRobotClick}>
        <div className="absolute -top-2 -right-2 bg-[#EF4444] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-pulse">
          <MessageCircle size={17} />
        </div>
        <img
          src={robot}
          alt="AI Assistant Robot"
          className="w-20 h-20 transition-all duration-300"
          style={{
            filter: activeAi
              ? 'drop-shadow(0 4px 6px rgba(37, 99, 235, 0.4))'
              : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          AI Assistant
        </div>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div className="absolute bottom-24 right-0 w-80 h-106 bg-white dark:bg-[#121826] rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Chat Header */}
          <div className="bg-[#2563EB] text-white py-2 px-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3
                className="font-semibold"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                RIVETO AI Assistant
              </h3>
            </div>
            <button
              onClick={closeChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className=" relative flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800"
          >
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 my-8">
                <p className="font-medium">Hello! I'm your RIVETO assistant.</p>
                <p className="text-sm mt-2">How can I help you today?</p>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-2 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}

            
          </div>


          {/* Quick Commands */}
          <div className="px-2 py-1 border-t border-gray-200 bg-white flex ">
            {/* <p className="text-xs text-gray-500 mb-2">Try saying:</p> */}
            {/* <div className="grid grid-cols-2 gap-2">
              {commonCommands.map((cmd, index) => (
                <div
                  key={index}
                  className="bg-gray-100 hover:bg-gray-200 transition-colors p-2 rounded text-xs cursor-pointer"
                  onClick={() => speak(cmd.description)}
                >
                  <div className="font-medium truncate text-black">"{cmd.command}"</div>
                </div>
              ))}
            </div> */}
            <input 
              value={userChat}
              onChange={(e)=> setUserchat(e.target.value)}
              type="text"
              aria-label="Chat input"
              placeholder={placeholders[index]}
              className="placeholder:text-gray-400 text-black border border-gray-300 rounded-sm px-2 mr-1 py-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e)=>{
                if(e.key === 'Enter'){
                  handleTextcommand();
                  setUserchat('');
                }
              }}
            />
            {/*enter button */}
            <button 
              type="button"
              aria-label="Send message"
              onClick={()=>{
                handleTextcommand();
                setUserchat('');
              }}
              className='bg-blue-500 text-white rounded-sm p-1 px-2 mr-1 hover:bg-blue-600 transition-colors'
            >
              enter
            </button> 
            <button // voice control
              onClick={handleVoiceCommand}
              disabled={isListening}
              className={`
                sticky 
                w-8 h-8
                rounded-full
                flex items-center justify-center
                shadow-lg
                text-white
                transition-all duration-300
                focus:outline-none
                focus:ring-2 focus:ring-[#2563EB]/30
                ${
                  isListening
                    ? 'bg-[#EF4444] hover:bg-red-600'
                    : 'bg-[#2563EB] hover:bg-[#1d4ed8]'
                }
             `}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
          </div>


        </div>
      )}
    </div>
  );
}

export default Ai;
