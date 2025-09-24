import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Sparkles,
  ChevronDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

const CompanyChatbot = ({ 
  companyName = "ZooTechX",
  apiUrl = "https://botback-q7v3.onrender.com", // Force production URL
  position = "bottom-right" // bottom-right, bottom-left
}) => {
  // Debug environment variable
  console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Using API URL:', apiUrl);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [conversationContext, setConversationContext] = useState('initial');
  
  // Voice-related states
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Initialize voice features
  useEffect(() => {
    // Check if we're on HTTPS or localhost
    const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    // Initialize Speech Recognition
    if (isSecureContext && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Enhanced configuration for HTTPS environments
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true; // Show interim results
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;
      
      let finalTranscript = '';
      
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        finalTranscript = '';
      };
      
      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Update input with final or interim transcript
        setInputValue(finalTranscript + interimTranscript);
        
        if (finalTranscript) {
          setIsListening(false);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific errors
        switch (event.error) {
          case 'network':
            console.log('Network error - trying again...');
            break;
          case 'not-allowed':
            alert('Microphone access denied. Please allow microphone permissions.');
            break;
          case 'no-speech':
            console.log('No speech detected');
            break;
          case 'audio-capture':
            alert('No microphone found. Please check your microphone.');
            break;
          default:
            console.log('Speech recognition error:', event.error);
        }
        
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        // If we have final transcript, keep it
        if (finalTranscript) {
          setInputValue(finalTranscript);
        }
      };
      
      setRecognition(recognitionInstance);
    } else if (!isSecureContext) {
      console.warn('Speech recognition requires HTTPS or localhost');
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Voice input handler
  const handleVoiceInput = async () => {
    if (!recognition) {
      alert('Voice recognition is not supported in your browser or requires HTTPS.');
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      // Request microphone permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      // Clear any previous input
      setInputValue('');
      
      // Start recognition with retry logic
      try {
        recognition.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        
        // Retry once after a short delay
        setTimeout(() => {
          try {
            if (!isListening) {
              recognition.start();
            }
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            setIsListening(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Please allow microphone access to use voice input.');
    }
  };

  // Voice output handler
  const speakText = (text) => {
    if (!speechSynthesis || !isVoiceEnabled) return;
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    // Remove markdown and special characters for better speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/[#*`]/g, ''); // Remove other markdown characters
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure for male voice
    const voices = speechSynthesis.getVoices();
    const maleVoice = voices.find(voice => 
      voice.name.includes('Male') || 
      voice.name.includes('Daniel') || 
      voice.name.includes('Alex') ||
      voice.name.includes('Tom') ||
      voice.name.includes('James') ||
      voice.name.includes('David') ||
      (voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft')))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 0.8; // Lower pitch for male voice
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  // Toggle voice output
  const toggleVoiceOutput = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speak a specific message
  const speakMessage = (text) => {
    if (!isVoiceEnabled) {
      // Temporarily enable voice for this message
      speakText(text);
    } else {
      speakText(text);
    }
  };

  // Format message content: remove emojis and properly format markdown
  const formatMessage = (content) => {
    // Remove all emojis
    const noEmojis = content.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    
    // Format markdown bold text
    const formattedBold = noEmojis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format bullet points
    const formattedBullets = formattedBold.replace(/^•\s+/gm, '• ');
    
    // Format numbered lists
    const formattedNumbers = formattedBullets.replace(/^(\d+)\.?\s+/gm, '$1. ');
    
    // Clean up extra spaces and line breaks
    const cleaned = formattedNumbers.replace(/\n\s*\n/g, '\n').trim();
    
    return cleaned;
  };

  // Update conversation context for better suggestions
  const updateConversationContext = (botResponse, userMessage) => {
    const response = botResponse.toLowerCase();
    const message = userMessage.toLowerCase();
    
    if (response.includes('call') || response.includes('contact') || response.includes('email')) {
      setConversationContext('contact_phase');
    } else if (response.includes('pricing') || response.includes('cost') || response.includes('investment')) {
      setConversationContext('pricing_phase');
    } else if (response.includes('result') || response.includes('%') || response.includes('growth')) {
      setConversationContext('results_phase');
    } else if (response.includes('team') || response.includes('binoli') || response.includes('darshan')) {
      setConversationContext('team_phase');
    } else if (response.includes('process') || response.includes('discover') || response.includes('build')) {
      setConversationContext('process_phase');
    } else {
      setConversationContext('general');
    }
    
    // Reset used questions if we've used too many (keep conversation fresh)
    if (usedQuestions.size > 8) {
      setUsedQuestions(new Set());
    }
  };

  // Load suggested questions and company info
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/company-info`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        if (response.ok) {
          const data = await response.json();
          setSuggestedQuestions(data.data.suggestedQuestions || []);
        }
      } catch (error) {
        console.log('Using fallback data due to network/blocking issues');
        // Enhanced fallback suggestions when API is blocked
        setSuggestedQuestions([
          "What services do you offer?",
          "How can I contact your team?",
          "What results can I expect?",
          "How much do your solutions cost?",
          "Can you help with my project?"
        ]);
      }
    };

    loadCompanyData();
  }, [apiUrl]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        content: `Hi! I'm Genie, your AI assistant from ${companyName}. I'm here to help answer any questions about our services, pricing, or how we can help your business. What would you like to know?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [companyName, messages.length]);

  const sendMessage = async (messageText = null) => {
    const messageToSend = messageText || inputValue.trim();
    if (!messageToSend) return;

    // Track used questions to avoid repetition
    if (messageText) {
      setUsedQuestions(prev => new Set([...prev, messageText]));
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ 
          message: messageToSend,
          conversationHistory: messages.slice(-4), // Send last 4 messages for context
          usedQuestions: Array.from(usedQuestions),
          conversationContext: conversationContext
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Add bot response
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          matchedFAQ: data.data.matchedFAQ
        };
        setMessages(prev => [...prev, botMessage]);

        // Update follow-up questions, filtering out used questions
        if (data.data.followUpQuestions) {
          const freshQuestions = data.data.followUpQuestions.filter(q => !usedQuestions.has(q));
          setFollowUpQuestions(freshQuestions);
          setShowSuggestions(false); // Hide initial suggestions
          
          // Update conversation context based on the response
          updateConversationContext(data.data.answer, messageToSend);
        }

        // Speak the response if voice is enabled
        if (isVoiceEnabled) {
          setTimeout(() => speakText(data.data.answer), 500);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.log('API blocked or failed, using fallback response');
      
      // Enhanced fallback response when API is blocked
      let fallbackResponse = "I'm experiencing connectivity issues right now. ";
      
      // Provide contextual fallback based on the message
      const msg = messageToSend.toLowerCase();
      if (msg.includes('service') || msg.includes('offer') || msg.includes('do')) {
        fallbackResponse += "We offer AI-powered chatbots, automation solutions, and premium web development. Our services include smart chatbots, voice AI, automation tools, and custom websites.";
      } else if (msg.includes('contact') || msg.includes('reach') || msg.includes('call')) {
        fallbackResponse += "You can reach us at designedbymarso@gmail.com or call +359 988 777 80. We guarantee a 24-hour response time!";
      } else if (msg.includes('price') || msg.includes('cost') || msg.includes('payment')) {
        fallbackResponse += "Our pricing is tailored to your specific needs. Contact us for a personalized quote and consultation.";
      } else if (msg.includes('team') || msg.includes('who')) {
        fallbackResponse += "Our team includes Binoli Shah (Founder), Ghanaroopa Sawant (UI/UX Designer), Darshan Jain (Full-Stack Developer), and Heet Gala (AI/ML Developer).";
      } else {
        fallbackResponse += "Please try asking about our services, pricing, or contact information. You can also reach us directly at designedbymarso@gmail.com or +359 988 777 80.";
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: fallbackResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Set fallback follow-up questions
      setFollowUpQuestions([
        "What services do you offer?",
        "How can I contact your team?",
        "What are your pricing plans?",
        "Tell me about your team"
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-4 w-96 sm:w-[420px] h-[600px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#005eff] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">{companyName}</h3>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Voice Output Toggle */}
                <button
                  onClick={toggleVoiceOutput}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isVoiceEnabled 
                      ? 'text-green-400 hover:bg-green-500/20 bg-green-500/10' 
                      : 'text-gray-400 hover:bg-gray-500/20'
                  } ${isSpeaking ? 'animate-pulse' : ''}`}
                  title={isVoiceEnabled ? 'Voice output enabled (click to mute)' : 'Voice output disabled (click to enable)'}
                >
                  {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                
                {/* Refresh Button */}
                <button
                  onClick={() => window.location.reload()}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                  title="Refresh"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                {/* Close Button */}
                <button
                  onClick={toggleChat}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voice Input Info */}
            {!recognition && (
              <div className="mx-6 mb-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-500/80 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">!</span>
                  </div>
                  <p className="text-sm text-amber-200">
                    Voice input requires <strong>HTTPS</strong> or <strong>localhost</strong>. 
                    Make sure to allow microphone permissions when prompted.
                  </p>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 h-[440px] bg-gray-900">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      message.type === 'user' 
                        ? 'bg-[#001c4d]' 
                        : 'bg-[#202127]'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-white font-bold text-sm">Z</span>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`px-5 py-4 rounded-2xl shadow-lg flex-1 ${
                      message.type === 'user'
                        ? 'bg-[#001c4d] text-white'
                        : message.isError
                          ? 'bg-red-500/20 border border-red-500/30 text-red-200'
                          : 'bg-[#202127] text-white'
                    }`}>
                      <div 
                        className="text-sm leading-relaxed whitespace-pre-wrap font-semibold"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm opacity-70 font-medium">
                          {message.timestamp}
                        </span>
                        {/* Speaker button for bot messages */}
                        {message.type === 'bot' && !message.isError && (
                          <button
                            onClick={() => speakMessage(message.content)}
                            className="text-sm opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                            title="Speak message"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mt-1">
                      <span className="text-white font-bold text-sm">Z</span>
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-gray-800">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Initial Suggested Questions */}
              {showSuggestions && messages.length <= 1 && suggestedQuestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(question)}
                        className="text-sm px-4 py-2 bg-[#005eff] hover:bg-[#0052cc] rounded-full text-white transition-all duration-200 font-semibold shadow-sm"
                      >
                        {formatMessage(question)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Dynamic Follow-up Questions */}
              {!showSuggestions && followUpQuestions.length > 0 && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex flex-wrap gap-2">
                    {followUpQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(question)}
                        className="text-sm px-4 py-2 bg-[#005eff] hover:bg-[#0052cc] rounded-full text-white transition-all duration-200 font-semibold shadow-sm"
                      >
                        {formatMessage(question)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isListening ? "Listening..." : "Type your message..."}
                    className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium pr-12 ${
                      isListening ? 'ring-2 ring-red-500 border-red-500' : ''
                    }`}
                    disabled={isTyping || isListening}
                  />
                  
                  {/* Voice Input Button */}
                  <button
                    onClick={handleVoiceInput}
                    disabled={isTyping}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white'
                    } ${recognition ? '' : 'opacity-50 cursor-not-allowed'}`}
                    title={
                      !recognition 
                        ? 'Voice input not available (requires HTTPS or localhost)'
                        : isListening 
                        ? 'Stop listening (Click to stop)' 
                        : 'Start voice input (Click and speak)'
                    }
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  
                  {/* Voice status indicator */}
                  {isListening && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      <span className="text-xs text-red-500 font-medium">Listening...</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isTyping || isListening}
                  className="p-3 bg-[#005eff] hover:bg-[#0052cc] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005eff]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Voice status indicator */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-center space-x-2 text-red-400 text-sm"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span>Listening... Speak now</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="w-16 h-16 bg-[#005eff] hover:bg-[#0052cc] rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default CompanyChatbot;