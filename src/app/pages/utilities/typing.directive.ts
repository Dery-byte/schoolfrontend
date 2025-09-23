// src/app/typing.directive.ts
import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  NgZone
} from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Directive({
  selector: '[appTyping]'
})
export class TypingDirective implements AfterViewInit, OnDestroy {
  @Input() appTyping: string | string[] = ''; // can accept single string or array
  @Input() speed = 80;          // ms per character
  @Input() eraseSpeed = 50;     // ms per character when erasing
  @Input() delayBetween = 1200; // pause after finishing typing before erasing
  @Input() startDelay = 0;      // initial delay
  @Input() showCursor = true;
  @Input() cursorChar = '|';

  private textSpan!: HTMLElement;
  private cursorEl: HTMLElement | null = null;
  private sub: Subscription | null = null;
  private texts: string[] = [];
  private currentIndex = 0;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    this.setupElements();
    this.texts = Array.isArray(this.appTyping) ? this.appTyping : [this.appTyping];
    if (this.texts.length) {
      setTimeout(() => this.loopTexts(), this.startDelay);
    }
  }

  private setupElements(): void {
    this.textSpan = this.renderer.createElement('span');
    this.renderer.addClass(this.textSpan, 'typing-text');
    this.renderer.setProperty(this.textSpan, 'textContent', '');
    this.renderer.setProperty(this.el.nativeElement, 'textContent', '');
    this.renderer.appendChild(this.el.nativeElement, this.textSpan);

    if (this.showCursor) {
      this.cursorEl = this.renderer.createElement('span');
      this.renderer.addClass(this.cursorEl, 'typing-cursor');
      this.renderer.setProperty(this.cursorEl, 'textContent', this.cursorChar);
      this.renderer.appendChild(this.el.nativeElement, this.cursorEl);
    }
  }

  private async loopTexts() {
    while (true) {
      const text = this.texts[this.currentIndex];
      await this.typeText(text);
      await this.sleep(this.delayBetween);
      await this.eraseText();
      this.currentIndex = (this.currentIndex + 1) % this.texts.length;
    }
  }

  private typeText(text: string): Promise<void> {
    return new Promise(resolve => {
      let i = 0;
      this.renderer.setProperty(this.textSpan, 'textContent', '');
      this.ngZone.runOutsideAngular(() => {
        this.sub = timer(0, this.speed).subscribe(() => {
          this.textSpan.textContent += text.charAt(i);
          i++;
          if (i >= text.length) {
            this.sub?.unsubscribe();
            this.sub = null;
            resolve();
          }
        });
      });
    });
  }

  private eraseText(): Promise<void> {
    return new Promise(resolve => {
      let text = this.textSpan.textContent || '';
      this.ngZone.runOutsideAngular(() => {
        this.sub = timer(0, this.eraseSpeed).subscribe(() => {
          text = text.slice(0, -1);
          this.renderer.setProperty(this.textSpan, 'textContent', text);
          if (text.length === 0) {
            this.sub?.unsubscribe();
            this.sub = null;
            resolve();
          }
        });
      });
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
