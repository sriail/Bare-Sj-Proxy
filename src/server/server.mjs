/**
 * Scramjet Cloudflare Worker Entry Point
 * 
 * Serves the Scramjet proxy UI and associated static assets.
 */

// Import the EpoxyTransport script as a raw string to serve it to the client
import epoxyScript from "../epoxy/index.js?raw";

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Scramjet</title>
    <link rel="manifest" href="/manifest.json">
    <style>
      :root,
      [data-theme="light"] {
        --bg: #f5f5f5;
        --bg-nav: #ffffff;
        --bg-card: #ffffff;
        --text: #1a1a1a;
        --text-muted: #666;
        --border: #ddd;
        --accent: #8a9bb2;
        --input-bg: #f0f0f0;
        --btn-hover: #e0e0e0;
        --settings-bg: #fafafa;
      }
      [data-theme="dark"] {
        --bg: #121212;
        --bg-nav: #1e1e1e;
        --bg-card: #252525;
        --text: #e0e0e0;
        --text-muted: #999;
        --border: #333;
        --accent: #8a9bb2;
        --input-bg: #2a2a2a;
        --btn-hover: #383838;
        --settings-bg: #252525;
      }
      *, *::before, *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html, body {
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: var(--bg);
        color: var(--text);
      }
      #navbar {
        display: flex;
        align-items: center;
        height: 48px;
        padding: 0 12px;
        background: var(--bg-nav);
        border-bottom: 1px solid var(--border);
        gap: 8px;
        z-index: 1000;
        position: relative;
      }
      .nav-center {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 4px;
        min-width: 0;
      }
      .nav-right {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .nav-btn {
        background: none;
        border: none;
        color: var(--text);
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
      }
      .nav-btn:hover { background: var(--btn-hover); }
      #navbar-form {
        flex: 1;
        display: flex;
        min-width: 0;
      }
      #navbar-url {
        width: 100%;
        padding: 6px 12px;
        font-size: 14px;
        border: 1px solid var(--border);
        border-radius: 20px;
        background: var(--input-bg);
        color: var(--text);
        outline: none;
        transition: border 0.2s;
      }
      #navbar-url:focus { border-color: var(--accent); }
      #home-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: calc(100vh - 48px);
      }
      .home-center { text-align: center; }
      .home-logo {
        width: 190px;
        height: 190px;
        margin-bottom: 24px;
        fill: var(--text);
        color: var(--text);
      }
      .home-center h1 {
        margin-bottom: 24px;
        font-size: 28px;
        font-weight: 600;
      }
      #home-form { display: flex; justify-content: center; }
      #home-search {
        width: 400px;
        max-width: 90vw;
        padding: 12px 20px;
        font-size: 16px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--input-bg);
        color: var(--text);
        outline: none;
        transition: border 0.2s, box-shadow 0.2s;
      }
      #home-search:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(138, 155, 178, 0.2);
      }
      #frame-container {
        display: none;
        height: calc(100vh - 48px);
        width: 100%;
      }
      #proxy-frame {
        width: 100%;
        height: 100%;
        border: none;
      }
      #settings-panel {
        display: none;
        position: absolute;
        top: 48px;
        right: 12px;
        width: 320px;
        max-width: calc(100vw - 24px);
        background: var(--settings-bg);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
        z-index: 999;
        padding: 20px;
      }
      .settings-content h2 { font-size: 18px; margin-bottom: 16px; }
      .settings-group { margin-bottom: 16px; }
      .settings-group label {
        display: block;
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 6px;
      }
      .settings-group select {
        width: 100%;
        padding: 8px 12px;
        font-size: 14px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--input-bg);
        color: var(--text);
        outline: none;
      }
      .settings-btn {
        width: 100%;
        padding: 8px 12px;
        font-size: 14px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--input-bg);
        color: var(--text);
        cursor: pointer;
        transition: background 0.15s;
      }
      .settings-btn:hover { background: var(--btn-hover); }
    </style>
  </head>
  <body>
    <nav id="navbar">
      <div class="nav-center">
        <button id="btn-back" class="nav-btn" title="Back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12l14 0" /><path d="M5 12l6 6" /><path d="M5 12l6 -6" />
          </svg>
        </button>
        <button id="btn-forward" class="nav-btn" title="Forward">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12l14 0" /><path d="M19 12l-6 6" /><path d="M19 12l-6 -6" />
          </svg>
        </button>
        <button id="btn-reload" class="nav-btn" title="Reload">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
          </svg>
        </button>
        <form id="navbar-form" autocomplete="off">
          <input id="navbar-url" type="text" placeholder="Search or enter URL" />
        </form>
      </div>
      <div class="nav-right">
        <button id="btn-home" class="nav-btn" title="Home">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
          </svg>
        </button>
        <button id="btn-fullscreen" class="nav-btn" title="Fullscreen">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 8V6a2 2 0 0 1 2-2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2-2v-2" />
          </svg>
        </button>
        <button id="btn-settings" class="nav-btn" title="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.066 2.573c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.573 1.066c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.066 -2.573c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37.996 .607 2.296 .07 2.573 -1.066z" />
            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
          </svg>
        </button>
      </div>
    </nav>

    <div id="settings-panel">
      <div class="settings-content">
        <h2>Settings</h2>
        <div class="settings-group">
          <label for="theme-select">Theme</label>
          <select id="theme-select">
            <option value="system">System (Default)</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <button id="settings-save" type="button" class="settings-btn">Save</button>
      </div>
    </div>

    <div id="home-content">
      <div class="home-center">
        <svg class="home-logo" viewBox="0 0 1400 1400" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke="currentColor" stroke-width="32" stroke-linecap="round" stroke-linejoin="round">
            <path d="M 1020.5 0 h 76.6 c 7.5 5.3 20.3 7.3 29 10.6 c 5.9 2.3 11.8 4.5 17.5 7.2 C 1191.1 36 1239 94.9 1249 144.4 c 6.7 32.9 11.5 73.1 16.8 108 C 1277.3 322.5 1287.5 392.9 1296.4 463.4 c 2.3 18.7 4.7 39 7.9 57.6 c 2.9 17.2 8.1 35.4 11 52.7 c 2.3 13.3 4.1 26.8 6.1 40.2 c 0.9 5.9 5.3 18.9 5.5 23.5 c 1.5 29.4 1.8 62 -0.1 91.4 c -0.6 9 -4.7 25.2 -6.1 34.8 c -1.8 12.4 -3.5 26.3 -5.7 38.3 c -9.3 50.8 -24.5 97.5 -47.2 143.8 c -9.8 20.1 -22.8 46.9 -34.8 65.7 C 1218.7 1034 1203.2 1055.8 1186.6 1076.8 c -4 5.6 -10.3 13 -15.4 17.6 c -137.3 153 -332.8 225.8 -536.8 201.6 c -25.1 15.8 -48.9 31.4 -76.1 43.3 c -30.2 13.2 -61.6 27.4 -93.2 36.6 C 448.5 1380.8 431.7 1385 414.8 1388.5 c -9.3 1.9 -36.5 5.2 -41.3 11.2 h -54 c -4.6 -6 -42.1 -14.3 -54.1 -20.2 c -22.1 -10.8 -42.7 -23.6 -59.8 -41.6 C 194.2 1325.7 184.3 1312.2 176.2 1297.7 c -13.3 -24.3 -25.5 -62.2 -36 -88.5 c -8.4 -23.9 -20.9 -47.1 -26.2 -72.1 c -13.7 -64.6 -1.3 -130.7 47.2 -176.6 c -10.5 -18.5 -17.5 -41.9 -27 -61.2 c -7.4 -15.2 -16.9 -29.1 -23.8 -44.5 C 83.1 793.7 73.4 726.2 82.5 659.9 c 1.6 -11.7 5.5 -34.6 10.2 -45.4 c 12.7 -28.9 17 -56.3 25.2 -86.3 C 127.5 493.3 139.9 459.3 155 426.4 c 77.1 -163 221.8 -284 395.9 -331.1 c 47 -12.5 96.3 -18.3 144.8 -21 c 15.8 -0.9 39.2 2.1 53.3 -0.7 c 12.7 -2.5 24.2 -15.6 36 -21.4 c 24.8 -12.3 53.5 -19.2 80.7 -23.7 C 886.4 25.1 1011.9 6.8 1020 0.2 c 0.2 -0.1 0.3 -0.3 0.5 -0.5 m -881 649.7 c -0.6 7.9 -1.5 16.5 -1.5 24.4 C 138.2 716.3 147.9 758.2 166.4 796.5 c 4.6 9.7 9.7 19.1 14.5 28.7 c 18 36 31.7 74 52.6 108.6 c 2.6 4.3 5.1 9 7.5 13.4 c -12.1 7 -21 12.1 -31.7 21 c -6.7 6.7 -14.8 14.4 -21 21.3 c -28.2 38.5 -24.6 87.2 -6.5 129.3 c 14.1 32.7 25.5 68 39.9 100.8 c 4 9.1 11.6 19.3 14.9 27.2 c 8.2 8.1 17.8 17.1 25.4 25.6 c 13.6 10.8 35.2 21.2 52.3 23.4 c 68.5 9.1 168.6 -25.9 227.4 -58.7 C 551.7 1231.5 561.4 1225.6 570.9 1219.2 c 4.4 -3 31.5 -23.1 35.5 -23.3 c 20.6 -1.1 43.9 3.9 64.7 5.3 c 172.1 11.9 339.2 -63.5 449.9 -193.6 C 1203.6 910.6 1249.8 787.9 1251.8 660.5 c 0.8 -40.9 -5.9 -94.4 -15.1 -134.3 c -9.4 -40.6 -12.2 -77.8 -17.8 -118.8 C 1210.1 344.1 1200.7 280.9 1190.6 217.8 c -5 -31.8 -8.5 -66.3 -16 -97.1 c -4.8 -20 -19.8 -39.8 -34.1 -54.6 C 1123.1 48.1 1100.2 36.3 1075.4 32.8 c -41.3 -6.3 -103 10.4 -145 16.2 c -35.8 4.9 -74.1 11.2 -108.6 21.8 c -24.5 7.5 -34.5 26.7 -56.2 36.4 c -5.3 2.2 -40 0 -49.6 -0.3 c -143.9 -3.9 -280.5 46.7 -384.6 147.4 l -25 25 C 249 338.8 206.2 410.8 181.4 489.6 c -7.9 24.8 -12.3 47.9 -18.3 72.9 c -3.2 13.3 -11.8 31 -15.7 44.6 c -2.8 9.9 -4.4 19.3 -6 29.5 c -0.3 2 -1.6 12 -2 13"/>
            <path d="M 851.6 227.9 c -2.6 -13.9 -4.7 -27 -6.7 -40.9 c -2.8 -20.2 16 -25.7 32.6 -28.1 c 59.1 -8.3 118.3 -21.8 177.7 -27 c 19.1 -1.7 26 18.8 28.6 34.2 a 7001 7001 0 0 1 45.7 321.1 c 1.7 15.2 6.1 38 7.2 51.5 c 31.1 126.3 16.5 237.5 -51 349.2 a 456 456 0 0 1 -275.6 202.9 c -27.8 6.8 -76.1 11.9 -105.1 12.8 c -18.4 0.5 -60.5 -5.7 -79.8 -7.6 c -11.3 -1.1 -33.6 -7.4 -46.5 -9.8 c -9.8 17 -70.3 56.7 -90.6 66.4 c -44.4 21.2 -103.9 44.9 -154 45.9 c -2.6 0.1 -9.4 -2.2 -12 -3 c -12.9 -15.7 -20.8 -43.6 -28.8 -62.7 c -9.3 -21.8 -18.2 -44.5 -26.1 -66.8 c -1.3 -3.6 -3.1 -12.3 -1.8 -16.4 c 4.1 -7.7 30.2 -11.5 38.6 -13.9 a 138 138 0 0 0 18.1 -6.6 c 28.7 -12.8 48.9 -32 61.3 -60.8 c -8.6 -13.5 -21.5 -23.2 -30.8 -35.3 c -10.7 -14 -25 -34 -33.5 -48.6 c -7.5 -12.9 -36.7 -66.2 -35.4 -79.4 c -1.6 -6.4 -12.8 -21.4 -16.8 -28 c -35.5 -60.4 -42.9 -125 -4.8 -187.5 c -2.6 -39.1 33.6 -129.3 56.2 -163 c 14.1 -20.9 27 -43.3 44.2 -62.4 c 7.8 -8.7 16.6 -17.1 24.5 -25.4 c 65.2 -68.4 161.6 -116.8 255.3 -129 c 21.4 -2.9 43.6 -1.3 65 -1.8 c 34.6 -0.8 67.1 1.1 100.9 9.3 c 9.3 2.3 35.6 13.2 43.3 10.9 m -89.3 584.6 c -24.2 -0.7 -49.6 -0.4 -73.9 -0.4 c -16.6 0 -37.2 -0.6 -53.3 0.5 c 13.5 53.8 39 105.9 67.3 153.3 c 9.2 -17.5 20 -36.5 29.7 -53.9 c 6.7 -11.9 18.4 -42.4 24.2 -51.2 c 4.5 -16 4.6 -31.7 6 -48.3 M 549.6 477.5 c 6.9 -11.5 13.6 -42.7 18.7 -56.4 c 8 -21.3 17.4 -38 28.2 -57.8 a 87 87 0 0 0 -9.8 2.1 c -40.7 11.2 -82 44 -109 75.1 c -4.1 4.8 -14.9 14.4 -17.4 19 c 1.9 2.1 5.9 2.4 8.9 3 c 27.1 -5.6 65.9 -15.9 80.4 14.9 M 859.4 496 c 8.2 0 29.3 0.6 35.9 -1.4 c -1.9 -6 -2 -13.9 -3.1 -19.7 c -3 -16.2 -6.6 -64.7 -11.7 -77.3 c -15.7 -13.2 -52.8 -31.1 -73.3 -34.3 c 20.4 28.9 33.1 65.2 43.4 98.9 c 3.4 11 5.5 23.2 8.7 33.9 M 701 343.8 c -24.4 40.9 -54.8 105.9 -66 151.9 c 23.5 0.6 47.8 0.4 71.4 0.4 c 11.1 0 57.5 1.8 63.4 -3.3 c 0.9 -5.6 -10.4 -39.4 -12.8 -45.1 c -6.3 -14.8 -46.2 -99.5 -56 -103.9 m -84.6 236.7 c -9 23.3 -11.5 131.3 3.2 150 c 10.5 3.3 150 2.1 168.1 1.2 c 8.5 -8.7 7.8 -77.4 7.9 -92.9 c 0.1 -18.5 -4.3 -41.3 -3.8 -58.6 c -58.4 0.7 -117.1 -0.4 -175.4 0.3 m 279.3 141.9 c 3.7 -6 11.4 -18.6 12.3 -25 c 5.1 -34.3 -0.2 -83.8 -2.9 -118.3 c -8.8 1.6 -20.4 1.3 -29.5 1.4 c 7.2 38.6 4.6 75.2 4.6 114.2 c 0 10.8 -8.3 30.3 1.2 37.4 c 7.3 1 10.4 -4.3 14.3 -9.6 m -401.7 0.3 c 13.6 11.3 16.2 9.7 34.1 9.5 c -0.4 -35.3 -4.7 -64.2 -4.4 -100.8 c -14 5.5 -30.2 21.4 -36.3 35.2 c -7.8 17.6 -2 39.9 6.6 56.1"/>
            <path d="M 851.6 227.9 c -2.6 -13.9 -4.7 -27 -6.7 -40.9 c -2.8 -20.2 16 -25.7 32.6 -28.1 c 59.1 -8.3 118.3 -21.8 177.7 -27 c 19.1 -1.7 26 18.8 28.6 34.2 a 7001 7001 0 0 1 45.7 321.1 c 1.7 15.2 6.1 38 7.2 51.5 c -1.6 10.7 0.5 27.8 1.3 39 c 0.9 12.6 1.6 25.3 2 37.9 c 1 23.4 2 50.4 0.4 73.5 c -5.1 73.9 -35.5 140.3 -94.6 186 c -71.7 55.4 -166.5 74.7 -255.2 61.8 c -12.9 -1.9 -19.7 -1.9 -28.6 -11.7 c -13.1 -14.4 0.5 -55 -5.7 -64.4 c 4.5 -16 4.6 -31.7 6 -48.3 c 2.7 -5.3 2.2 -14.7 8.2 -21.7 c 9.2 -10.8 27.9 -11.6 41.8 -14.6 a 185 185 0 0 0 22 -6.4 c 15.1 -5.5 61.7 -30.5 61.5 -47.6 c 3.7 -6 11.4 -18.6 12.3 -25 c 5.1 -34.3 -0.2 -83.8 -2.9 -118.3 c -0.7 -15.5 -3.7 -34 -5.2 -49.7 c -0.7 -7 -2.9 -28.9 -4.6 -34.7 c -1.9 -6 -2 -13.9 -3.1 -19.7 c -3 -16.2 -6.6 -64.7 -11.7 -77.3 c 1.2 -9.9 -25.3 -161.1 -29 -169.5"/>
            <path d="M 469.2 462.3 c 27.1 -5.6 65.9 -15.9 80.4 14.9 c -0.1 0.4 -0.1 0.7 -0.2 1.1 c -1.3 11.4 46.1 99.5 45.3 119.2 c -0.2 4 -2.2 7.3 -5.2 9.9 c -10.5 9.4 -61.4 14 -65.9 23.5 l 0.1 0.3 c -14 5.5 -30.2 21.4 -36.3 35.2 c -7.8 17.6 -2 39.9 6.6 56.1 c 5.1 21.9 67.2 82.8 85.2 105.3 c 51.3 64.3 71.9 138.5 30.8 213.8 c -4.1 7.7 -8 13.6 -12.8 20.7 c -2.7 4 -18.2 21.9 -18.8 23.9 c -9.8 17 -70.3 56.7 -90.6 66.4 c -44.4 21.2 -103.9 44.9 -154 45.9 c -2.6 0.1 -9.4 -2.2 -12 -3 c -12.9 -15.7 -20.8 -43.6 -28.8 -62.7 c -9.3 -21.8 -18.2 -44.5 -26.1 -66.8 c -1.3 -3.6 -3.1 -12.3 -1.8 -16.4 c 4.1 -7.7 30.2 -11.5 38.6 -13.9 a 138 138 0 0 0 18.1 -6.6 c 28.7 -12.8 48.9 -32 61.3 -60.8 c -8.6 -13.5 -21.5 -23.2 -30.8 -35.3 c -10.7 -14 -25 -34 -33.5 -48.6 c -7.5 -12.9 -36.7 -66.2 -35.4 -79.4 c -1.6 -6.4 -12.8 -21.4 -16.8 -28 c -35.5 -60.4 -42.9 -125 -4.8 -187.5 c 9.6 -11.9 19.2 -24.5 29.8 -35.3 c 34.2 -34.5 79.5 -61.1 125.1 -77 a 413 413 0 0 1 32.6 -9.6 c 6.3 -1.6 13.8 -2.7 19.7 -5.1"/>
            <path d="M 283.6 804.8 c 2.2 1.2 27 28.6 33.4 36.8 c 25.9 32.9 80.5 78.4 66.8 125.7 l -0.5 0.8 c -8.6 -13.5 -21.5 -23.2 -30.8 -35.3 c -10.7 -14 -25 -34 -33.5 -48.6 c -7.5 -12.9 -36.7 -66.2 -35.4 -79.4"/>
          </g>
        </svg>
        <h1>Scramjet</h1>
        <form id="home-form" autocomplete="off">
          <input id="home-search" type="text" placeholder="Search or enter URL" autofocus />
        </form>
      </div>
    </div>

    <div id="frame-container">
      <iframe id="proxy-frame" title="Scramjet Browser"></iframe>
    </div>

    <script src="/scramjet/scramjet.js"></script>
    <script src="/controller/controller.api.js"></script>
    <script src="/epoxy/index.js"></script>

    <script>
      "use strict";

      function loadSettings() {
        const defaults = { theme: "system" };
        try {
          const saved = JSON.parse(localStorage.getItem("proxy-settings"));
          return Object.assign(defaults, saved);
        } catch (e) {
          return defaults;
        }
      }

      function saveSettings(settings) {
        try {
          localStorage.setItem("proxy-settings", JSON.stringify(settings));
        } catch (e) {
          console.error("Could not save settings to localStorage:", e);
        }
      }

      function applyTheme(theme) {
        let resolved = theme;
        if (theme === "system") {
          resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        document.documentElement.setAttribute("data-theme", resolved);
        updateFavicon();
        const frame = document.getElementById("proxy-frame");
        if (frame) {
          try {
            frame.contentDocument.documentElement.setAttribute("data-theme", resolved);
          } catch (e) {}
        }
      }

      let settings = loadSettings();
      let settingsOpen = false;
      let scramjet = null;
      let frame = null;
      let urlMonitorInterval = null;
      let navbarUrlFocused = false;

      const iframe = document.getElementById("proxy-frame");
      const navbarUrl = document.getElementById("navbar-url");
      const navbarForm = document.getElementById("navbar-form");
      const homeForm = document.getElementById("home-form");
      const homeSearch = document.getElementById("home-search");
      const homeContent = document.getElementById("home-content");
      const frameContainer = document.getElementById("frame-container");
      const navbar = document.getElementById("navbar");
      const settingsPanel = document.getElementById("settings-panel");
      const themeSelect = document.getElementById("theme-select");
      const saveBtn = document.getElementById("settings-save");

      const logoSvg = document.querySelector(".home-logo");
      function updateFavicon() {
        if (!logoSvg) return;
        const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#e0e0e0";
        const svgString = new XMLSerializer().serializeToString(logoSvg).replace(/currentColor/g, textColor);
        const faviconUrl = "data:image/svg+xml," + encodeURIComponent(svgString);
        let favicon = document.querySelector("link[rel='icon']");
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          document.head.appendChild(favicon);
        }
        favicon.type = "image/svg+xml";
        favicon.href = faviconUrl;
      }

      applyTheme(settings.theme);

      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (settings.theme === "system") applyTheme("system");
      });

      function norm(u) {
        u = u.trim();
        const isUrl = /^https?:\\/\\//i.test(u) || (/\\.[a-z]{2,}$/i.test(u) && !/\\s/.test(u));
        if (isUrl) {
          return u.startsWith("http") ? u : "https://" + u;
        }
        return "https://duckduckgo.com/?q=" + encodeURIComponent(u);
      }

      async function init() {
        try {
          // Wait for the service worker to be active, with a timeout to prevent hanging forever
          const swReady = navigator.serviceWorker.ready;
          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Service worker failed to become ready after 5 seconds")), 5000)
          );
          await Promise.race([swReady, timeout]);

          // Wait for window load just in case
          if (document.readyState !== 'complete') {
            await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
          }

          // Dynamically import wispConfig to avoid race conditions with deferred module scripts
          if (!window.wispConfig) {
            try {
              const wispModule = await import('/wisp/wisp-routes.js');
              window.wispConfig = wispModule.wispConfig;
            } catch (e) {
              console.warn("Could not dynamically import wisp-routes.js", e);
            }
          }

          const serviceworker =
            navigator.serviceWorker.controller ??
            (await navigator.serviceWorker.ready).active;

          // Safety checks to ensure scripts loaded properly
          if (!window.$scramjetController || !window.$scramjetController.Controller) {
            throw new Error("window.$scramjetController is missing. Ensure the controller.api.js file is correctly served and contains the real code.");
          }
          if (!window.$scramjet || !window.$scramjet.defaultConfig) {
            throw new Error("window.$scramjet is missing. Ensure the scramjet.js file is correctly served and contains the real code.");
          }

          const { Controller } = window.$scramjetController;
          const { defaultConfig } = window.$scramjet;
          
          let EpoxyTransportClass = null;
          if (typeof self.EpoxyTransport !== 'undefined') {
            EpoxyTransportClass = self.EpoxyTransport.default || self.EpoxyTransport;
          } else {
            throw new Error("self.EpoxyTransport is missing. Ensure the epoxy/index.js file is correctly served and contains the real code.");
          }

          const wispConfig = window.wispConfig;
          if (!wispConfig) {
            throw new Error("window.wispConfig is missing. Ensure the wisp-routes.js file is correctly served.");
          }

          const sortedRoutes = [...wispConfig.wss_routes].sort((a, b) => a.priority - b.priority);
          let transport = null;

          for (const route of sortedRoutes) {
            try {
              if (!EpoxyTransportClass) {
                throw new Error("EpoxyTransport script failed to load");
              }

              console.log(\`[Wisp] Trying \${route.name} (\${route.route})\`);
              
              const isAlive = await new Promise((resolve) => {
                const ws = new WebSocket(route.route);
                const timeout = setTimeout(() => {
                  ws.close();
                  resolve(false);
                }, 1500);

                ws.onopen = () => {
                  clearTimeout(timeout);
                  ws.close();
                  resolve(true);
                };
                ws.onerror = () => {
                  clearTimeout(timeout);
                  resolve(false);
                };
              });

              if (!isAlive) {
                throw new Error("No Wisp server detected");
              }

              transport = new EpoxyTransportClass({ wisp: route.route });
              await transport.init();
              console.log(\`[Wisp] Connected to \${route.name}\`);
              break;
            } catch (e) {
              console.warn(\`[Wisp] \${route.name} failed:\`, e.message);
              transport = null;
            }
          }

          if (!transport) {
            throw new Error('All wisp servers failed');
          }

          scramjet = new Controller({
            serviceworker,
            transport,
            scramjetConfig: defaultConfig
          });

          await scramjet.wait();
          frame = scramjet.createFrame(iframe);
          console.log("Scramjet frame initialized successfully.");
        } catch (e) {
          console.error("Failed to initialize Scramjet:", e);
        }
      }

      function go(input) {
        if (!frame) {
          console.warn("Scramjet frame not initialized yet.");
          return;
        }
        const url = norm(input);
        navbarUrl.value = url;

        homeContent.style.display = "none";
        frameContainer.style.display = "block";
        settingsPanel.style.display = "none";
        settingsOpen = false;

        frame.go(url);
        monitorIframeNavigation();
      }

      function monitorIframeNavigation() {
        if (urlMonitorInterval) {
          clearInterval(urlMonitorInterval);
          urlMonitorInterval = null;
        }

        urlMonitorInterval = setInterval(() => {
          if (!frame || !iframe.contentWindow) {
            clearInterval(urlMonitorInterval);
            return;
          }
          if (document.fullscreenElement || document.webkitFullscreenElement) return;
          if (navbarUrlFocused || document.activeElement === navbarUrl) return;

          try {
            const iframeUrl = iframe.contentWindow.location.href;
            if (iframeUrl && !iframeUrl.startsWith("about:blank")) {
              const decodedUrl = frame.decodeUrl ? frame.decodeUrl(iframeUrl) : iframeUrl;
              if (decodedUrl && decodedUrl !== navbarUrl.value && decodedUrl !== "about:blank") {
                navbarUrl.value = decodedUrl;
              }
            }
          } catch (e) {}
        }, 500);
      }

      navbarUrl.addEventListener("focus", () => (navbarUrlFocused = true));
      navbarUrl.addEventListener("blur", () => (navbarUrlFocused = false));

      homeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = homeSearch.value.trim();
        if (val) go(val);
      });

      navbarForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = navbarUrl.value.trim();
        if (val) go(val);
      });

      document.getElementById("btn-back").addEventListener("click", () => {
        if (iframe.contentWindow) {
          try { iframe.contentWindow.history.back(); } catch (e) {}
        }
      });

      document.getElementById("btn-forward").addEventListener("click", () => {
        if (iframe.contentWindow) {
          try { iframe.contentWindow.history.forward(); } catch (e) {}
        }
      });

      document.getElementById("btn-reload").addEventListener("click", () => {
        if (iframe.contentWindow) {
          try { iframe.contentWindow.location.reload(); } catch (e) {}
        }
      });

      document.getElementById("btn-home").addEventListener("click", () => {
        if (urlMonitorInterval) {
          clearInterval(urlMonitorInterval);
          urlMonitorInterval = null;
        }
        frameContainer.style.display = "none";
        settingsPanel.style.display = "none";
        settingsOpen = false;
        homeContent.style.display = "flex";
        navbarUrl.value = "";
        homeSearch.value = "";
        homeSearch.focus();
      });

      document.getElementById("btn-settings").addEventListener("click", () => {
        settingsOpen = !settingsOpen;
        settingsPanel.style.display = settingsOpen ? "block" : "none";
        if (settingsOpen) {
          themeSelect.value = settings.theme;
        }
      });

      saveBtn.addEventListener("click", () => {
        settings.theme = themeSelect.value;
        saveSettings(settings);
        applyTheme(settings.theme);
        settingsPanel.style.display = "none";
        settingsOpen = false;
      });

      document.getElementById("btn-fullscreen").addEventListener("click", () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          const elem = document.documentElement;
          if (elem.requestFullscreen) elem.requestFullscreen();
          else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
          else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else if (document.msExitFullscreen) document.msExitFullscreen();
        }
      });

      function handleFullscreenChange() {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          navbar.style.display = "none";
          frameContainer.style.height = "100vh";
        } else {
          navbar.style.display = "flex";
          frameContainer.style.height = "calc(100vh - 48px)";
        }
      }

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js")
          .then(init)
          .catch((err) => console.error("Service Worker registration failed:", err));
      } else {
        console.error("Service workers not supported in this browser.");
      }
    </script>
  </body>
</html>`;

/**
 * Static asset stubs.
 *
 * NOTE: In production these should be replaced with the actual contents of each
 * file (or served from Cloudflare R2/KV/Pages). They are stubbed here so the
 * worker boots cleanly without 500s on missing routes. Replace the bodies with
 * real file contents (or fetch from a binding like env.ASSETS) as needed.
 */
const ASSETS = {
  "/manifest.json": {
    body: JSON.stringify({
      name: "Scramjet",
      short_name: "Scramjet",
      start_url: "/",
      display: "standalone",
      background_color: "#121212",
      theme_color: "#121212"
    }, null, 2),
    contentType: "application/manifest+json"
  },
  "/sw.js": {
    body: "// Service worker placeholder — replace with the real scramjet service worker bundle.",
    contentType: "application/javascript"
  },
  "/scramjet/scramjet.js": {
    body: "// Replace with the real scramjet.js bundle. Exposes window.$scramjet.defaultConfig.",
    contentType: "application/javascript"
  },
  "/controller/controller.api.js": {
    body: "// Replace with the real controller bundle. Exposes window.$scramjetController.Controller.",
    contentType: "application/javascript"
  },
  "/epoxy/index.js": {
    body: epoxyScript,
    contentType: "application/javascript"
  },
  "/wisp/wisp-routes.js": {
    body: [
      "// Wisp route configuration.",
      "// Replace with your real Wisp endpoints, ordered by priority.",
      "export const wispConfig = {",
      "  wss_routes: [",
      "    { name: 'primary',  route: 'wss://your-worker.example.com/wisp/', priority: 1 },",
      "    { name: 'fallback', route: 'wss://fallback.example.com/wisp/',   priority: 2 }",
      "  ]",
      "};"
    ].join("\n"),
    contentType: "application/javascript"
  }
};

/**
 * Map a request path to a static asset (if any).
 */
function matchAsset(pathname) {
  if (ASSETS[pathname]) return ASSETS[pathname];
  return null;
}

/**
 * Main fetch handler.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // --- CORS headers (helpful when worker is hit cross-origin) ---
    const baseHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: baseHeaders });
    }

    // --- Serve homepage ---
    if (pathname === "/" || pathname === "/index.html") {
      return new Response(HTML_CONTENT, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
          ...baseHeaders
        }
      });
    }

    // --- Serve static assets ---
    const asset = matchAsset(pathname);
    if (asset) {
      return new Response(asset.body, {
        status: 200,
        headers: {
          "Content-Type": asset.contentType,
          "Cache-Control": "public, max-age=300",
          ...baseHeaders
        }
      });
    }

    // --- 404 ---
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...baseHeaders
      }
    });
  }
};
