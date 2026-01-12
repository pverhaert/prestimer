# PresTimer

PresTimer is a "Sequential Presentation Timer" designed as a Progressive Web App (PWA). It empowers educators, moderators, and presenters to define a chain of multiple timers that automatically transition from one to the next. This eliminates manual intervention between presentation sections, ensuring a smooth and strictly timed flow.

## ✨ Features

* **Sequential Timing:** Link multiple timers together. When one finishes, the next starts automatically.
* **Dual Visual Modes:** Toggle between a high-contrast Light Mode and a low-light friendly Dark Mode.
* **Audio Cues:** Subtle sounds for timer completion and transitions.
* **PWA Ready:** Installable on devices with offline capabilities.
* **Distraction-Free UI:** Minimalist design with large, readable typography.
* **Responsive:** "Mobile-First" design that scales up perfectly for desktop projections.
* **Configurable visual effects:** Set a visual warning when a timer is about to finish.

## 🛠️ Project Structure

The project follows a clean, modular architecture separating core logic from UI components.

```
/
├── public/              # Static assets (icons, manifest.json, sounds)
├── src/
│   ├── components/      # UI components (Controls, TimerQueue, Settings, etc.)
│   ├── core/            # Business logic (Timer class, TimeChain logic)
│   ├── services/        # External services (AudioService, ServiceWorker registration)
│   ├── utils/           # Helper functions
│   ├── main.js          # Application entry point
│   └── index.css        # Global styles and Tailwind imports
├── index.html           # Main HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/PresTimer.git
    cd PresTimer
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

### Development

Start the local development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5565` (or the port shown in your terminal).

### Production Build

Create a production-ready build:

```bash
npm run build
```

The output files will be in the `dist` directory.

### Preview Production Build

Preview the built application locally:

```bash
npm run preview
```

## ☁️ Deployment on Netlify

This project is optimized for deployment on Netlify.

### Option 1: Drag & Drop (Manual)

1. Run `npm run build` locally.
2. Log in to [Netlify](https://app.netlify.com/).
3. Go to the "Sites" tab.
4. Drag the `dist` folder created in step 1 onto the drop zone.

### Option 2: Continuous Deployment (Git Information)

1. Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2. Log in to [Netlify](https://app.netlify.com/) and click "Add new site".
3. Choose "Import an existing project".
4. Select your Git provider and repository.
5. Configure the build settings:
    * **Build command:** `npm run build`
    * **Publish directory:** `dist`
6. Click "Deploy site".

Netlify will now automatically build and deploy your site whenever you push changes to your repository.

## 📄 License

[MIT](LICENSE)
