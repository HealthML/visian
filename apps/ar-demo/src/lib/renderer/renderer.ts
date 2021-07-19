import * as THREE from "three";

import { IDisposable } from "..";
import * as SCAN from "../staticScan";
import {
  defaultStructureColor,
  hoveredSelectedStructureColor,
  hoveredStructureColor,
  selectedStructureColor,
} from "../theme";
import { ClickPosition, Pixel, Tool } from "../types";
import { getIntersectionsFromClickPosition } from "../utils";
import {
  createCameraLight,
  createLights,
  createScanContainer,
  createScanOffsetGroup,
} from "./creators";
import {
  Annotation,
  CameraNavigator,
  KeyEventHandler,
  Reticle,
  ScanNavigator,
  SpriteHandler,
} from "./helpers";

export default class Renderer implements IDisposable {
  private keyEventHandler!: KeyEventHandler;

  private renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene = new THREE.Scene();

  private scanContainer: THREE.Group;
  public scanOffsetGroup: THREE.Group;

  private pickingScene = new THREE.Scene();
  private pickingTexture = new THREE.WebGLRenderTarget(1, 1);

  public cameraNavigator!: CameraNavigator;
  public scanNavigator!: ScanNavigator;
  public spriteHandler!: SpriteHandler;
  public annotation!: Annotation;
  private reticle: Reticle;

  private renderDirty = true;
  public arActive = false;
  private lastTimestamp = 0;

  private hoveredStructureIndex?: number;
  private structureSelection: number[] = [];

  public activeTool = Tool.Selection;

  private lastMouseEvent?: MouseEvent;

  private activeXRSession?: THREE.XRSession;
  private canvasContainer: HTMLDivElement;
  private domOverlay: HTMLElement;

  private oldCameraPosition?: THREE.Vector3;
  private oldCameraRotation?: THREE.Euler;

  private scanAnimation = false;
  private scanBaseRotation = Math.PI;
  private acceptARSelect = true;

