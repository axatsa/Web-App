# 🚀 Optimizer Demo Guide

This guide will help you run the **Optimizer** application for your presentation.

## ✅ Before the Meeting (Do this NOW)

1.  **Get a Telegram Bot Token**:
    *   Open Telegram and search for `@BotFather`.
    *   Send the command `/newbot`.
    *   Follow instructions to name your bot (e.g., `OptimizerDemoBot`).
    *   Copy the **HTTP API Token** it gives you.

2.  **Configure the App**:
    *   Open the file `.env` in this folder.
    *   Paste your token after `BOT_TOKEN=`.
    *   Save the file.

3.  **Test the Run**:
    *   Double-click `start_demo.bat`.
    *   Wait for 3 windows to open.
    *   Verify the web page opens in your browser.

---

## 🎤 During the Demo

1.  **Start the System**:
    *   Double-click `start_demo.bat`.
    *   Wait ~10 seconds for everything to load.

2.  **Show the Workflow**:
    *   **Open Telegram** and find your bot.
    *   Type `/start`.
    *   **Register**: Choose a role (e.g., Chef), enter a name.
    *   **Open App**: Click the "Open Optimizer" button.
    *   **Verify**: Show that the web app opens with your data.

3.  **Troubleshooting**:
    *   **White Screen?** Refresh the page. If it persists, check the "Frontend" window for errors.
    *   **Bot not replying?** Check the "Bot" window. If it says "Conflict: terminated by other getUpdates", close all python windows and run `start_demo.bat` again.

## ⚠️ Important Notes
*   **Do NOT close the black terminal windows.** They are the server. Minimizing them is fine.
*   The app runs on `localhost`. **It will only work on THIS computer.** You cannot open it on your phone unless you set up tunneling (advanced). Stick to the laptop for the demo.
