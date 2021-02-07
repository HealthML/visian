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
  createMeshes,
  createMeshGroup,
  createPickingMeshes,
  getMaterials,
} from "./creators";
import {
  AnnotationHandler,
  KeyEventHandler,
  NavigationHandler,
  ReticleHandler,
  SpriteHandler,
} from "./helpers";

export default class Renderer implements IDisposable {
  private keyEventHandler!: KeyEventHandler;

  private renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  private scene = new THREE.Scene();

  public meshGroup: THREE.Group;
  public meshAnimationGroup: THREE.Group;

  private pickingScene = new THREE.Scene();
  private pickingTexture = new THREE.WebGLRenderTarget(1, 1);
  private pickingMeshes!: THREE.Mesh[];

  public meshes!: THREE.Mesh[];
  private materials!: THREE.MeshPhongMaterial[];

  public navigator!: NavigationHandler;
  public spriteHandler!: SpriteHandler;
  private annotator!: AnnotationHandler;
  private reticleHandler: ReticleHandler;

  private renderDirty = true;
  public arActive = false;
  private lastTimestamp = 0;

  public pointerLocked = false;
  private hoveredStructureIndex?: number;
  private structureSelection: number[] = [];

  public activeTool = Tool.Selection;

  private crosshair: HTMLElement | null;

  private lastMouseEvent?: MouseEvent;

  private activeXRSession?: THREE.XRSession;
  private canvasContainer: HTMLDivElement;
  private domOverlay: HTMLElement;

  private oldCameraPosition?: THREE.Vector3;
  private oldCameraRotation?: THREE.Euler;

  constructor(private canvas: HTMLCanvasElement, private updateUI: () => void) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.domOverlay = document.getElementById("ar-overlay")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.canvasContainer = canvas.parentElement! as HTMLDivElement;

    this.crosshair = document.getElementById("crosshairPointer");

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
    canvas.addEventListener("wheel", this.handleWheel);
    canvas.addEventListener("touchstart", this.fakeClickOnTouchStart);
    window.addEventListener("resize", this.resize);
    this.resize();

    const [lights, lightTargets] = createLights(SCAN.voxelCount);
    this.scene.add(...lights, ...lightTargets);
    const cameraLight = createCameraLight(this.camera);
    this.scene.add(cameraLight, cameraLight.target);

    this.meshGroup = createMeshGroup(SCAN.scanSize);
    this.meshAnimationGroup = new THREE.Group();
    this.meshGroup.add(this.meshAnimationGroup);

    this.spriteHandler = new SpriteHandler(this);
    this.meshAnimationGroup.add(this.spriteHandler.spriteGroup);

    this.navigator = new NavigationHandler(
      this,
      this.canvas,
      this.spriteHandler,
      cameraLight,
      this.canvasContainer,
    );

    this.camera.position.copy(
      this.meshGroup.localToWorld(
        new THREE.Vector3(
          -0.25 * SCAN.scanSize.x,
          1.25 * SCAN.scanSize.y,
          1.25 * SCAN.scanSize.z,
        ),
      ),
    );
    const target = this.meshGroup.localToWorld(
      this.spriteHandler.spriteGroup.position.clone(),
    );
    this.camera.lookAt(target);
    cameraLight.target.position.copy(target);