  constructor(private canvas: HTMLCanvasElement, public updateUI: () => void) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.domOverlay = document.getElementById("ar-overlay")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.canvasContainer = canvas.parentElement! as HTMLDivElement;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.xr.enabled = true;

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.0001,
      6,
    );

    document.addEventListener("pointerup", this.handleClick);
    document.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("resize", this.resize);
    this.resize();

    const [lights, lightTargets] = createLights(SCAN.voxelCount);
    this.scene.add(...lights, ...lightTargets);
    const cameraLight = createCameraLight(this.camera);
    this.scene.add(cameraLight, cameraLight.target);

    this.scanContainer = createScanContainer();

    this.scanOffsetGroup = createScanOffsetGroup(SCAN.scanSize);
    this.scanContainer.add(this.scanOffsetGroup);
    this.scanOffsetGroup.updateMatrixWorld();

    this.spriteHandler = new SpriteHandler(this);
    this.scanOffsetGroup.add(this.spriteHandler.spriteGroup);

    this.cameraNavigator = new CameraNavigator(
      this,
      this.canvas,
      this.spriteHandler,
      cameraLight,
      this.canvasContainer,
    );
    this.scanNavigator = new ScanNavigator(
      this,
      this.canvas,
      this.spriteHandler,
      this.cameraNavigator,
    );

    this.camera.position.copy(
      this.scanOffsetGroup.localToWorld(
        new THREE.Vector3(
          -0.25 * SCAN.scanSize.x,
          1.25 * SCAN.scanSize.y,
          1.25 * SCAN.scanSize.z,
        ),
      ),
    );
    const target = this.scanOffsetGroup.localToWorld(
      this.spriteHandler.spriteGroup.position.clone(),
    );
    this.camera.lookAt(target);
    cameraLight.target.position.copy(target);

    this.reticle = new Reticle(this.renderer);
    this.scene.add(this.reticle);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all(SCAN.getConnectedStructureGeometries()).then((geometries) => {
      this.annotation = new Annotation(this, geometries);
      this.scanOffsetGroup.add(this.annotation.meshGroup);

      this.scene.add(this.scanContainer);
      this.scanContainer.updateMatrixWorld(true);

      const pickingScanContainer = createScanContainer();

      const pickingOffsetGroup = createScanOffsetGroup(SCAN.scanSize);
      pickingScanContainer.add(pickingOffsetGroup);

      pickingOffsetGroup.add(...this.annotation.pickingMeshes);
      this.pickingScene.add(pickingScanContainer);

      this.keyEventHandler = new KeyEventHandler(this);

      this.spriteHandler.updateRenderOrder();
      this.renderer.setAnimationLoop(this.animate);

      this.updateUI();

      // For this demo we want the meshes to be hidden at first.
      this.setMeshVisibility(false);
    });
  }

  public dispose = () => {
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("pointerup", this.handleClick);
    document.removeEventListener("mousemove", this.handleMouseMove);
    this.cameraNavigator.dispose();
    this.keyEventHandler.dispose();
  };

  private animate = (timestamp: number, frame?: THREE.XRFrame) => {
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.keyEventHandler.tick();

    if (this.arActive) {
      this.spriteHandler.updateRenderOrder();

      if (this.scanAnimation) {
        // up/down animation
        this.scanOffsetGroup.position.z = (Math.sin(timestamp / 1000) + 1) / 80;

        // rotation animation
        this.scanContainer.rotateZ(delta / 5000);
      }

      if (frame) {
        this.reticle.update(frame);
      }
    }

    if (this.renderDirty || this.arActive) this.forceRender();
  };

  public render = () => {
    this.renderDirty = true;
  };

  private forceRender = () => {
    this.renderDirty = false;

    this.updateHover();

    this.renderer.render(this.scene, this.camera);
  };

  public enterAR = () => {
    if (!("xr" in navigator)) return;

    this.oldCameraPosition = this.camera.position.clone();
    this.oldCameraRotation = this.camera.rotation.clone();

    this.domOverlay.style.display = "";

    const sessionInit = {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: this.domOverlay },
    };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (navigator as THREE.Navigator)
      .xr!.requestSession("immersive-ar", sessionInit)
      .then((session) => {
        this.arActive = true;
        this.activeXRSession = session;
        this.removeHoveredStructure();

        this.renderer.xr.setReferenceSpaceType("local");
        this.renderer.xr.setSession(session);

        this.reticle.activate();

        this.scanContainer.visible = false;

        this.updateUI();

        const controller = this.renderer.xr.getController(0);
        controller.addEventListener("select", this.onARSelect);
        this.scene.add(controller);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
  };

  public exitAR = () => {
    this.activeXRSession
      ?.end()
      .then(() => {
        if (this.domOverlay) {
          this.domOverlay.style.display = "none";
        }

        // The XR session steals the canvas, so we have to steal it back.
        this.canvasContainer.appendChild(this.canvas);
        this.activeXRSession = undefined;
        this.arActive = false;

        // The XR session hides everything else. So we have to show it again.
        document.getElementById("root")?.setAttribute("style", "");

        const controller = this.renderer.xr.getController(0);
        controller.removeEventListener("select", this.onARSelect);

        this.reticle.hide();

        if (this.oldCameraPosition) {
          this.camera.position.copy(this.oldCameraPosition);
          this.oldCameraPosition = undefined;
        }
        if (this.oldCameraRotation) {
          this.camera.rotation.copy(this.oldCameraRotation);
          this.oldCameraRotation = undefined;
        }

        this.scanContainer.visible = true;
        this.scanContainer.position.set(0, 0, 0);

        // Reset the animation state of the scan.
        this.setScanRotation(0);
        this.scanOffsetGroup.position.z = 0;

        this.scanContainer.updateMatrixWorld(true);
        this.spriteHandler.updateRenderOrder();

        this.render();

        this.updateUI();
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
  };

  private onARSelect = () => {
    if (!this.acceptARSelect) return;

    this.scanContainer.visible = true;

    if (this.reticle.active) {
      if (this.reticle.visible) {
        this.scanContainer.position.setFromMatrixPosition(this.reticle.matrix);

        this.reticle.activate(false);
      }
    } else {
      this.reticle.activate();
    }
  };

  public setScanRotation = (rotation: number) => {
    this.scanContainer.rotation.z = this.scanBaseRotation + rotation;
    this.render();
  };

  public get scanRotation() {
    return this.scanContainer.rotation.z - this.scanBaseRotation;
  }

  public toggleARSelect = () => {
    // If this is the call closing the UI the corresponding select event
    // still has to be discarded. Thus a timeout is used in that case.
    if (this.acceptARSelect) {
      this.acceptARSelect = false;
    } else {
      setTimeout(() => {
        this.acceptARSelect = true;
      }, 100);
    }
  };

  public toggleScanAnimation = () => {
    this.scanAnimation = !this.scanAnimation;
  };

  // This function is only necessary for faking the AI.
  public setMeshVisibility = (visible: boolean) => {
    this.annotation.meshGroup.visible = visible;
    this.render();
  };

  public setActiveTool = (tool: Tool) => {
    this.activeTool = tool;
  };

  private selects = (index: number) => this.structureSelection.includes(index);
  private hovers = (index: number) => this.hoveredStructureIndex === index;

  public updateColor = (index: number) => {
    // eslint-disable-next-line no-nested-ternary
    const color = this.selects(index)
      ? this.hovers(index)
        ? hoveredSelectedStructureColor
        : selectedStructureColor
      : this.hovers(index)
      ? hoveredStructureColor
      : defaultStructureColor;

    this.annotation.getMaterial(index).color = new THREE.Color(color);
  };

  private updateHover = () => {
    if (!this.lastMouseEvent || this.arActive) return;

    let pointer: Pixel;
    if (this.cameraNavigator.isPointerLocked) {
      pointer = {
        x: Math.floor(this.canvas.width / 2),
        y: Math.floor(this.canvas.height / 2),
      };
    } else {
      const canvasBox = this.canvas.getBoundingClientRect();

      const style = getComputedStyle(this.canvas);
      // eslint-disable-next-line radix
      const borderLeft = parseInt(style.borderLeftWidth);
      // eslint-disable-next-line radix
      const borderTop = parseInt(style.borderTopWidth);

      pointer = {
        x:
          (this.lastMouseEvent.clientX - canvasBox.left - borderLeft) *
          window.devicePixelRatio,
        y:
          (this.lastMouseEvent.clientY - canvasBox.top - borderTop) *
          window.devicePixelRatio,
      };
    }

    this.camera.setViewOffset(
      this.canvas.width,
      this.canvas.height,
      pointer.x,
      pointer.y,
      1,
      1,
    );

    this.renderer.setRenderTarget(this.pickingTexture);
    this.renderer.render(this.pickingScene, this.camera);

    this.camera.clearViewOffset();

    const pixelBuffer = new Uint8Array(4);
    this.renderer.readRenderTargetPixels(
      this.pickingTexture,
      0,
      0,
      1,
      1,
      pixelBuffer,
    );

    this.renderer.setRenderTarget(null);

    const pickedIndex =
      ((pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2]) - 1;

    if (pickedIndex < 0) {
      this.removeHoveredStructure();
    } else if (this.hoveredStructureIndex !== pickedIndex) {
      this.removeHoveredStructure();
      this.hoverIndex(pickedIndex);
    }
  };

  private removeHoveredStructure = () => {
    if (this.hoveredStructureIndex === undefined) return;
    const oldHover = this.hoveredStructureIndex;
    this.hoveredStructureIndex = undefined;
    this.updateColor(oldHover);
  };

  private hoverIndex = (index: number) => {
    this.hoveredStructureIndex = index;
    this.updateColor(index);
  };

  private select = (index: number) => {
    if (this.selects(index)) {
      const selectionIndex = this.structureSelection.indexOf(index);
      this.structureSelection.splice(selectionIndex, 1);
    } else {
      this.structureSelection.push(index);
    }
    this.updateColor(index);
  };

  public deleteSelection = () => {
    this.annotation.deleteStructures(this.structureSelection);
    this.structureSelection = [];

    this.render();
  };

  public invertSelection = () => {
    for (let index = 0; index < this.annotation.structureCount; index++) {
      this.select(index);
    }

    this.render();
  };

  public clearSelection = () => {
    const oldSelection: number[] = [];
    this.structureSelection.forEach((index) => oldSelection.push(index));

    oldSelection.forEach((index) => {
      this.select(index);
    });

    this.render();
  };

  private resize = () => {
    if (this.arActive) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.forceRender();
  };

  private handleClick = (event: ClickPosition) => {
    if (this.arActive || !this.annotation.meshGroup.visible) return;

    const intersections = getIntersectionsFromClickPosition(
      event,
      this.annotation.structures,
      this.canvas,
      this.camera,
      this.cameraNavigator.isPointerLocked,
    );

    const intersection = intersections.find((i) => i.object.visible);
    if (intersection) {
      const clickedObject = intersection.object;
      const { index } = clickedObject.userData;

      switch (this.activeTool) {
        case Tool.Eraser:
          this.annotation.deleteStructures([index]);
          if (this.selects(index)) this.select(index);
          break;
        case Tool.Selection:
          this.select(index);
          break;
        default:
          break;
      }

      this.render();
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    this.lastMouseEvent = event;
    this.render();
  };
}
