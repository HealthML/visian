export class Tab {
  public static fromString(value?: string | null, isMainTab?: boolean) {
    if (!value) return;
    const tab = JSON.parse(value);
    return new Tab(tab.tabId, tab.openedAt, isMainTab);
  }

  public static fromMainTab() {
    return Tab.fromString(localStorage.getItem("mainTab"), true);
  }

  constructor(
    public readonly tabId = Math.random(),
    public readonly openedAt = Date.now(),
    public isMainTab?: boolean,
  ) {}

  protected claimMainTab() {
    this.isMainTab = true;
    localStorage.setItem("mainTab", this.toString());
  }

  protected storageListener = (event: StorageEvent) => {
    switch (event.key) {
      case "mainTab": {
        if (!this.isMainTab) return;

        // Resolve concurrent conflicting write
        const previousTab = Tab.fromString(event.oldValue);
        if (!previousTab) return;

        if (this.equals(previousTab)) {
          this.claimMainTab();
        } else {
          this.isMainTab = false;
        }
        break;
      }
      case "ping": {
        if (!this.isMainTab) return;

        // Respond to ping
        const pongValue = localStorage.getItem("pong");
        const pong = pongValue ? parseInt(pongValue) : 0;
        localStorage.setItem("pong", `${pong + 1}`);
        break;
      }
      case "pong": {
        if (!this.isMainTab) this.isMainTab = false;
        break;
      }
    }
  };

  public equals(tab: Tab) {
    return this.tabId === tab.tabId && this.openedAt === tab.openedAt;
  }

  public register() {
    return new Promise<Tab>((resolve) => {
      window.addEventListener("storage", this.storageListener);

      let timer: NodeJS.Timeout | undefined;
      if (localStorage.getItem("mainTab") === null) {
        // Claim main tab if there is none already
        this.claimMainTab();
      } else {
        // Check if there still is an active main tab
        localStorage.setItem("ping", this.toString());

        timer = setTimeout(() => {
          if (this.isMainTab !== false) this.claimMainTab();
        }, 10);
      }

      setTimeout(() => {
        if (timer !== undefined) clearTimeout(timer);

        this.isMainTab = this.isMainTab || false;
        resolve(this);
      }, 20);
    });
  }

  public toJSON() {
    return { tabId: this.tabId, openedAt: this.openedAt };
  }

  public toString() {
    return JSON.stringify(this.toJSON());
  }
}