    this.reticleHandler = new ReticleHandler(this.renderer, this.scene);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all(SCAN.getConnectedStructureGeometries()).then((geometries) => {
      this.meshes = createMeshes(geometries);
      this.materials = getMaterials(this.meshes);

      this.meshAnimationGroup.add(...this.meshes);

      this.scene.add(this.meshGroup);
      this.meshGroup.updateMatrixWorld(true);

      this.pickingMeshes = createPickingMeshes(geometries);
      const pickingGroup = createMeshGroup(SCAN.scanSize);
      pickingGroup.add(...this.pickingMeshes);
      this.pickingScene.add(pickingGroup);

      this.annotator = new AnnotationHandler(
        this,
        this.meshes,
        this.pickingMeshes,
      );

      this.keyEventHandler = new KeyEventHandler(this);

      this.spriteHandler.updateRenderOrder();
      this.renderer.setAnimationLoop(this.animate);

      this.updateUI();
    });
  }

  public dispose = () => {
    window.removeEventListener("resize", this.resize);
  };

  private animate = (timestamp: number, frame?: THREE.XRFrame) => {
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.keyEventHandler.tick();

    if (this.arActive) {
      this.spriteHandler.updateRenderOrder();

      // up/down animation
      this.meshAnimationGroup.position.z =
        (Math.sin(timestamp / 1000) + 1) / 80;

      // rotation animation
      this.meshAnimationGroup.translateX(SCAN.scanSize.x / 2);
      this.meshAnimationGroup.translateY(SCAN.scanSize.y / 2);
      this.meshAnimationGroup.rotateZ(delta / 5000);
      this.meshAnimationGroup.translateX(-SCAN.scanSize.x / 2);
      this.meshAnimationGroup.translateY(-SCAN.scanSize.y / 2);

      if (frame) {
        this.reticleHandler.update(frame);
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

        this.reticleHandler.activate();

        this.meshGroup.visible = false;

        this.updateUI();

        const controller = this.renderer.xr.getController(0);
        controller.addEventListener("select", this.onARSelect);
        this.scene.add(controller);
      })
      .catch((e) => {
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

        this.reticleHandler.hide();

        if (this.oldCameraPosition) {
          this.camera.position.copy(this.oldCameraPosition);
          this.oldCameraPosition = undefined;
        }
        if (this.oldCameraRotation) {
          this.camera.rotation.copy(this.oldCameraRotation);
          this.oldCameraRotation = undefined;
        }

        this.meshGroup.visible = true;

        // Reset the animation state of the scan.
        this.meshGroup.position.set(0, 0, 0);
        this.meshGroup.translateX(-SCAN.scanSize.x / 2);
        this.meshGroup.translateY(-SCAN.scanSize.y / 2);
        this.meshGroup.translateZ(-SCAN.scanSize.z / 2);

        this.meshAnimationGroup.position.set(0, 0, 0);
        this.meshAnimationGroup.rotation.set(0, 0, 0);

        this.meshGroup.updateMatrixWorld(true);
        this.spriteHandler.updateRenderOrder();

        this.render();

        this.updateUI();
      })
      .catch((e) => {
        console.error(e);
      });
  };

  private onARSelect = () => {
    this.meshGroup.visible = true;

    if (this.reticleHandler.active) {
      if (this.reticleHandler.reticleActive) {
        this.meshGroup.position.setFromMatrixPosition(
          this.reticleHandler.reticleMatrix,
        );
        this.meshGroup.translateX(-SCAN.scanSize.x / 2);
        this.meshGroup.translateY(-SCAN.scanSize.y / 2);

        this.reticleHandler.activate(false);
      }
    } else {
      this.reticleHandler.activate();
    }
  };

  public togglePointerLock = () => {
    this.pointerLocked = !this.pointerLocked;
    if (this.pointerLocked) {
      if (this.crosshair) this.crosshair.style.display = "flex";
      this.canvas.removeEventListener("wheel", this.handleWheel);
      document.addEventListener("wheel", this.handleWheel);
    } else {
      if (this.crosshair) this.crosshair.style.display = "none";
      document.removeEventListener("wheel", this.handleWheel);
      this.canvas.addEventListener("wheel", this.handleWheel);
    }
  };

  public setActiveTool = (tool: Tool) => {
    this.activeTool = tool;
  };

  public undo = () => {
    this.annotator.undo();
  };

  public redo = () => {
    this.annotator.redo();
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

    this.materials[index].color = new THREE.Color(color);
  };

  private updateHover = () => {
    if (!this.lastMouseEvent || this.arActive) return;

    let pointer: Pixel;
    if (this.pointerLocked) {
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
    this.annotator.deleteConnectedStructures(this.structureSelection);
    this.structureSelection = [];

    this.render();
  };

  public invertSelection = () => {
    for (let index = 0; index < this.meshes.length; index++) {
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

  private fakeClickOnTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      return;
    }
    const touch = event.touches[0];
    this.handleClick(touch);
  };

  private handleClick = (event: ClickPosition) => {
    if (this.arActive) return;

    const intersections = getIntersectionsFromClickPosition(
      event,
      this.meshes,
      this.canvas,
      this.camera,
      this.pointerLocked,
    );

    const intersection = intersections.find((i) => i.object.visible);
    if (intersection) {
      const clickedObject = intersection.object;
      const { index } = clickedObject.userData;

      switch (this.activeTool) {
        case Tool.Eraser:
          this.annotator.deleteConnectedStructures([index]);
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

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    if (event.deltaY > 0) {
      this.navigator.increaseSpritePosition();
    } else if (event.deltaY < 0) {
      this.navigator.decreaseSpritePosition();
    }
  };
}
