import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2, Bot, User, Lightbulb } from 'lucide-react';

const AILearningAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI Learning Assistant. I can help you with learning paths, competencies, and answer questions about your learning journey. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Suggested quick actions
  const quickActions = [
    { icon: Lightbulb, text: "Recommend a learning path", action: "recommend" },
    { icon: Bot, text: "Explain a concept", action: "explain" },
    { icon: MessageCircle, text: "How do I get started?", action: "start" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botResponse = generateResponse(inputMessage);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action) => {
    let message = '';
    switch (action) {
      case 'recommend':
        message = 'Can you recommend a learning path for me?';
        break;
      case 'explain':
        message = 'Can you explain how competencies work?';
        break;
      case 'start':
        message = 'How do I get started with my learning journey?';
        break;
      default:
        message = 'Help me';
    }
    setInputMessage(message);
  };

  const generateResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Simple pattern matching (replace with actual AI service call)
    if (input.includes('recommend') || input.includes('suggest')) {
      return "I'd be happy to recommend a learning path! To give you the best recommendation, I need to know:\n\n1. What's your current skill level?\n2. What area are you interested in (e.g., Web Development, Data Science, UI/UX)?\n3. How much time can you dedicate per week?\n\nYou can also explore our competencies page to see what skills match your goals!";
    }

    if (input.includes('competenc')) {
      return "Competencies are the building blocks of your learning journey. Each competency represents a specific skill or knowledge area.\n\n📚 Key features:\n• Organized by categories and difficulty levels\n• Include learning resources and practice materials\n• Can be assessed through AI-generated quizzes\n• Track your progress as you master them\n\nWould you like me to help you find competencies in a specific area?";
    }

    if (input.includes('start') || input.includes('begin')) {
      return "Great question! Here's how to get started:\n\n1️⃣ **Explore Competencies**: Browse our competency library to see what skills are available\n\n2️⃣ **Take an Assessment**: Test your current knowledge to identify gaps\n\n3️⃣ **Build a Learning Path**: Create a personalized path based on your goals\n\n4️⃣ **Practice & Learn**: Use our resources and AI-powered tools\n\nWould you like help with any of these steps?";
    }

    if (input.includes('quiz') || input.includes('test') || input.includes('assessment')) {
      return "Our AI-powered assessments help you:\n\n✅ Test your knowledge on any competency\n✅ Get immediate feedback with explanations\n✅ Track your progress over time\n✅ Identify areas for improvement\n\nYou can generate practice quizzes on any competency detail page. Questions are tailored to your selected difficulty level!";
    }

    if (input.includes('learning path')) {
      return "Learning paths are personalized roadmaps to achieve your goals!\n\n🎯 Features:\n• Curated sequence of competencies\n• Estimated completion time\n• Progress tracking\n• Recommended resources\n\nYou can create custom paths or explore pre-made ones. Need help creating a learning path?";
    }

    if (input.includes('resource')) {
      return "We have a rich library of learning resources:\n\n📖 Articles & Tutorials\n🎥 Video courses\n💻 Interactive exercises\n📚 Books and documentation\n\nEach resource is tagged by competency and difficulty level. You can also get AI-generated summaries to save time!";
    }

    if (input.includes('thank') || input.includes('thanks')) {
      return "You're welcome! Feel free to ask me anything else about your learning journey. I'm here to help! 😊";
    }

    // Default response
    return "I'm here to help with:\n\n💡 Learning path recommendations\n📚 Explaining competencies and concepts\n✅ Assessment and quiz guidance\n🎯 Getting started tips\n📖 Finding resources\n\nWhat would you like to know more about?";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all ${
          isMinimized
            ? 'bottom-6 right-6 w-80 h-16'
            : 'bottom-6 right-6 w-96 h-[600px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">AI Learning Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'bot'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {message.type === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`inline-block max-w-[85%] px-4 py-2 rounded-lg ${
                        message.type === 'bot'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'bot'
                            ? 'text-gray-500 dark:text-gray-400'
                            : 'text-blue-100'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-3 space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.action)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs transition-colors"
                      >
                        <action.icon className="w-3 h-3" />
                        {action.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    {isTyping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Press Enter to send
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AILearningAssistant;
