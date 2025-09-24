# ZooTechX Chatbot Frontend

A professional AI-powered chatbot interface built with React, Vite, and Tailwind CSS. Features voice input/output, dynamic suggestions, and clean professional design.

## Features

- 🤖 AI-powered conversations with OpenAI GPT-4
- 🎤 Voice input and text-to-speech output
- 💬 Dynamic suggestion chips based on conversation context
- 🎨 Professional glassmorphism design
- 📱 Responsive and mobile-friendly
- 🔗 Embeddable on any website

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Djain912/BOTFRONT.git
   cd BOTFRONT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your backend API URL:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Deployment

### Deploy to Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable:
   - `VITE_API_URL`: Your backend API URL

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable:
   - `VITE_API_URL`: Your backend API URL

## Embedding on Other Websites

Once deployed, you can embed the chatbot on any website using our embed script. Contact us for the embed code.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Web Speech API** - Voice features

## License

MIT License - feel free to use for commercial projects.

## Support

For support, email: designedbymarso@gmail.com