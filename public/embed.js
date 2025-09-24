/**
 * ZooTechX Chatbot Embed Script
 * Adds a floating chatbot to any website
 * 
 * Usage: <script src="https://your-domain.vercel.app/embed.js" async></script>
 */

(function() {
  'use strict';
  
  // Configuration - Update this URL after deployment
  const CHAT_URL = 'https://botfrontend.netlify.app/';
  
  // Prevent multiple instances
  if (window.ZooTechXChatLoaded) return;
  window.ZooTechXChatLoaded = true;
  
  // Create chat button
  const createChatButton = () => {
    const button = document.createElement('button');
    button.id = 'zootechx-chat-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
      z-index: 999999;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0;
    `;
    
    button.onmouseenter = () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
    };
    
    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
    };
    
    return button;
  };
  
  // Create chat iframe container
  const createChatContainer = () => {
    const container = document.createElement('div');
    container.id = 'zootechx-chat-container';
    container.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 600px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      display: none;
      background: white;
    `;
    
    const iframe = document.createElement('iframe');
    iframe.src = CHAT_URL;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 16px;
    `;
    
    container.appendChild(iframe);
    return container;
  };
  
  // Initialize chat widget
  const initChatWidget = () => {
    const button = createChatButton();
    const container = createChatContainer();
    
    let isOpen = false;
    
    button.onclick = () => {
      isOpen = !isOpen;
      container.style.display = isOpen ? 'block' : 'none';
      button.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
    };
    
    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
      if (isOpen && !container.contains(e.target) && e.target !== button) {
        isOpen = false;
        container.style.display = 'none';
        button.style.transform = 'scale(1)';
      }
    });
    
    // Handle mobile responsiveness
    const handleResize = () => {
      if (window.innerWidth < 450) {
        container.style.width = '90vw';
        container.style.right = '5vw';
        container.style.height = '80vh';
        container.style.bottom = '80px';
      } else {
        container.style.width = '380px';
        container.style.right = '20px';
        container.style.height = '600px';
        container.style.bottom = '90px';
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    document.body.appendChild(button);
    document.body.appendChild(container);
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
  } else {
    initChatWidget();
  }
  
})();