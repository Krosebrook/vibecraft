/**
 * OnboardingWizard - AI-guided interactive tutorial for new users
 *
 * Features:
 * - Multi-step walkthrough
 * - Highlights key features
 * - Skippable
 * - localStorage persistence
 */

export interface OnboardingStep {
  id: string
  title: string
  content: string
  position: 'center' | 'top' | 'bottom' | 'left' | 'right'
  targetSelector?: string
  highlightSelector?: string
  action?: () => void
}

const STORAGE_KEY = 'vibecraft-onboarding-completed'
const ONBOARDING_VERSION = '1'

export class OnboardingWizard {
  private overlay: HTMLElement | null = null
  private modal: HTMLElement | null = null
  private currentStepIndex: number = 0
  private steps: OnboardingStep[] = []
  private isActive: boolean = false
  private highlightElement: HTMLElement | null = null

  constructor() {
    this.steps = this.defineSteps()
  }

  private defineSteps(): OnboardingStep[] {
    return [
      {
        id: 'welcome',
        title: 'Welcome to Vibecraft',
        content: `
          <p>Vibecraft visualizes Claude Code's activity in real-time as an interactive 3D workshop.</p>
          <p>Watch as Claude moves between workstations when using different tools (Read, Edit, Bash, etc.).</p>
          <p>Let's take a quick tour of the key features.</p>
        `,
        position: 'center',
      },
      {
        id: 'workshop',
        title: 'The Workshop',
        content: `
          <p>This is the <strong>3D Workshop</strong> where you'll see Claude working.</p>
          <p>Each hexagonal platform represents a Claude session. Multiple sessions can run simultaneously.</p>
          <p>Use your mouse to <strong>rotate, pan, and zoom</strong> the camera:</p>
          <ul>
            <li><strong>Left click + drag</strong>: Rotate view</li>
            <li><strong>Right click + drag</strong>: Pan view</li>
            <li><strong>Scroll wheel</strong>: Zoom in/out</li>
          </ul>
        `,
        position: 'center',
        targetSelector: 'canvas',
      },
      {
        id: 'sessions',
        title: 'Session Management',
        content: `
          <p>The <strong>Sessions Panel</strong> shows all your active Claude instances.</p>
          <p>Each session can have a unique name, directory, and configuration.</p>
          <p>Create a new session by clicking the zone or pressing <kbd>Alt+N</kbd>.</p>
          <p>Session status indicators:</p>
          <ul>
            <li><span style="color: #4ade80">🟢 Green</span>: Idle / waiting for input</li>
            <li><span style="color: #22d3ee">🔵 Cyan</span>: Working on a task</li>
            <li><span style="color: #fbbf24">🟡 Amber</span>: Needs attention (question/permission)</li>
            <li><span style="color: #f87171">🔴 Red</span>: Offline</li>
          </ul>
        `,
        position: 'left',
        highlightSelector: '#sessions-panel',
      },
      {
        id: 'feed',
        title: 'Activity Feed',
        content: `
          <p>The <strong>Activity Feed</strong> shows a real-time log of everything Claude does:</p>
          <ul>
            <li>User prompts</li>
            <li>Tool uses (Read, Edit, Bash, etc.)</li>
            <li>Claude's responses</li>
            <li>Errors and notifications</li>
          </ul>
          <p>Press <kbd>Tab</kbd> or <kbd>Esc</kbd> to switch focus between the Workshop and Activity Feed.</p>
        `,
        position: 'right',
        highlightSelector: '#activity-feed',
      },
      {
        id: 'prompt',
        title: 'Send Prompts',
        content: `
          <p>Use the <strong>Prompt Input</strong> to send messages to Claude:</p>
          <ul>
            <li><kbd>Enter</kbd>: Send prompt</li>
            <li><kbd>Ctrl+Enter</kbd>: New line</li>
            <li><strong>Toggle "Send to tmux"</strong> to route prompts directly to your Claude session</li>
          </ul>
          <p>You can also use <strong>voice input</strong> by clicking the microphone icon or pressing <kbd>Ctrl+M</kbd>.</p>
        `,
        position: 'bottom',
        highlightSelector: '#prompt-panel',
      },
      {
        id: 'shortcuts',
        title: 'Keyboard Shortcuts',
        content: `
          <p>Vibecraft is built for speed. Here are some essential shortcuts:</p>
          <ul>
            <li><kbd>1</kbd>-<kbd>6</kbd>: Jump to session 1-6</li>
            <li><kbd>Alt+1</kbd>-<kbd>Alt+6</kbd>: Jump to session (works in inputs)</li>
            <li><kbd>0</kbd> or <kbd>\`</kbd>: Overview mode (see all sessions)</li>
            <li><kbd>Alt+N</kbd>: Create new session</li>
            <li><kbd>F</kbd>: Toggle follow-active mode</li>
            <li><kbd>D</kbd>: Toggle draw mode (paint hexagons)</li>
            <li><kbd>P</kbd>: Toggle station panels (tool history)</li>
            <li><kbd>?</kbd>: Show all shortcuts</li>
          </ul>
          <p>Press <kbd>?</kbd> anytime to see the full shortcuts reference.</p>
        `,
        position: 'center',
      },
      {
        id: 'features',
        title: 'Advanced Features',
        content: `
          <p>Some hidden gems to explore:</p>
          <ul>
            <li><strong>Right-click zones</strong> to see session details, git status, and send quick commands</li>
            <li><strong>Draw mode</strong> (<kbd>D</kbd>): Paint hexagons with colors, create 3D structures</li>
            <li><strong>Text labels</strong>: Right-click empty hexagons to add text tiles</li>
            <li><strong>Station panels</strong> (<kbd>P</kbd>): See recent tool activity at each workstation</li>
            <li><strong>Sound effects</strong>: Toggle in settings for audio feedback</li>
            <li><strong>Spatial audio</strong>: Sounds positioned in 3D space based on zone location</li>
          </ul>
        `,
        position: 'center',
      },
      {
        id: 'complete',
        title: 'Ready to Go!',
        content: `
          <p>You're all set! Here's what to do next:</p>
          <ol>
            <li>Make sure Vibecraft is running (<code>npx vibecraft</code>)</li>
            <li>Open Claude Code in your terminal</li>
            <li>Start coding and watch the workshop come alive</li>
          </ol>
          <p>Need help? Press <kbd>?</kbd> for shortcuts or check the documentation.</p>
          <p><strong>Tip:</strong> You can restart this tutorial anytime from the settings menu.</p>
        `,
        position: 'center',
      },
    ]
  }

