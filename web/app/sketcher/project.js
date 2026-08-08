
export const SKETCHER_STORAGE_PREFIX = "TCAD.projects.";
export const AUTOSAVE_KEY = "TCAD.autosave";
export const AUTOSAVE_DEBOUNCE_MS = 1000; // Save at most once per second

export class Project {

  constructor(viewer) {
    this.viewer = viewer;
    this.autosaveTimeout = null;
    this.setupAutosave();
  }

  setupAutosave() {
    // Subscribe to object updates to trigger auto-save
    this.viewer.streams.objectUpdate.attach(() => {
      this.scheduleAutosave();
    });
  }

  scheduleAutosave() {
    // Clear any pending autosave
    if (this.autosaveTimeout) {
      clearTimeout(this.autosaveTimeout);
    }
    
    // Schedule a new autosave with debouncing
    this.autosaveTimeout = setTimeout(() => {
      this.autosave();
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  autosave() {
    try {
      const sketchData = this.viewer.io.serializeSketch();
      localStorage.setItem(AUTOSAVE_KEY, sketchData);
      console.log('Autosaved sketch');
    } catch (e) {
      console.error('Autosave failed:', e);
    }
  }

  loadAutosave() {
    const autosaveData = localStorage.getItem(AUTOSAVE_KEY);
    if (autosaveData) {
      try {
        this.viewer.historyManager.init(autosaveData);
        this.viewer.io.loadSketch(autosaveData);
        this.viewer.repaint();
        console.log('Loaded autosaved sketch');
        return true;
      } catch (e) {
        console.error('Failed to load autosave:', e);
        return false;
      }
    }
    return false;
  }

  clearAutosave() {
    localStorage.removeItem(AUTOSAVE_KEY);
    if (this.autosaveTimeout) {
      clearTimeout(this.autosaveTimeout);
      this.autosaveTimeout = null;
    }
  }

  cloneSketch() {
    const name = prompt("Name for sketch clone");
    if (name != null) {
      if (this.isSketchExists(name)) {
        alert("Sorry, a sketch with the name '" + name + "' already exists. Won't override it.");
        return;
      }
      localStorage.setItem(SKETCHER_STORAGE_PREFIX + name, this.viewer.io.serializeSketch());
      this.openSketch(name);
    }
  }

  isSketchExists(name) {
    return localStorage.getItem(SKETCHER_STORAGE_PREFIX + name) != null;
  }

  openSketch(name) {
    let uri = window.location.href.split("#")[0];
    if (name !== "untitled") {
      uri += "#" + name;
    }
    const win = window.open(uri, '_blank');
    win.focus();
  }

  newSketch() {
    const name = prompt("Name for sketch");
    if (name != null) {
      if (this.isSketchExists(name)) {
        alert("Sorry, a sketch with the name '" + name + "' already exists. Won't override it.");
        return;
      }
      this.openSketch(name);
    }
  }

  loadFromLocalStorage() {
    const sketchId = this.getSketchId();
    const sketchData = localStorage.getItem(sketchId);
    
    // First try to load autosave if no named sketch exists
    if (!sketchData && sketchId === SKETCHER_STORAGE_PREFIX + "untitled") {
      if (this.loadAutosave()) {
        return;
      }
    }
    
    // Otherwise load the named sketch
    if (sketchData != null) {
      this.viewer.historyManager.init(sketchData);
      this.viewer.io.loadSketch(sketchData);
    }
    this.viewer.repaint();
  }

  getSketchId() {
    let id = window.location.hash.substring(1);
    if (!id) {
      id = "untitled";
    }
    return SKETCHER_STORAGE_PREFIX + id;
  }

}

