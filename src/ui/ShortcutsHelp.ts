/**
 * ShortcutsHelp - Visual overlay showing all keyboard shortcuts
 *
 * Triggered with '?' key, displays categorized shortcuts in a modal
 */

import { keybindManager, formatKeybinds } from './KeybindConfig'
import { SESSION_KEYBINDS } from './KeyboardShortcuts'

interface ShortcutGroup {
  title: string
  shortcuts: Array<{
    keys: string
    description: string
  }>
}

export class ShortcutsHelp {
  private overlay: HTMLElement | null = null
  private visible: boolean = false

  constructor() {
    this.createOverlay()
    this.setupKeyboardHandler()
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div')
    this.overlay.id = 'shortcuts-help-overlay'
    this.overlay.className = 'shortcuts-help-overlay hidden'
    this.overlay.innerHTML = `
      <div class="shortcuts-help-modal">
        <div class="shortcuts-help-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button class="shortcuts-help-close" title="Close (Esc)">×</button>
        </div>
        <div class="shortcuts-help-content">
          ${this.renderShortcuts()}
        </div>
        <div class="shortcuts-help-footer">
          <p>Press <kbd>?</kbd> to toggle this help • <kbd>Esc</kbd> to close</p>
        </div>
      </div>
    `

    document.body.appendChild(this.overlay)

    const closeBtn = this.overlay.querySelector('.shortcuts-help-close')
    closeBtn?.addEventListener('click', () => this.hide())

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide()
      }
    })
  }

  private renderShortcuts(): string {
    const groups = this.getShortcutGroups()

    return `
      <div class="shortcuts-help-grid">
        ${groups.map(group => `
          <div class="shortcuts-help-group">
            <h3>${group.title}</h3>
            <div class="shortcuts-help-list">
              ${group.shortcuts.map(shortcut => `
                <div class="shortcuts-help-item">
                  <div class="shortcuts-help-keys">${shortcut.keys}</div>
                  <div class="shortcuts-help-desc">${shortcut.description}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  private getShortcutGroups(): ShortcutGroup[] {
    const focusBindings = keybindManager.getBindings('focus-toggle')
    const voiceBindings = keybindManager.getBindings('voice-toggle')

    return [
      {
        title: 'Navigation',
        shortcuts: [
          {
            keys: formatKeybinds(focusBindings),
            description: 'Switch focus: Workshop ↔ Activity Feed'
          },
          {
            keys: '<kbd>1</kbd>-<kbd>6</kbd>',
            description: 'Jump to session 1-6'
          },
          {
            keys: '<kbd>Alt</kbd>+<kbd>1</kbd>-<kbd>6</kbd>',
            description: 'Jump to session (works in inputs)'
          },
          {
            keys: '<kbd>0</kbd> or <kbd>`</kbd>',
            description: 'Overview mode (all sessions)'
          },
          {
            keys: '<kbd>F</kbd>',
            description: 'Toggle follow-active mode'
          },
          {
            keys: '<kbd>Alt</kbd>+<kbd>A</kbd>',
            description: 'Go to next session needing attention'
          },
        ]
      },
      {
        title: 'Session Management',
        shortcuts: [
          {
            keys: '<kbd>Alt</kbd>+<kbd>N</kbd>',
            description: 'Create new session'
          },
          {
            keys: '<kbd>Ctrl</kbd>+<kbd>C</kbd>',
            description: 'Interrupt working session (or copy if text selected)'
          },
          {
            keys: '<kbd>Enter</kbd>',
            description: 'Send prompt'
          },
          {
            keys: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd>',
            description: 'New line in prompt'
          },
        ]
      },
      {
        title: 'Activity Feed',
        shortcuts: [
          {
            keys: '<kbd>Alt</kbd>+<kbd>Space</kbd>',
            description: 'Expand most recent "show more"'
          },
        ]
      },
      {
        title: 'Visual Tools',
        shortcuts: [
          {
            keys: '<kbd>D</kbd>',
            description: 'Toggle draw mode'
          },
          {
            keys: '<kbd>1</kbd>-<kbd>6</kbd>',
            description: 'Select color (in draw mode)'
          },
          {
            keys: '<kbd>0</kbd>',
            description: 'Eraser (in draw mode)'
          },
          {
            keys: '<kbd>Q</kbd> / <kbd>E</kbd>',
            description: 'Decrease / increase brush size'
          },
          {
            keys: '<kbd>R</kbd>',
            description: 'Toggle 3D stacking (in draw mode)'
          },
          {
            keys: '<kbd>X</kbd>',
            description: 'Clear all painted hexes'
          },
          {
            keys: '<kbd>P</kbd>',
            description: 'Toggle station panels (tool history)'
          },
        ]
      },
      {
        title: 'Voice & Audio',
        shortcuts: [
          {
            keys: formatKeybinds(voiceBindings),
            description: 'Toggle voice recording'
          },
        ]
      },
      {
        title: 'Extended Keys',
        shortcuts: [
          {
            keys: '<kbd>Q</kbd>-<kbd>Y</kbd>',
            description: 'Sessions 7-12'
          },
          {
            keys: '<kbd>A</kbd>-<kbd>H</kbd>',
            description: 'Sessions 13-18'
          },
          {
            keys: '<kbd>Z</kbd>-<kbd>N</kbd>',
            description: 'Sessions 19-24'
          },
        ]
      },
      {
        title: 'Developer',
        shortcuts: [
          {
            keys: '<kbd>Alt</kbd>+<kbd>D</kbd>',
            description: 'Toggle dev panel (animation testing)'
          },
          {
            keys: '<kbd>?</kbd>',
            description: 'Show this help'
          },
        ]
      },
    ]
  }

  private setupKeyboardHandler(): void {
    document.addEventListener('keydown', (e) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      const isModal = document.querySelector('.modal.visible, .shortcuts-help-overlay:not(.hidden)') !== null

      if (e.key === '?' && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && !inInput) {
        e.preventDefault()
        this.toggle()
        return
      }

      if (e.key === 'Escape' && this.visible) {
        e.preventDefault()
        this.hide()
        return
      }
    })
  }

  toggle(): void {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  show(): void {
    if (!this.overlay) return
    this.overlay.classList.remove('hidden')
    this.visible = true
  }

  hide(): void {
    if (!this.overlay) return
    this.overlay.classList.add('hidden')
    this.visible = false
  }

  isVisible(): boolean {
    return this.visible
  }
}

export const shortcutsHelp = new ShortcutsHelp()
