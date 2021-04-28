export default class Worker {
  public onerror?: EventListener;
  public onmessage?: EventListener;
  public onmessageerror?: EventListener;

  public postMessage() {
    // Intentionally left blank
  }

  public terminate() {
    // Intentionally left blank
  }
}
