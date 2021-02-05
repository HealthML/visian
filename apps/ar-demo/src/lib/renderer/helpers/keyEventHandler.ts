import { Renderer } from "..";
import { IDisposable, Tool } from "../../types";

export default class KeyEventHandler implements IDisposable {
  private pressedKeys: { [key: string]: boolean } = {};

  private continuousCallbacks: { keys: string[]; callback: () => void }[];
  private shortcuts: { keys: string[]; callback: () => void }[];

  constructor(renderer: Renderer) {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);

    this.continuousCallbacks = [
      {
        keys: ["w"],
        callback: renderer.navigator.moveForward,
      },
      {
        keys: ["a"],
        callback: renderer.navigator.moveLeft,
      },
      {
        keys: ["s"],
        callback: renderer.navigator.moveBack,
      },
      {
        keys: ["d"],
        callback: renderer.navigator.moveRight,
      },
      {
        keys: ["shift"],
        callback: () => {
          if (!this.pressedKeys.control && !this.pressedKeys.y) {
            renderer.navigator.moveDown();
          }
        },
      },
      {
        keys: [" "],
        callback: renderer.navigator.moveUp,
      },
    ];

    this.shortcuts = [
      {
        keys: ["t"],
        callback: renderer.navigator.togglePointerLock,
      },
      {
        keys: ["control", "shift", "z"],
        callback: renderer.redo,
      },
      {
        keys: ["control", "y"],
        callback: renderer.redo,
      },
      {
        keys: ["control", "z"],
        callback: renderer.undo,
      },
      {
        keys: ["i"],
        callback: () => {
          if (renderer.activeTool === Tool.Selection) {
            renderer.invertSelection();
          }
        },
      },
      {
        keys: ["c"],
        callback: () => {
          if (renderer.activeTool === Tool.Selection) {
            renderer.clearSelection();
          }
        },
      },
      {
        keys: ["backspace"],
        callback: () => {
          if (renderer.activeTool === Tool.Selection) {
            renderer.deleteSelection();
          }
        },
      },
    ];
  }

  public dispose = () => {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  };

  public tick = () => {
    this.continuousCallbacks.forEach((shortcut) => {
      if (shortcut.keys.every((key) => this.pressedKeys[key])) {
        shortcut.callback();
      }
    });
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const pressedKey = event.key.toLowerCase();
    this.pressedKeys[pressedKey] = true;

    // Execute the first shortcut that is matched and needs the pressed key
    const shortcut = this.shortcuts.find(
      (s) =>
        s.keys.includes(pressedKey) &&
        s.keys.every((key) => this.pressedKeys[key]),
    );
    shortcut?.callback();

    // Prevent scrolling when hitting space
    if (pressedKey === " ") {
      event.preventDefault();
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.pressedKeys[event.key.toLowerCase()] = false;
  };
}
