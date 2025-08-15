// Healthbot Module
const HealthBot = (() => {
  // DOM Elements
  let messagesContainer;
  let input;
  let sendBtn;
  let voiceBtn;
  let recognition;
  let isInitialized = false;

  // Initialize the healthbot
  const init = () => {
    if (isInitialized) return;
    cacheDOM();
    initializeEventListeners();
    initializeVoiceRecognition();
    addWelcomeMessage();
    isInitialized = true;
  };

  // Cache DOM elements
  const cacheDOM = () => {
    messagesContainer = document.getElementById('healthbot-messages');
    input = document.getElementById('healthbot-input');
    sendBtn = document.getElementById('healthbot-send');
    voiceBtn = document.getElementById('healthbot-voice');
  };

  // Initialize event listeners
  const initializeEventListeners = () => {
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // Quick command buttons
    document.querySelectorAll('.command-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const command = btn.textContent.trim();
        processCommand(command);
      });
    });
  };

  // Initialize voice recognition
  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        input.value = transcript;
        processMessage(transcript);
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      };

      recognition.onerror = (e) => {
        console.error('Speech recognition error', e.error);
        addMessage('I had trouble understanding that. Could you try typing instead?', 'bot');
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      };

      recognition.onspeechend = () => {
        recognition.stop();
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      };

      voiceBtn.addEventListener('click', toggleVoiceRecognition);
    } else {
      voiceBtn.style.display = 'none';
      console.log('Speech recognition not supported in this browser');
    }
  };

  // Toggle voice recognition
  const toggleVoiceRecognition = () => {
    if (!recognition) return;

    if (voiceBtn.classList.contains('recording')) {
      recognition.stop();
      voiceBtn.classList.remove('recording');
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
      try {
        recognition.start();
        voiceBtn.classList.add('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        addMessage('Listening...', 'bot', 'listening');
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    }
  };

  // Send message handler
  const sendMessage = () => {
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';
    processMessage(message);
  };

  // Process user message
  const processMessage = (message) => {
    showTypingIndicator();
    
    // Simulate API call delay
    setTimeout(() => {
      hideTypingIndicator();
      const response = getResponse(message);
      addMessage(response, 'bot');
    }, 1000);
  };

  // Process quick command
  const processCommand = (command) => {
    input.value = command;
    sendMessage();
  };

  // Generate bot response
  const getResponse = (message) => {
    const msg = message.toLowerCase();
    
    const responses = {
      'hello|hi|hey': 'Hello! I\'m your BioHealth Assistant. How can I help you today?',
      'how are you': 'I\'m here to help you with your health questions! What would you like to know?',
      'heart rate': 'Your current heart rate is 72 BPM, which is within the normal range (60-100 BPM).',
      'blood pressure': 'Your last recorded blood pressure was 120/80 mmHg, which is considered normal.',
      'temperature': 'Your last recorded temperature was 98.6°F (37°C), which is normal.',
      'emergency': 'If this is a medical emergency, please call your local emergency number immediately.',
      'help': 'I can help with: heart rate, blood pressure, temperature, and general health advice.',
      'symptoms': 'I can help you understand common symptoms, but please consult a healthcare professional for medical advice.',
      'medication': 'For medication-related questions, please consult your doctor or pharmacist.',
      'appointment': 'You can schedule an appointment through the dashboard or contact your healthcare provider directly.',
      'default': 'I\'m not sure I understand. Could you rephrase that? Here are some things I can help with: heart rate, blood pressure, temperature, or general health advice.'
    };

    for (const [key, response] of Object.entries(responses)) {
      if (new RegExp(key).test(msg)) {
        return response;
      }
    }

    return responses['default'];
  };

  // Add message to chat
  const addMessage = (content, sender, type = '') => {
    // Remove typing indicator if present
    if (type !== 'typing') {
      const typing = document.querySelector('.typing-indicator');
      if (typing) typing.remove();
    }

    // Don't add empty messages unless it's a typing indicator
    if (!content.trim() && type !== 'typing') return;

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'bot' ? 'bot' : 'user'}`;
    
    if (type === 'typing') {
      messageDiv.classList.add('typing-indicator');
      messageDiv.innerHTML = `
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
      `;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  // Show typing indicator
  const showTypingIndicator = () => {
    addMessage('', 'bot', 'typing');
  };

  // Hide typing indicator
  const hideTypingIndicator = () => {
    const typing = document.querySelector('.typing-indicator');
    if (typing) typing.remove();
  };

  // Add welcome message
  const addWelcomeMessage = () => {
    // Clear any existing messages
    messagesContainer.innerHTML = '';
    
    // Add welcome message
    setTimeout(() => {
      addMessage('Hello! I\'m your BioHealth Assistant. I can help you with:', 'bot');
      
      // Show quick tips after a short delay
      setTimeout(() => {
        addMessage('• Heart rate and blood pressure\n• Temperature and vitals\n• General health advice\n• Medication reminders', 'bot');
      }, 500);
      
      // Additional tip
      setTimeout(() => {
        addMessage('You can type your question or use the microphone button to speak.', 'bot');
      }, 1000);
    }, 500);
  };

  // Public API
  return {
    init,
    processCommand
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  HealthBot.init();
});
