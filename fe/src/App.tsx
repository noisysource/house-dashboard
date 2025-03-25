import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { createContext, useState } from "react";
import { themeSettings } from "./theme";
import { createTheme, PaletteMode } from "@mui/material";

// Components
import Topbar from "./components/layout/Topbar";
import Sidebar from "./components/layout/Sidebar";

// Scenes
import ScenePower from "./scenes/SceneDashboard/ScenePower";
import SceneDashboard from "./scenes/SceneDashboard/SceneDashboard";
import SceneRoom from "./scenes/SceneRoom/SceneRoom";
import SceneDevices from "./scenes/SceneDevices";
import HomeConfigBuilder from "./components/HomeConfigBuilder";

// Theme context
export const ColorModeContext = createContext({
  toggleColorMode: () => { },
});

function App() {
  const [mode, setMode] = useState<PaletteMode>("dark");

  const colorMode = {
    toggleColorMode: () =>
      setMode((prev) => (prev === "light" ? "dark" : "light")),
  };

  const theme = createTheme(themeSettings(mode));

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app" style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <Sidebar />
            <main className="content" style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "auto"
            }}>
              <Topbar />
              <div style={{ flex: 1, overflow: "auto" }}>
                <Routes>
                  <Route path="/" element={<SceneDashboard />} />
                  <Route path="/power" element={<ScenePower />} />
                  <Route path="/room" element={<SceneRoom />} />
                  <Route path="/devices" element={<SceneDevices />} />
                  <Route path="/config" element={<HomeConfigBuilder />} />
                  {/* Add more routes as needed */}
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;