  shouldShow(): boolean {
    if (this.isCompleted()) return false
    return true
  }

  isCompleted(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === ONBOARDING_VERSION
  }

  markCompleted(): void {
    localStorage.setItem(STORAGE_KEY, ONBOARDING_VERSION)
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  start(): void {
    if (this.isActive) return

    this.isActive = true
    this.currentStepIndex = 0
    this.createOverlay()
    this.showStep(0)
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div')
    this.overlay.id = 'onboarding-overlay'
    this.overlay.className = 'onboarding-overlay'
    document.body.appendChild(this.overlay)

    this.modal = document.createElement('div')
    this.modal.className = 'onboarding-modal'
    this.overlay.appendChild(this.modal)

    this.highlightElement = document.createElement('div')
    this.highlightElement.className = 'onboarding-highlight'
    this.overlay.appendChild(this.highlightElement)
  }

  private showStep(index: number): void {
    if (!this.modal || index < 0 || index >= this.steps.length) return

    this.currentStepIndex = index
    const step = this.steps[index]

    this.modal.className = `onboarding-modal onboarding-modal--${step.position}`
    this.modal.innerHTML = `
      <div class="onboarding-header">
        <div class="onboarding-progress">
          <div class="onboarding-progress-bar" style="width: ${((index + 1) / this.steps.length) * 100}%"></div>
        </div>
        <div class="onboarding-step-count">Step ${index + 1} of ${this.steps.length}</div>
      </div>
      <div class="onboarding-body">
        <h2 class="onboarding-title">${step.title}</h2>
        <div class="onboarding-content">${step.content}</div>
      </div>
      <div class="onboarding-footer">
        <button class="onboarding-btn onboarding-btn--skip" data-action="skip">Skip Tutorial</button>
        <div class="onboarding-nav">
          ${index > 0 ? '<button class="onboarding-btn onboarding-btn--back" data-action="back">← Back</button>' : ''}
          ${index < this.steps.length - 1
            ? '<button class="onboarding-btn onboarding-btn--next" data-action="next">Next →</button>'
            : '<button class="onboarding-btn onboarding-btn--complete" data-action="complete">Get Started!</button>'
          }
        </div>
      </div>
    `

    this.modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.target as HTMLElement).dataset.action
        if (action === 'next') this.next()
        else if (action === 'back') this.previous()
        else if (action === 'skip') this.skip()
        else if (action === 'complete') this.complete()
      })
    })

    this.updateHighlight(step)

    if (step.action) {
      step.action()
    }
  }

  private updateHighlight(step: OnboardingStep): void {
    if (!this.highlightElement) return

    if (step.highlightSelector) {
      const target = document.querySelector(step.highlightSelector) as HTMLElement
      if (target) {
        const rect = target.getBoundingClientRect()
        this.highlightElement.style.display = 'block'
        this.highlightElement.style.top = `${rect.top - 8}px`
        this.highlightElement.style.left = `${rect.left - 8}px`
        this.highlightElement.style.width = `${rect.width + 16}px`
        this.highlightElement.style.height = `${rect.height + 16}px`
      }
    } else {
      this.highlightElement.style.display = 'none'
    }
  }

  next(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.showStep(this.currentStepIndex + 1)
    }
  }

  previous(): void {
    if (this.currentStepIndex > 0) {
      this.showStep(this.currentStepIndex - 1)
    }
  }

  skip(): void {
    this.close()
  }

  complete(): void {
    this.markCompleted()
    this.close()
  }

  private close(): void {
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
    }
    this.modal = null
    this.highlightElement = null
    this.isActive = false
  }
}

export const onboardingWizard = new OnboardingWizard()
