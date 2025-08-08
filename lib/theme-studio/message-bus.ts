type MessageHandler = (data: any) => void;
type UnsubscribeFn = () => void;

interface ThemeStudioMessage {
  type: string;
  payload?: any;
  timestamp?: number;
  source?: string;
}

/**
 * Centralized message bus for Theme Studio communication
 * Handles all postMessage communication between preview iframe and editor
 */
export class ThemeStudioMessageBus {
  private static handlers = new Map<string, Set<MessageHandler>>();
  private static isListening = false;
  private static messageQueue: ThemeStudioMessage[] = [];
  private static isIframeReady = false;

  /**
   * Message types enum for type safety
   */
  static MessageTypes = {
    // Realtime updates
    SECTION_UPDATE: 'SECTION_UPDATE',
    SECTION_ADD: 'SECTION_ADD',
    SECTION_DELETE: 'SECTION_DELETE',
    SECTIONS_REORDER: 'SECTIONS_REORDER',
    BLOCK_UPDATE: 'BLOCK_UPDATE',
    BLOCK_ADD: 'BLOCK_ADD',
    BLOCK_DELETE: 'BLOCK_DELETE',
    BLOCK_REORDER: 'BLOCK_REORDER',
    
    // Theme settings
    THEME_SETTINGS_UPDATE: 'THEME_SETTINGS_UPDATE',
    
    // UI state
    SELECTOR_MODE: 'THEME_STUDIO_SELECTOR_MODE',
    SCROLL_TO_SECTION: 'THEME_STUDIO_SCROLL_TO_SECTION',
    GET_SCROLL_POSITION: 'THEME_STUDIO_GET_SCROLL_POSITION',
    RESTORE_SCROLL_POSITION: 'THEME_STUDIO_RESTORE_SCROLL_POSITION',
    
    // Preview state
    PREVIEW_READY: 'THEME_STUDIO_PREVIEW_READY',
    SECTION_SELECTED: 'SECTION_SELECTED',
    BLOCK_SELECTED: 'BLOCK_SELECTED',
    
    // Scroll feedback
    SCROLL_POSITION: 'THEME_STUDIO_SCROLL_POSITION',
  } as const;

  /**
   * Initialize the message bus
   */
  static init() {
    if (!this.isListening && typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage);
      this.isListening = true;
    }
  }

  /**
   * Clean up event listeners
   */
  static cleanup() {
    if (this.isListening && typeof window !== 'undefined') {
      window.removeEventListener('message', this.handleMessage);
      this.isListening = false;
      this.handlers.clear();
      this.messageQueue = [];
      this.isIframeReady = false;
    }
  }

  /**
   * Handle incoming messages
   */
  private static handleMessage = (event: MessageEvent) => {
    // Security check - only handle messages from same origin
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, ...data } = event.data;
    
    // Handle preview ready message
    if (type === this.MessageTypes.PREVIEW_READY) {
      this.isIframeReady = true;
      this.flushMessageQueue();
    }

    // Dispatch to registered handlers
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for ${type}:`, error);
        }
      });
    }
  };

  /**
   * Send a message to the preview iframe
   */
  static send(type: string, payload?: any, targetWindow?: Window | null) {
    const message: ThemeStudioMessage = {
      type,
      payload,
      timestamp: Date.now(),
      source: 'theme-studio'
    };

    // If target window is not provided, try to find the preview iframe
    if (!targetWindow) {
      const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-preview-frame]');
      targetWindow = iframe?.contentWindow;
    }

    if (!targetWindow) {
      console.warn('No target window available for message:', type);
      return;
    }

    // Queue message if iframe is not ready
    if (!this.isIframeReady && type !== this.MessageTypes.PREVIEW_READY) {
      this.messageQueue.push(message);
      return;
    }

    try {
      targetWindow.postMessage({
        type: 'THEME_STUDIO_REALTIME',
        update: {
          type,
          ...payload
        }
      }, '*');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  /**
   * Send a batch of messages
   */
  static sendBatch(messages: Array<{ type: string; payload?: any }>, targetWindow?: Window | null) {
    messages.forEach(({ type, payload }) => {
      this.send(type, payload, targetWindow);
    });
  }

  /**
   * Listen for a specific message type
   */
  static on(type: string, handler: MessageHandler): UnsubscribeFn {
    if (!this.isListening) {
      this.init();
    }

    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  /**
   * Listen for a message type once
   */
  static once(type: string, handler: MessageHandler): UnsubscribeFn {
    const unsubscribe = this.on(type, (data) => {
      handler(data);
      unsubscribe();
    });

    return unsubscribe;
  }

  /**
   * Remove all handlers for a specific message type
   */
  static off(type: string) {
    this.handlers.delete(type);
  }

  /**
   * Flush queued messages when iframe becomes ready
   */
  private static flushMessageQueue() {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-preview-frame]');
    const targetWindow = iframe?.contentWindow;

    if (!targetWindow) {
      console.warn('Cannot flush message queue: no target window');
      return;
    }

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    messages.forEach(message => {
      try {
        targetWindow.postMessage({
          type: 'THEME_STUDIO_REALTIME',
          update: {
            type: message.type,
            ...message.payload
          }
        }, '*');
      } catch (error) {
        console.error('Failed to send queued message:', error);
      }
    });
  }

  /**
   * Utility method to send section update
   */
  static sendSectionUpdate(sectionId: string, updates: any) {
    this.send(this.MessageTypes.SECTION_UPDATE, {
      sectionId,
      ...updates
    });
  }

  /**
   * Utility method to send block update
   */
  static sendBlockUpdate(sectionId: string, blockId: string, block: any) {
    this.send(this.MessageTypes.BLOCK_UPDATE, {
      sectionId,
      blockId,
      block
    });
  }

  /**
   * Utility method to send theme settings update
   */
  static sendThemeSettingsUpdate(settings: Record<string, any>, cssVariables: string) {
    this.send(this.MessageTypes.THEME_SETTINGS_UPDATE, {
      settings,
      cssVariables
    });
  }

  /**
   * Request scroll to a specific section
   */
  static scrollToSection(sectionId: string) {
    this.send(this.MessageTypes.SCROLL_TO_SECTION, { sectionId });
  }

  /**
   * Toggle selector mode
   */
  static toggleSelectorMode(enabled: boolean) {
    this.send(this.MessageTypes.SELECTOR_MODE, { enabled });
  }

  /**
   * Get current iframe ready state
   */
  static get isReady() {
    return this.isIframeReady;
  }

  /**
   * Wait for iframe to be ready
   */
  static waitForReady(): Promise<void> {
    if (this.isIframeReady) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const unsubscribe = this.once(this.MessageTypes.PREVIEW_READY, () => {
        resolve();
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        unsubscribe();
        resolve();
      }, 10000);
    });
  }
}