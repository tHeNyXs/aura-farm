
import re

with open("app/analyze/components/area-selection-client.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state for mobile sidebar
content = content.replace(
    "const [analyzingStepIndex, setAnalyzingStepIndex] = useState(0);",
    "const [analyzingStepIndex, setAnalyzingStepIndex] = useState(0);\n  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);"
)

# 2. Modify flex direction of the container to prevent weird sizing, make it full height
content = content.replace(
    "<div className=\"flex flex-col lg:flex-row flex-1 w-full relative overflow-hidden\">",
    "<div className=\"flex flex-col lg:flex-row flex-1 w-full relative overflow-hidden h-[calc(100vh-64px)] lg:h-auto\">"
)

# 3. Modify <aside>
aside_start = "<aside className=\"w-full lg:w-[380px] bg-panel border-r border-line flex flex-col shrink-0 z-20 overflow-y-auto max-h-[45vh] lg:max-h-none\">"
aside_new = """<aside className={`absolute lg:relative inset-0 lg:inset-auto lg:w-[380px] bg-panel lg:border-r border-line flex-col shrink-0 z-[2000] lg:z-20 overflow-y-auto ${isMobileSidebarOpen ? "flex" : "hidden lg:flex"}`}>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden absolute top-2 right-2 z-50 w-8 h-8 flex items-center justify-center bg-bg border border-line rounded-full text-ink-body hover:text-red-500 shadow-sm"
          >
            ?
          </button>"""
content = content.replace(aside_start, aside_new)

# 4. Make main map flex-1 and fill the height
content = content.replace(
    "<main className=\"flex-1 relative z-10 w-full min-h-[55vh] lg:min-h-0 bg-[#f7f5ef]\">",
    "<main className=\"flex-1 relative z-10 w-full h-full bg-[#f7f5ef]\">"
)

# 5. Add a button on the map to open the sidebar on mobile
toolbar_start = """          {/* -------------------------------------------
              DRAWING TOOLBAR (Top-Left on Map)
             ------------------------------------------- */}
          <div className=\"absolute top-5 left-5 z-[1000] bg-panel/95 backdrop-blur-sm border border-line rounded-lg p-1.5 flex items-center gap-1.5 shadow-md\">"""

toolbar_new = """          {/* -------------------------------------------
              MOBILE SIDEBAR TOGGLE (Top-Right on Map)
             ------------------------------------------- */}
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="absolute top-5 right-5 z-[1000] lg:hidden bg-panel/95 backdrop-blur-sm border border-line rounded-lg px-3 py-2 shadow-md text-xs font-bold text-primary flex items-center gap-1.5"
          >
            <span>?</span>
            <span>???? / ?????????????</span>
          </button>

          {/* -------------------------------------------
              DRAWING TOOLBAR (Top-Left on Map)
             ------------------------------------------- */}
          <div className="absolute top-5 left-5 z-[1000] bg-panel/95 backdrop-blur-sm border border-line rounded-lg p-1.5 flex items-center gap-1.5 shadow-md">"""
content = content.replace(toolbar_start, toolbar_new)

# 6. Adjust Action Floating Bar on mobile (make it stretch or center nicely)
action_bar_start = """          {/* -------------------------------------------
              ACTION FLOATING BAR (Bottom Right on Map)
             ------------------------------------------- */}
          <div className="absolute bottom-5 right-5 z-[1000] bg-panel/95 backdrop-blur-sm border border-line rounded-lg p-3 flex items-center gap-4 shadow-xl">"""
action_bar_new = """          {/* -------------------------------------------
              ACTION FLOATING BAR (Bottom Right on Map)
             ------------------------------------------- */}
          <div className="absolute bottom-5 left-5 right-5 md:left-auto lg:right-5 z-[1000] bg-panel/95 backdrop-blur-sm border border-line rounded-lg p-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 shadow-xl">"""
content = content.replace(action_bar_start, action_bar_new)

with open("app/analyze/components/area-selection-client.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("done")

